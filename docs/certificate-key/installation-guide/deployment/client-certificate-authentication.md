---
sidebar_position: 7
---

# Client certificate authentication

Use a client certificate to sign in to the platform as a registered user. Your gateway or reverse proxy verifies that the client holds the certificate's private key. The platform checks certificate trust and applies that user's permissions.

## Before you begin

You need a gateway or reverse proxy that validates client certificates, access to the deployment's CA and header configuration, and compatible Core and Auth images. Check release notes for support of your gateway's forwarding format, including RFC 9440, text XFCC or forwarded chains, and select compatible component versions or pinned images.

When upgrading, preserve the current header and CA configuration. Deploy compatible Auth first, wait until every new Auth replica is Ready and every old Auth pod has terminated, then deploy Core. Wait for the Core rollout to finish before changing gateway headers.

For rollback, restore the previous compatible gateway certificate-header format and `HEADER_NAME`, retaining the same CA configuration, then roll back Core before Auth. Throughout the rollback, keep clearing both previous and current certificate and chain headers on every platform route.

## 1. Register the client certificate

Associate the exact client leaf certificate with an enabled [user](../../concept-design/architecture/access-control/users.md) and grant the permissions that user needs. A certificate can be assigned to at most one user. Registering the issuing intermediate or root does not register the client. For the first administrator, follow [Create Super Administrator](../create-super-administrator.md).

## 2. Configure trusted CAs and the header \{#existing-client-trust}

Configure the TLS terminator and Auth to trust the intended client CA roots. Auth uses its existing system trust store. A typical certificate path is:

```text
Client certificate -> Intermediate CA -> Trusted root CA
```

The client certificate identifies the user. An optional forwarded intermediate helps Auth build the path to an already trusted root. Forwarding a root never makes it trusted. If the proxy forwards only the leaf, supply the required intermediate through the existing deployment CA configuration.

Core reads one selected header, configured by `HEADER_NAME` (default `ssl-client-cert`, application property `server.ssl.certificate-header-name`). Select your proxy's native header using the existing Operator or Helm setting below. The content determines the format; there is no format selector or scan of other header names.

### Kubernetes Operator

Provision a Secret containing public CA certificates through your existing secret-management process, then reference it with the existing fields:

```yaml
spec:
  common:
    trustedCertificates:
      secretRef: platform-client-ca
      caKey: ca.crt
  core:
    clientCertHeader: X-Forwarded-Tls-Client-Cert
```

Use `spec.core.image` and `spec.auth.image` to select compatible images. See the [Platform resource](deployment-operator/custom-resources/platform.md) for the existing image override fields.

### Helm

Set the common PEM CA bundle through `global.trusted.certificates`, then select the header:

```yaml
auth:
  header:
    certificate: X-Forwarded-Tls-Client-Cert
```

Global trust takes precedence over Auth's local trusted certificates; unrelated local selections are not merged. Use `image` for Core and the umbrella chart's `authService.image` for Auth. See [Helm configurable parameters](deployment-helm/configurable-parameters.md).

:::note[Shared CA bundle]
Helm and Operator mount the whole effective CA Secret at `/etc/ssl/certs` in Auth. In the normal Alpine image, this hides the image's usual CA bundle. Preserve any roots required for outbound HTTPS and check those connections after a bundle change. See [Trusted certificates](../create-trusted-certificates.md) for the bundle's other uses.
:::

<details>
<summary>CA filenames and runtime trust</summary>

The existing .NET 9 Linux system-store loader reads certificate files in the mounted directory, including custom Secret key filenames. Operator's `caKey` defaults to `ca.crt`; a custom key keeps its filename unless the Operator composes the user bundle with an administrator CA, when the effective output key is `ca.crt`. Core receives the selected bundle through its existing `TRUSTED_CERTIFICATES` environment variable. Helm produces the key `ca.crt`.

