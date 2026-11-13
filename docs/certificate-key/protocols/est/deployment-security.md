---
sidebar_position: 4
---

# Deployment and Security

EST clients reach the platform at `https://<host>/.well-known/est`, through the TLS terminator and the API gateway in front of `Core`. This page lists what the deployment must provide, and what the platform does and does not keep about EST requests.

## API gateway route

The Helm chart and the Operator always render a Kong route for EST:

| Property           | Value                                                    |
|--------------------|----------------------------------------------------------|
| Route path         | `/.well-known/est`                                       |
| Upstream           | `Core`, path `/api/v1/protocols/.well-known/est`         |
| Methods            | `GET`, `POST`                                            |
| `strip_path`       | `true`                                                   |
| `preserve_host`    | `true`                                                   |
| Buffering          | `request_buffering: false`, `response_buffering: false` |

A custom Kong configuration replaces the whole generated configuration, so it must add an equivalent route.

`Core` builds the EST URLs that the administrator interface and the API show from the scheme and host of the request that reads them. Behind an edge such as an ingress controller or load balancer, set `apiGateway.trustedIps` with Helm, or `spec.gateway.trustedIps` with the Operator, to the address range of the edge, so that Kong honors its `X-Forwarded-*` headers and the URLs carry the platform's public address.

## TLS and client certificates

EST relies on TLS to protect the exchange. Serve the platform host with TLS 1.2 or later, since HTTP Basic credentials and server-generated private keys travel in the clear inside the TLS connection.

The Vendor Certificate and RA Certificate policies, and `/simplereenroll` under every policy, read the client certificate from the header that the TLS terminator sets, the same header as for [client certificate authentication](../../installation-guide/deployment/client-certificate-authentication.md): `ssl-client-cert` by default, `auth.header.certificate` with Helm or `spec.core.clientCertHeader` with the Operator. For EST, `Core` checks the certificate itself and the client is not signed in as a platform user: at enrollment against the trusted CA certificates of the EST Profile, as described in [EST Profile](est-profile.md#vendor-certificate-vendormtls), and at reenrollment against the inventory, as described in [Reenrollment](est-profile.md#reenrollment).

The TLS terminator must:

- request a client certificate without requiring one, so that clients authenticating with HTTP Basic credentials can still connect;
- when it verifies client certificates itself, accept the CAs that EST Profiles trust, in addition to those of platform users;
- remove any certificate header that the caller sent, on every request, and set the header only from the TLS handshake. A header that a caller can set lets the caller present any certificate.

Restrict direct access to the API gateway and `Core`, so that no request reaches them without passing the TLS terminator.

## Platform configuration

- **Trusted authority root.** When certificate validation is enabled, the platform validates the certificates it issues. When the root CA certificate of the authority is not marked as trusted in the inventory, the issued certificates have the validation status `Invalid`, and their `/simplereenroll` is answered with `403`.
- **Least-privilege `est` user.** `Core` runs EST requests as the system user `est`, whose system role reads EST Profiles, RA Profiles and authorities, and creates, issues, renews and rekeys certificates. It cannot revoke certificates, as EST has no revocation operation. For [key recovery](est-profile.md#key-recovery), the role also creates, reads, exports and deletes keys, and reads token profiles and tokens. Do not extend the role: the client authentication of each EST Profile decides who may enroll.

## Logging and audit

The platform's logs never contain an EST password or a server-generated private key, and the audit records of EST requests hold no credential, certification request or key material. Error responses carry a fixed sentence; only a request attribute policy violation adds the policy message, which names the RA Profile and the rejected values of the request. Reasons for a refusal are logged at the `DEBUG` level, without credentials.

Each `/simpleenroll`, `/simplereenroll` and `/serverkeygen` that is answered with a certificate or `202` is recorded in the audit log with the label, the authentication policy, the client identity and the outcome. A refused `/serverkeygen` is recorded with these details too once the client is authenticated; a refused `/simpleenroll` or `/simplereenroll` is recorded without them. The client identity is what the client was recognized by: `registration:<UUID>` for Certificate Registration, `secret:<UUID>` for RA Basic Credential, and `certificate:<SHA-256 thumbprint>` for the certificate-based policies. A `/simplereenroll` record names the certificate the client presented and the certificate it renewed or rekeyed, and a `/serverkeygen` record names where the key was generated.

The Kong request logging, enabled with `apiGateway.logging.request` (Helm) or `spec.gateway.logging.request` (Operator), logs the headers of every request on every route, the EST route included, and so the `Authorization` header with Basic credentials and the client certificate header. Keep it disabled in production.

## Server-generated keys

With [server-side key generation](est-profile.md#server-side-key-generation), the platform holds the client's private key while it answers the request, and the key travels to the client protected only by TLS. Allow it only for clients that cannot generate keys themselves, and prefer client-side key generation everywhere else.

With [key recovery](est-profile.md#key-recovery), the platform escrows every generated key on the key recovery token profile. Anyone who may export keys from that token, or download certificates as PKCS#12 with their keys, can recover them. Grant the `exportKey` permission on keys only to the users who must recover keys, and use a token profile reserved for EST key recovery.
