---
sidebar_position: 5
---

# Create CZERTAINLY Issuer

The CZERTAINLY Issuer implements `czertainly-issuer.czertainly.com/v1alpha1` API that support both `CzertainlyClusterIssuer` and `CzertainlyIssuer` resources, and it allow you to configure the following `spec` field:

| Field                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Mandatory                                     |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `apiUrl`             | URL to access CZERTAINLY platform API                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | <span class="badge badge--success">YES</span> |
| `authSecretName`     | Reference to a `kubernetes.io/tls` or `Opaque` Secret that is used to authenticate and authorize to CZERTAINLY platform. The `Secret` must be in the same namespace as the referent. If the referent is a `CzertainlyClusterIssuer`, the reference instead refers to the resource with the given name in the configured 'cluster resource namespace', which is set as a flag on the controller component (and defaults to the namespace that the controller runs in)                                  | <span class="badge badge--success">YES</span> |
| `raProfileUuid`      | UUID of the RA profile to use when managing certificates. You can get the UUID of configured RA profile in the CZERTAINLY platform. The user should have permission to use the RA profile                                                                                                                                                                                                                                                                                                             | <span class="badge badge--success">YES</span> |
| `raProfileName`      | Name of the RA profile to use when managing certificates. This is the name of configured RA profile in the CZERTAINLY platform. The user should have permission to use the RA profile                                                                                                                                                                                                                                                                                                                 | <span class="badge badge--danger">NO</span>   |
| `caBundleSecretName` | Reference to a `Secret` that contains the CA bundle to use when verifying the CZERTAINLY platform's serving certificates. The Secret must be in the same namespace as the referent and must contain 'ca.crt' in data. If the referent is a `CzertainlyClusterIssuer`, the reference instead refers to the resource with the given name in the configured 'cluster resource namespace', which is set as a flag on the controller component (and defaults to the namespace that the controller runs in) | <span class="badge badge--danger">NO</span>   |

## Authentication

The CZERTAINLY Issuer uses the `authSecretName` referenced secret to authenticate and authorize to the CZERTAINLY platform. The secret must be:
- a `kubernetes.io/tls` to establish mutual TLS connection with the CZERTAINLY platform;
- or an `Opaque` secret containing the OAuth 2.0 client credentials to authenticate with the CZERTAINLY platform.

The secret with the name `czertainly-credentials` is created and can be used as the `authSecretName` in the CZERTAINLY Issuer.

### mTLS authentication

To create the [`kubernetes.io/tls`](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) secret, you can use your existing certificate and key pair and create the secret with the following command:
```bash
kubectl create secret tls czertainly-credentials \
  --namespace czertainly-issuer \
  --cert=<path to cert file> \
  --key=<path to key file>
```

### OAuth 2.0 client credentials authentication

To create the [`Opaque`](https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets) secret for OAuth 2.0 client credentials, you can use the following command:
```bash
kubectl create secret generic czertainly-credentials \
  --namespace czertainly-issuer \
  --from-literal=client_id=<your client id> \
  --from-literal=client_secret=<your client secret> \
  --from-literal=token_url=<your token url> \
  --from-literal=scopes=<your comma-separated scopes>
```

## CA Bundle

The CZERTAINLY Issuer uses the `caBundleSecretName` referenced secret to verify the CZERTAINLY platform's serving certificates, if needed. The secret must contain the `ca.crt` in the `data` field.

You can create `generic` secret with trusted certificates with the following command:
```bash
kubectl create secret generic issuer-czertainly-ca-bundle \
  --namespace czertainly-issuer \
  --from-file=ca.crt=<path-to-ca-bundle-file>
```

## Create `CzertainlyClusterIssuer` or `CzertainlyIssuer`

The following is an example of the `CzertainlyClusterIssuer` resource:

```yaml
apiVersion: czertainly-issuer.czertainly.com/v1alpha1
kind: CzertainlyClusterIssuer
metadata:
  labels:
    app.kubernetes.io/name: czertainly-clusterissuer
  name: czertainly-clusterissuer
spec:
  authSecretName: "czertainly-credentials"
  apiUrl: "https://my.czertainly.com/api"
  raProfileUuid: "9cb76b6a-c291-4e23-b11a-bb3da76adbc6"
```

The following is an example of the `CzertainlyIssuer` resource:

```yaml
apiVersion: czertainly-issuer.czertainly.com/v1alpha1
kind: CzertainlyIssuer
metadata:
  labels:
    app.kubernetes.io/name: czertainly-issuer
  name: czertainly-issuer
  namespace: default
spec:
  authSecretName: "czertainly-credentials"
  apiUrl: "https://my.czertainly.com/api"
  raProfileUuid: "9cb76b6a-c291-4e23-b11a-bb3da76adbc6"
  raProfileName: "My RA Profile"
  caBundleSecretName: "issuer-czertainly-ca-bundle"
```

To create the `CzertainlyClusterIssuer` or `CzertainlyIssuer`, save the resource definition to a file and apply it to the Kubernetes cluster:
```bash
kubectl apply -f czertainly-issuer.yaml
```

You can get all available `CzertainlyClusterIssuer` or `CzertainlyIssuer` resources by running:
```bash
kubectl get czertainlyclusterissuers.czertainly-issuer.czertainly.com
kubectl get czertainlyissuers.czertainly-issuer.czertainly.com \
  --namespace <namespace>
```

To validate the `CzertainlyClusterIssuer` or `CzertainlyIssuer` resource, you can describe the resource:
```bash
kubectl describe czertainlyclusterissuers.czertainly-issuer.czertainly.com czertainly-clusterissuer
kubectl describe czertainlyissuers.czertainly-issuer.czertainly.com czertainly-issuer \
  --namespace <namespace>
```

The status conditions of the resource will be updated once the CZERTAINLY Issuer is ready:

```bash
kubectl get czertainlyclusterissuers.czertainly-issuer.czertainly.com czertainly-issuer \
  -o json \
  | jq .status.conditions
kubectl get czertainlyissuers.czertainly-issuer.czertainly.com czertainly-issuer \
  --namespace <namespace> \
  -o json \
  | jq .status.conditions
```

```json
[
  {
    "lastTransitionTime": "2024-11-14T10:28:23Z",
    "message": "Success",
    "reason": "IssuerReconciler",
    "status": "True",
    "type": "Ready"
  }
]
```