Actual trust also depends on runtime SSL path overrides and current-user stores. Loading does not enforce an application-specific whole-PEM schema or reject a bad bundle at startup; other certificates available to the system store may still supply trust. Inspect the deployed image and configuration when checking the effective CA set.

For same-key cross-signed intermediates, candidate order can affect the path chosen by the native .NET/OpenSSL chain builder. A usable alternative does not guarantee success: the platform preserves order and does not retry arbitrary paths or relax trust checks. Verify the actual ordered chain against the deployed Auth runtime.

</details>

## 3. Configure optional TLS and forwarding \{#forwarding-boundary}

Request and verify a client certificate when one is presented, while allowing ordinary HTTPS clients without one. Scope optional mTLS to the platform host, including when other hosts share the listener.

On every externally reachable platform route, the proxy must clear caller-supplied certificate fields on every request, including requests without a client certificate, then forward only the TLS-derived assertion. Protect the proxy-to-origin connection and restrict direct access to Core and the API gateway. Any workload allowed to send identity headers directly to the origin is part of this trust boundary.

At a CDN or reverse proxy, disable shared caching of authenticated responses and preserve the required `Cache-Control: no-store` and identity-dependent `Vary` behavior.

### Native Traefik forwarding

Use Traefik [v3.7.12 or later](https://github.com/traefik/traefik/releases/tag/v3.7.12). Before forwarding certificates, set `entryPoints.<name>.http.aliasHeadersStrategy=delete` in Traefik's static configuration for every entrypoint serving a platform route, for example `--entryPoints.websecure.http.aliasHeadersStrategy=delete`. A dedicated platform entrypoint also needs this setting. Native forwarding and canonical-name clearing leave aliases untouched; deleting only underscore aliases is insufficient.

Use stock [PassTLSClientCert](https://doc.traefik.io/traefik/reference/routing-configuration/http/middlewares/passtlsclientcert/) with `pem: true` and select `X-Forwarded-Tls-Client-Cert` in Core. Create a clearing middleware followed by the native forwarding middleware:

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

Attach both middlewares in that order to every `IngressRoute` serving the platform host. Reference a named, host-specific `TLSOption` with `clientAuth.clientAuthType: VerifyClientCertIfGiven` and `clientAuth.secretNames` selecting the edge CA bundle. Keep the existing server certificate and HTTPS routes; do not make optional client authentication the listener's default policy.

PassTLSClientCert alone leaves caller assertions in place when no peer certificate is present, so the clearing middleware is required.

<details>
<summary>Shared listeners and header aliases</summary>

Check duplicate headers, `Connection` nominations and header-name aliases against your deployed listener. The `delete` strategy deletes headers containing characters other than letters, digits and dashes, including unrelated underscore or dot names. Review its effect on every host sharing that listener; use a dedicated platform entrypoint if other hosts need those names.

</details>

## 4. Verify authentication \{#activation-and-acceptance}

Run these checks with your deployed versions, routes and CA hierarchy before enabling certificate access:

| Request | Expected result |
|---|---|
| No client certificate | Ordinary HTTPS and OIDC continue under their existing access rules. No certificate header reaches Core. |
| Registered leaf for an enabled user | The correct user and permissions are selected. If intermediates are forwarded, the same leaf remains the identity. |
| Unknown leaf or disabled user | HTTP 401 if the request reaches Core. |
| Client signed by an unrelated CA | Rejected by proxy TLS validation, or HTTP 401 if it reaches Auth. Forwarding its root cannot grant trust. |
| Forged certificate fields, including underscore and dot aliases, without TLS credentials | The proxy removes the fields; the request cannot acquire a certificate identity. |

A proxy TLS rejection happens before HTTP, so it may produce a TLS error rather than HTTP 401. A supplied empty, malformed, ambiguous or untrusted certificate header that reaches Core produces HTTP 401 and does not fall back to bearer, Basic, another header or another certificate.

Also check expired material, malformed chains and duplicate RFC/XFCC identities, including after a successful certificate request. Test your actual chain size and TLS session behavior. Confirm the origin is inaccessible through unintended routes and authenticated responses cannot be reused from a shared cache.

## 5. Renew a client certificate

Use this procedure when the renewed leaf's issuing chain is already available to the gateway and Auth, through the current CA configuration or forwarded intermediates. If the CA configuration must change, follow the CA rotation procedure below first.

1. Keep separate administrator or OIDC access available throughout the cutover.
2. Issue the renewed leaf and check its chain against the configured CA bundle. Confirm that the gateway completes TLS validation and forwards the selected header. Full Auth acceptance is checked after the association is replaced.
3. Replace the enabled user's certificate association with the exact renewed leaf. Each user has one certificate association, so this is a cutover; both leaves cannot be registered to that user together.
4. Switch the client to the renewed certificate and its private key, then verify the expected user identity, assigned roles and permissions. After the cache window or restarts below, check that the old leaf fails to authenticate.

The old fingerprint can remain accepted until Core's cached identity expires after `AUTH_CACHE_TTL_MINUTES` (five minutes by default), measured from when the entry was written. The association update evicts local user and certificate entries on the processing instance; other Core instances can retain them. For deterministic cache discard, restart every Core instance after replacing the association, wait until all new replicas are Ready and all old pods have terminated, then verify that the new leaf works and the old leaf fails. Auth does not need a restart when the CA trust is unchanged.

## 6. Rotate CAs \{#ca-changes-and-cache-timing}

Add replacement roots and complete the trust rollout below before issuing replacement client certificates or replacing user associations. Then follow the renewal cutover above and verify authentication before retiring old roots.

CA changes follow Kubernetes Secret projection and the existing runtime trust-store refresh. There is no fixed propagation or reload delay, and Auth does not reread CA files on every validation. A `subPath` mount does not receive projected updates. Core's authentication cache described above can also hide CA removal or certificate expiry until an entry expires or is discarded.

For deterministic enforcement after adding or removing a CA:

1. Update the edge trust and confirm the new CA files have reached every Auth instance.
2. Restart every Auth instance so its system store loads the new material. Wait until every new Auth replica is Ready and every old Auth pod has terminated.
3. Only then restart every Core instance to discard cached identities, and verify the resulting trust behavior after all restarts complete.

There is no shared cache invalidation or runtime cache-flush endpoint. See [Caching](../../concept-design/architecture/caching.md#effective-time-of-changes) for other changes across instances.

## Troubleshooting

| Symptom | Check |
|---|---|
| TLS handshake fails | Check the proxy's client CA bundle, certificate validity and optional TLS policy on the platform host. |
| Registered client gets HTTP 401 | Check that the exact leaf is associated with an enabled user, the selected header matches the proxy, and Auth trusts its root. |
| Direct-root client works; intermediate-signed client fails | Forward the intermediate or include it in the existing deployment CA configuration. |
| OIDC or HTTPS fails without a certificate | Check optional TLS and unconditional header clearing; an empty assertion is still an assertion. |
| Removed CA still appears accepted | Follow the Auth-then-Core restart procedure above and verify every replica. |
| Outbound HTTPS fails after a CA change | Check whether the whole Secret mount omitted roots previously supplied by the image bundle. |

## Header and format reference \{#header-selection-and-representations}

Existing valid legacy encodings remain supported. The leaf is always the identity; optional chain material helps build its path and cannot replace it. For method priority, see [Identification](../../concept-design/architecture/access-control/identification.md) and [Timestamping authentication](../../../signing/timestamping/authentication-authorization.md).

| Format | Required content |
|---|---|
| Legacy DER/PEM | Bare Base64 DER, PEM, supported transport encodings, Base64-wrapped PEM or a comma-separated leaf-first sequence. |
| RFC 9440 | One `:base64(DER):` leaf in the selected header; optional ordered candidates in `Client-Cert-Chain`, excluding the leaf. |
| Text XFCC | One proxy observation with a full PEM leaf in `Cert`; optional `Chain` starts with that same leaf. Hash, subject, SAN or verification metadata alone is insufficient. |

<details>
<summary>Exact encoding and ambiguity rules</summary>

Legacy percent decoding preserves literal Base64 `+`; recognized form-encoded PEM uses form semantics. Consecutive PEM certificates and whitespace in PEM bodies are accepted. Base64-wrapped PEM is decoded through one outer layer; recursive Base64 or percent decoding is unsupported. In legacy sequences the first certificate is the identity. Every tail is validated before repeated leaf copies are omitted; other certificates remain untrusted candidates.

Legacy-only repeated selected fields keep the existing first-physical-field selection. If any occurrence uses RFC 9440 or text XFCC, repeated selected fields are rejected. RFC leaf input must be a singleton byte-sequence Item; valid Structured Fields parameters do not establish identity. RFC chain fields can repeat in received order but must exclude the leaf.

Text XFCC rejects multiple proxy observations, repeated selected fields, JSON and Chain-only assertions. The leading `Chain` leaf must match `Cert` byte-for-byte as DER; it counts once and is removed from candidates. Later leaf occurrences fail. Malformed candidates, parameters or metadata fail even after a successful request for the same leaf. DER must contain exactly one complete certificate with no trailing data. Candidate order is preserved when duplicate DER certificates are removed; all asserted candidates count toward limits before that removal.

Legacy single-certificate loading preserves the original certificate bytes and its existing tolerance for noncanonical encodings. Chain assertions and RFC/XFCC formats apply structural DER and canonical re-encoding checks while retaining native `PrintableString` tolerance. Direct Auth callers without chain material (absent or empty) retain existing Base64-wrapped PEM loading, including certificates with explicit EC parameters.

When certificate-chain material is forwarded, Auth does not download missing issuers from certificate URLs. Forward the required intermediates or include them in the existing CA configuration. Requests without forwarded chain material retain the existing runtime behavior.

</details>

### Input limits

<details>
<summary>Size and count limits</summary>

Core's bundled configuration sets `server.max-http-request-header-size` to `64KB`: a 64 KiB HTTP request-header budget including certificate fields, cookies and authorization headers. The parser's separate defensive ceiling is 262,144 bytes across selected certificate header values and the RFC companion; it does not raise the HTTP server or proxy limits. A request rejected before parsing can return HTTP 400.

The parser also limits DER to 65,536 bytes per certificate and material to 16 asserted certificates before deduplication. The RFC companion accepts at most 16 field lines; XFCC accepts at most 128 key/value pairs. Auth independently limits encoded input to 262,144 characters, DER to 65,536 bytes each and material to 16 certificates.

Wrapped PEM is bounded by the original header before allocation. Decoded PEM text can exceed the DER limit due to encoding overhead, but each inner certificate and the material count must meet their limits. RFC's byte limit includes untrimmed leaf and companion values and joining separators. XFCC counts `Cert` and its matching leading `Chain` leaf once; remaining candidates and legacy repeated-leaf tails count before deduplication. Your proxy may impose smaller limits.

</details>

## Provider reference \{#measured-native-compatibility}

Native forwarding was measured with actual TLS client certificates on the versions below. The measurements confirmed wire formats, leaf identity, removal or replacement of forged assertions, absent assertions for clients without certificates, and rejection of unrelated TLS clients. They do not establish your deployed Auth trust or user registration; complete the verification steps above.

| Tested producer | Native output |
|---|---|
| Traefik `rancher/hardened-traefik:v3.7.13-build20260910` | `X-Forwarded-Tls-Client-Cert`: bare Base64 DER, including literal `+`; comma-separated, leaf first when a chain is presented. |
| Envoy `v1.36.0` | [Text XFCC](https://www.envoyproxy.io/docs/envoy/v1.36.0/configuration/http/http_conn_man/headers#x-forwarded-client-cert) with `SANITIZE_SET`, `cert: true` and `chain: true`. Configure downstream TLS CA validation too. |
| NGINX `1.28.0` | [Percent-encoded PEM](https://nginx.org/en/docs/http/ngx_http_ssl_module.html#variables) from `$ssl_client_escaped_cert` in the selected `X-SSL-Client-Cert`; leaf only. |
| HAProxy `3.2.0` | RFC 9440 `Client-Cert` from `:%[ssl_c_der,base64]:`; leaf only. See the [HAProxy manual](https://docs.haproxy.org/3.2/configuration.html). |

Traefik and Envoy can forward intermediates as untrusted candidates. The measured NGINX and HAProxy expressions forward only the leaf, so Auth needs required intermediates in its existing CA configuration.

<details>
<summary>HAProxy header recipes</summary>

For RFC 9440, configure optional TLS client authentication with CA verification and set Core's `HEADER_NAME` to `Client-Cert`. Clear both RFC fields unconditionally, then emit the leaf only when a TLS client certificate was used:

```text
http-request del-header Client-Cert
http-request del-header Client-Cert-Chain
http-request set-header Client-Cert :%[ssl_c_der,base64]: if { ssl_c_used }
```

For a bare Base64 DER header instead, use the same TLS verification and set `HEADER_NAME` to `X-SSL-Client-Cert`:

```text
http-request del-header X-SSL-Client-Cert
http-request set-header X-SSL-Client-Cert %[ssl_c_der,base64] if { ssl_c_used }
```

Without a client certificate, the selected header remains absent and Core skips certificate authentication.

</details>

### Other native gateways

<details>
<summary>Standards and vendor-documented integrations</summary>

These integrations are based on vendor documentation; their runtime interoperability was not measured above. Capture the actual header and complete the verification steps before activation.

- **[RFC 9440 producers](https://www.rfc-editor.org/rfc/rfc9440.html):** select `Client-Cert`, preserve the separate `Client-Cert-Chain` and overwrite caller assertions across trusted hops. The leaf must be a singleton.
- **[Istio](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#Topology):** use text XFCC with `SANITIZE_SET` and full certificate forwarding (`cert: true`), plus gateway TLS CA validation. Hash-only and JSON output are unsupported; the Envoy measurement does not establish Istio interoperability.
- **[AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/mutual-authentication.html):** verify uses `X-Amzn-Mtls-Clientcert-Leaf`; passthrough uses leaf-first `X-Amzn-Mtls-Clientcert`. Both use percent-encoded PEM preserving literal `+` and support native header renaming. Verify validates at the edge; passthrough delegates trust. Check duplicate caller-header handling.
- **[Google Cloud Application Load Balancer](https://docs.cloud.google.com/load-balancing/docs/https/custom-headers):** use `{client_cert_leaf}` and optional `{client_cert_chain}` with `replace: true` URL-map actions. These RFC 9440 variables have size and validation constraints; permissive TLS modes may not forward a complete invalid leaf.
- **[Cloudflare](https://developers.cloudflare.com/ssl/client-certificates/forward-a-client-certificate/):** remove assertions unconditionally, then use Transform Rules to set `Client-Cert` from `cf.tls_client_auth.cert_rfc9440` and the separate chain field under your validated-client policy. Certificate fields do not imply verification; metadata-only transforms are insufficient.
- **AWS CloudFront:** required/optional viewer mTLS uses `CloudFront-Viewer-Cert-Pem`; passthrough uses RFC 9440 `Client-Cert` and `Client-Cert-Chain`. Allowlist headers in the origin request policy. [Viewer headers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/viewer-mtls-headers.html) and [validation modes](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/mtls-validation-modes.html) distinguish viewer from origin mTLS, which identify different peers.
- **[Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-configure-tls-mutual-auth):** select Base64 DER in `X-ARR-ClientCert` and retain application trust validation. Full-chain forwarding is not established.
- **[Azure Application Gateway](https://learn.microsoft.com/en-us/azure/application-gateway/rewrite-http-headers-url):** the native `{var_client_certificate}` rewrite variable supplies PEM. Capture its newline and escaping shape before claiming exact interoperability.

</details>
