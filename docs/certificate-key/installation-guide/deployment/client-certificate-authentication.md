---
sidebar_position: 7
---

# Client Certificate Authentication

Users can sign in to the platform with a client certificate. The TLS terminator in front of the platform, such as an ingress controller, reverse proxy or load balancer, requests the certificate in the TLS handshake, which proves that the client holds its private key. It forwards the certificate to `Core` in a request header, and `Auth` validates the certificate chain against the [trusted certificates](../create-trusted-certificates.md) and signs the request in as the user that the certificate is associated with.

You need a TLS terminator that can request a client certificate and set a request header from it, and access to the platform's trusted-certificate and header settings.

## 1. Register the client certificate

Associate the client's own certificate with an enabled [user](../../concept-design/architecture/access-control/users.md), and assign the roles that the user needs. You can upload the certificate, or select one that the platform already holds, which must be issued, not archived and not associated with another user. Associating the issuing CA does not register the clients it issued. For the first administrator, follow [Create Super Administrator](../create-super-administrator.md).

## 2. Trust the client CAs

Add the root CA of the client certificates to the [trusted certificates](../create-trusted-certificates.md), together with any intermediate CA that the TLS terminator does not forward with the client certificate. A forwarded certificate only helps `Auth` build the chain to a trusted root; it never becomes trusted itself.

## 3. Configure the TLS terminator

On the platform host, the TLS terminator must:

- request a client certificate without requiring one, so that users without a certificate can still sign in through OIDC
- verify the certificate against the client CAs; in a passthrough mode, which forwards the certificate without verifying it, `Auth` is the only trust check
- remove any certificate header that the caller sent, on every request, and set the header only from the TLS handshake

Protect the connection from the TLS terminator to the platform, restrict direct access to the API gateway and `Core`, and do not cache authenticated responses at a CDN or shared proxy.

