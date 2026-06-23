---
sidebar_position: 11
---

# Kubernetes cert-manager

One of the most common use cases for ACME is to manage certificates for containerized applications and environment like Kubernetes.

[`cert-manager`](https://cert-manager.io/) adds certificates and certificate issuers as resource types in Kubernetes clusters, and simplifies the process of obtaining, renewing, and using those certificates. It can issue certificates from a variety of supported sources, including ACME compliant servers.

For more information about `cert-manager`, refer to the [cert-manager documentation](https://cert-manager.io/docs/).

CZERTAINLY platform supports ACME implementation according to the [RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555). This guide shows, how you can use `cert-manager` to manage certificates using ACME protocol and certificate management services controlled by the platform. In this combination, `cert-manager` can manage certificates provided by literally any certification authority.

## Prerequisites

Before you can configure `cert-manager` with the CZERTAINLY, you need to have the following:
- Kubernetes cluster with `cert-manager` installed
- Configured at least one `RA Profile` certificate service
- Access to HTTP or DNS resources, that will be used to validate ACME challenges
- ACME protocol enabled according to the [Enable ACME](enable-acme.md)

For this guide, we will use `http-01` challenge validation, but the `dns-01` can be also configured and the process is the same.

In case you do not have the `cert-manager` installed, follow the [installation instructions](https://cert-manager.io/docs/installation/) to install it.

## Create new `ClusterIssuer`

`ClusterIssuer` referencing our configured ACME service can be configured using the following manifest file:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: clusterissuer-ilm-acme
  #namespace: default
spec:
  acme:
    server: https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory
    # Email address used for ACME registration
    email: www@example.com
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: issuer-ilm-acme-secret
    # Enable HTTP01 validations
    solvers:
    # An empty 'selector' means that this solver matches all domains
    - selector: {}
      http01:
        ingress:
          class: public
```

You should adjust this manifest according to your specific Kubernetes cluster. If the CZERTAINLY access point is using TLS certificate issued from private certification authority, you should include the CA certificate in `cert-manager` configuration, otherwise it will reject communication.

When you are ready, you can apply the manifest. This will start the communication with the ACME server and register the ACME client. You can check if the registration of ACME client was successful by [listing all ACME Clients](/api/core-acme#tag/ACME-Account-Management/operation/listAcmeAccounts) in the platform and checking the state of the `ClusterIssuer`:
```bash
kubectl describe -n cert-manager clusterissuers.cert-manager.io clusterissuer-ilm-acme
```

You should see the status of the `ClusterIssuer` indicating `ACMEAccountRegistered`:
```yaml
...
Status:
  Acme:
    Last Registered Email:  www@example.com
    Uri:                    https://[domain]:[port]/api/v1/protocols/acme/cm/acct/KUAkYavhiMI
  Conditions:
    Last Transition Time:  2022-01-29T16:25:45Z
    Message:               The ACME account was registered with the ACME server
    Observed Generation:   1
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
Events:                    <none>
```

That means that the ACME client was registered successfully, and you can start managing certificates.

## Request certificate

You can try to issue certificate using the following manifest:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: cert-www-example-com
  namespace: default
spec:
  secretName: cert-secret-www-example-com
  renewBefore: 365h # 15d
  issuerRef:
    name: clusterissuer-ilm-acme
    kind: ClusterIssuer
  commonName: www.example.com
  dnsNames:
  - www.example.com
```

Applying this manifest in Kubernetes environment will start the ACME certificate issuing process. The brief steps what the `cert-manager` will do are:
- generate new key pair and CSR, and store in the Secret
- create Order resource in the ACME server
- distribute the Challenge for validation
- ask ACME server for the Challenge to be validated
- sends the CSR to the ACME server to finalize
- download the certificate from the ACME server

You can check the status of certificate resource in Kubernetes to see the result of the certificate issuing process:
```bash
kubectl describe certificates.cert-manager.io cert-www-example-com
```

When the certificate was issued and stored, you will see similar output:
```yaml
...
Status:
  Conditions:
    Last Transition Time:  2022-02-03T10:33:52Z
    Message:               Certificate is up to date and has not expired
    Observed Generation:   1
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2024-02-03T10:22:51Z
  Not Before:              2022-02-03T10:22:51Z
  Renewal Time:            2024-01-19T05:22:51Z
  Revision:                1
Events:                    <none>
```

The issued certificate is also included in the certificate inventory of the platform.
From now on, the `cert-manager` will renew the certificate automatically.
