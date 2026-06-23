---
sidebar_position: 5
---

# Create the issuer resource

The cert-manager issuer implements `czertainly-issuer.czertainly.com/v1alpha1` API that support both `CzertainlyClusterIssuer` and `CzertainlyIssuer` resources, and it allow you to configure the following `spec` field:

| Field                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Mandatory                                     |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `apiUrl`                           | URL to access the ILM platform API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | <span class="badge badge--success">YES</span> |
| `authSecretName`                   | Reference to a `kubernetes.io/tls` or `Opaque` Secret that is used to authenticate and authorize to the platform. The `Secret` must be in the same namespace as the referent. If the referent is a `CzertainlyClusterIssuer`, the reference instead refers to the resource with the given name in the configured 'cluster resource namespace', which is set as a flag on the controller component (and defaults to the namespace that the controller runs in).                                  | <span class="badge badge--success">YES</span> |
| `raProfileUuid`                    | UUID of the RA profile to use when managing certificates. You can get the UUID of configured RA profile in the platform. The user should have permission to use the RA profile.                                                                                                                                                                                                                                                                                                             | <span class="badge badge--success">YES</span> |
| `raProfileName`                    | Name of the RA profile to use when managing certificates. This is the name of configured RA profile in the platform. The user should have permission to use the RA profile.                                                                                                                                                                                                                                                                                                                 | <span class="badge badge--danger">NO</span>   |
| `caBundleSecretName`               | Reference to a `Secret` that contains the CA bundle to use when verifying the platform's serving certificates. The Secret must be in the same namespace as the referent and must contain 'ca.crt' in data. If the referent is a `CzertainlyClusterIssuer`, the reference instead refers to the resource with the given name in the configured 'cluster resource namespace', which is set as a flag on the controller component (and defaults to the namespace that the controller runs in). | <span class="badge badge--danger">NO</span>   |
| [`httpTransport`](#http-transport) | Settings for HTTP client and transport used to communicate with the platform API and can be used to override default timeouts and connection settings.                                                                                                                                                                                                                                                                                                                                          | <span class="badge badge--danger">NO</span>   |

## Authentication

The cert-manager issuer uses the `authSecretName` referenced secret to authenticate and authorize to the ILM platform. The secret must be:
- a `kubernetes.io/tls` to establish mutual TLS connection with the platform;
- or an `Opaque` secret containing the OAuth 2.0 client credentials to authenticate with the platform.

The secret with the name `ilm-credentials` is created and can be used as the `authSecretName` in the cert-manager issuer.

### mTLS authentication

To create the [`kubernetes.io/tls`](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) secret, you can use your existing certificate and key pair and create the secret with the following command:
```bash
kubectl create secret tls ilm-credentials \
  --namespace czertainly-issuer \
  --cert=<path to cert file> \
  --key=<path to key file>
```

### OAuth 2.0 client credentials authentication

To create the [`Opaque`](https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets) secret for OAuth 2.0 client credentials, you can use the following command:
```bash
kubectl create secret generic ilm-credentials \
  --namespace czertainly-issuer \
  --from-literal=client_id=<your client id> \
  --from-literal=client_secret=<your client secret> \
  --from-literal=token_url=<your token url> \
  --from-literal=scopes=<your comma-separated scopes>
```

## CA Bundle

The cert-manager issuer uses the `caBundleSecretName` referenced secret to verify the platform's serving certificates, if needed. The secret must contain the `ca.crt` in the `data` field.

You can create `generic` secret with trusted certificates with the following command:
```bash
kubectl create secret generic issuer-ilm-ca-bundle \
  --namespace czertainly-issuer \
  --from-file=ca.crt=<path-to-ca-bundle-file>
```

## HTTP Transport

The `httpTransport` field allows you to customize the HTTP client and transport settings used to communicate with the platform API. You can specify the following sub-fields:

| Field                   | Description                                                                                                                                                                                                                                                                                                                                          | Default Value |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `dialTimeout`           | Maximum amount of time a dial will wait for a connect to complete.                                                                                                                                                                                                                                                                                   | `5s`          |
| `dialKeepAlive`         | Interval between keep-alive probes for an active network connection.                                                                                                                                                                                                                                                                                 | `30s`         |
| `tlsHandshakeTimeout`   | Maximum amount of time waiting to wait for a TLS handshake. Zero means no timeout.                                                                                                                                                                                                                                                                   | `5s`          |
| `responseHeaderTimeout` | Specifies the amount of time to wait for a server's response headers after fully writing the request (including its body, if any). This time does not include the time to read the response body.                                                                                                                                                    | `20s`         |
| `expectContinueTimeout` | Specifies the amount of time to wait for a server's first response headers after fully writing the request headers if the request has an "Expect: 100-continue" header. Zero means no timeout and causes the body to be sent immediately, without waiting for the server to approve. This time does not include the time to send the request header. | `1s`          |
| `idleConnTimeout`       | Maximum amount of time an idle (keep-alive) connection will remain idle before closing itself. Zero means no limit.                                                                                                                                                                                                                                  | `90s`         |
| `maxIdleConns`          | Maximum number of idle (keep-alive) connections across all hosts. Zero means no limit.                                                                                                                                                                                                                                                               | `200`         |
| `maxIdleConnsPerHost`   | Controls the maximum idle (keep-alive) connections to keep per-host.                                                                                                                                                                                                                                                                                 | `20`          |
| `clientTimeout`         | Time limit for requests made. The timeout includes connection time, any redirects, and reading the response body. A Timeout of zero means no timeout.                                                                                                                                                                                                | `30s`         |

## Create `CzertainlyClusterIssuer` or `CzertainlyIssuer`

The following is an example of the `CzertainlyClusterIssuer` resource:

```yaml
apiVersion: czertainly-issuer.czertainly.com/v1alpha1
kind: CzertainlyClusterIssuer
metadata:
  labels:
    app.kubernetes.io/name: ilm-clusterissuer
  name: ilm-clusterissuer
spec:
  authSecretName: "ilm-credentials"
  apiUrl: "https://<ILM_HOSTNAME>/api"
  raProfileUuid: "9cb76b6a-c291-4e23-b11a-bb3da76adbc6"
```

The following is an example of the `CzertainlyIssuer` resource:

```yaml
apiVersion: czertainly-issuer.czertainly.com/v1alpha1
kind: CzertainlyIssuer
metadata:
  labels:
    app.kubernetes.io/name: ilm-issuer
  name: ilm-issuer
  namespace: default
spec:
  authSecretName: "ilm-credentials"
  apiUrl: "https://<ILM_HOSTNAME>/api"
  raProfileUuid: "9cb76b6a-c291-4e23-b11a-bb3da76adbc6"
  raProfileName: "My RA Profile"
  caBundleSecretName: "issuer-ilm-ca-bundle"
```

To create the `CzertainlyClusterIssuer` or `CzertainlyIssuer`, save the resource definition to a file and apply it to the Kubernetes cluster:
```bash
kubectl apply -f ilm-issuer.yaml
```

You can get all available `CzertainlyClusterIssuer` or `CzertainlyIssuer` resources by running:
```bash
kubectl get czertainlyclusterissuers.czertainly-issuer.czertainly.com
kubectl get czertainlyissuers.czertainly-issuer.czertainly.com \
  --namespace <namespace>
```

To validate the `CzertainlyClusterIssuer` or `CzertainlyIssuer` resource, you can describe the resource:
```bash
kubectl describe czertainlyclusterissuers.czertainly-issuer.czertainly.com ilm-clusterissuer
kubectl describe czertainlyissuers.czertainly-issuer.czertainly.com ilm-issuer \
  --namespace <namespace>
```

The status conditions of the resource will be updated once the cert-manager issuer is ready:

```bash
kubectl get czertainlyclusterissuers.czertainly-issuer.czertainly.com ilm-clusterissuer \
  -o json \
  | jq .status.conditions
kubectl get czertainlyissuers.czertainly-issuer.czertainly.com ilm-issuer \
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