`Core` reads the certificate from one header, `ssl-client-cert` by default. To select another, set `auth.header.certificate` with Helm or `spec.core.clientCertHeader` with the Operator. The content of the header determines its format; see [Header formats](#header-formats).

Each certificate header must fit in 8 KB at the platform's API gateway; a larger one is rejected with HTTP 400. Forward only the intermediates that are not in the trusted certificates.

### Built-in ingress (ingress-nginx)

With `ingress.enabled: true`, the Helm chart renders an ingress-nginx Ingress that requests an optional client certificate, verifies it against the trusted certificates and forwards it in the `ssl-client-cert` header. It needs no further configuration; with `ingress.class: traefik`, configure Traefik as described below. The Operator renders no client-certificate annotations; add them to `spec.edge.annotations` as in the [Platform resource example](deployment-operator/custom-resources/platform.md#read-back-the-generated-credentials).

### Traefik

Use the [PassTLSClientCert](https://doc.traefik.io/traefik/reference/routing-configuration/http/middlewares/passtlsclientcert/) middleware with `pem: true`, and set the header in `Core` to `X-Forwarded-Tls-Client-Cert`. PassTLSClientCert leaves the caller's header in place when no client certificate is presented, so put a clearing middleware in front of it:

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: clear-client-certificate
spec:
  headers:
    customRequestHeaders:
      ssl-client-cert: ""
      X-Forwarded-Tls-Client-Cert: ""
      X-Forwarded-Tls-Client-Cert-Info: ""
      Client-Cert: ""
      Client-Cert-Chain: ""
      X-Forwarded-Client-Cert: ""
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: forward-client-certificate
spec:
  passTLSClientCert:
    pem: true
```

Attach both middlewares, in that order, to every router of the platform host, and give the host a `TLSOption` with `clientAuth.clientAuthType: VerifyClientCertIfGiven` and `clientAuth.secretNames` selecting the client CAs.

As recommended hardening on Traefik v3.7.12 or later (v2.11.56 or later on 2.11), also set [`aliasHeadersStrategy`](https://doc.traefik.io/traefik/security/header-aliases/) to `delete` on the entry point, for example `--entryPoints.websecure.http.aliasHeadersStrategy=delete`. It removes every request header whose name contains a character other than a letter, a digit or a dash, for every host on that entry point.

## 4. Verify authentication

| Request | Expected result |
|---|---|
| No client certificate | Ordinary HTTPS and OIDC sign-in work. |
| Certificate of an enabled, registered user | Signed in as that user, with the user's permissions. |
| Unknown certificate, or certificate of a disabled user | HTTP 401. |
| Certificate from an unrelated CA | Rejected in the TLS handshake, or HTTP 401. |
| Certificate header sent by the caller without a client certificate | The header is removed; the request is not signed in by certificate. |
| Malformed or untrusted certificate header that reaches `Core` | HTTP 401, without falling back to another sign-in method. |

## Renew a client certificate

A user has one certificate association, so a renewal is a cutover. Keep another way to sign in, such as OIDC, until the renewed certificate works.

1. Issue the renewed certificate. If a new CA issues it, [rotate the CAs](#rotate-cas) first.
2. Replace the user's certificate with the renewed one, and switch the client to it.
3. Check that the renewed certificate signs in.

`Core` instances other than the one that processed the change accept the old certificate until their [cached sign-in](../../concept-design/architecture/caching.md#configuration) expires. Restart every `Core` instance to end this at once.

## Revoke access

Sign-in does not check revocation, so a revoked certificate keeps signing in while it is associated with an enabled user. To cut off a certificate, remove it from its user or disable the user; other `Core` instances follow when their cached sign-in expires. To enforce CRL or OCSP checks, configure them at the TLS terminator.

## Rotate CAs

Add the new CA to the trusted certificates, and to the client CAs of the TLS terminator if they are configured separately, before you issue certificates from it. Then [renew the client certificates](#renew-a-client-certificate), and remove the old CA once no user depends on it.

Restart `Auth` to apply a change to the trusted certificates at once. When you remove a CA, also restart every `Core` instance after `Auth` is ready, so that no cached sign-in outlives the removal.

## Troubleshooting

| Symptom | Check |
|---|---|
| TLS handshake fails | The client CAs of the TLS terminator, the validity of the certificate, and that a client certificate is optional on the platform host. |
| Registered client gets HTTP 401 | That this exact certificate is associated with an enabled user, that `Core` reads the header the TLS terminator sets, and that `Auth` trusts the root CA. |
| Client of an intermediate CA gets HTTP 401 | Forward the intermediate, or add it to the trusted certificates. |
| OIDC sign-in fails without a certificate | Whether the TLS terminator requires a certificate, or forwards an empty header. |

## Header formats

The content of the header determines its format, and the first certificate in it is always the identity.

| Format | Content |
|---|---|
| Certificate | Base64 DER, PEM, URL-encoded PEM or Base64-encoded PEM. A chain is a sequence of PEM certificates or a comma-separated list, leaf first. |
| [RFC 9440](https://www.rfc-editor.org/rfc/rfc9440.html) | The leaf as `:base64(DER):`, with intermediates in `Client-Cert-Chain`. |
| Text XFCC | One element whose `Cert` holds the URL-encoded PEM leaf; an optional `Chain` starts with the same leaf. |

Common TLS terminators forward the certificate as follows:

| TLS terminator | Header and format | Header to set in `Core` |
|---|---|---|
| [ingress-nginx](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#client-certificate-authentication) | `ssl-client-cert`, URL-encoded PEM leaf | `ssl-client-cert` |
| [NGINX](https://nginx.org/en/docs/http/ngx_http_ssl_module.html#variables) | `$ssl_client_escaped_cert`, URL-encoded PEM leaf, in a header you choose | That header |
| Traefik | `X-Forwarded-Tls-Client-Cert`, comma-separated Base64 DER, leaf first | `X-Forwarded-Tls-Client-Cert` |
| HAProxy | RFC 9440 leaf: delete `Client-Cert` and `Client-Cert-Chain`, then `http-request set-header Client-Cert :%[ssl_c_der,base64]: if { ssl_c_used }` | `Client-Cert` |
| [Envoy](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers#x-forwarded-client-cert), [Istio](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#Topology) | `X-Forwarded-Client-Cert`, text XFCC, with `SANITIZE_SET` and `cert: true` | `X-Forwarded-Client-Cert` |
| [CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/viewer-mtls-headers.html) | `CloudFront-Viewer-Cert-Pem`, URL-encoded PEM leaf; RFC 9440 in passthrough mode | `CloudFront-Viewer-Cert-Pem`, or `Client-Cert` in passthrough mode |
| [Cloudflare](https://developers.cloudflare.com/ssl/client-certificates/forward-a-client-certificate/) | RFC 9440, set by request header rules for verified certificates | `Client-Cert` |
| [AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/mutual-authentication.html) | URL-encoded PEM: the leaf in `X-Amzn-Mtls-Clientcert-Leaf` in verify mode, the chain in `X-Amzn-Mtls-Clientcert` in passthrough mode | The header of the mode |
