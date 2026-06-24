---
sidebar_position: 4
---

# Authentication and Authorization

Every RFC 3161 timestamp request must pass two gates before the timestamping engine runs: **authentication** (who is calling?) and **authorization** (is that principal allowed to use this TSP Profile?). Both gates are enforced before any business logic executes.

For the full request sequence from HTTP arrival to RFC 3161 response, see [Timestamping Request Flow](./timestamping-flow.md).

---

## Authentication

Authentication is enforced by `TspAuthenticationFilter`, a Spring `OncePerRequestFilter` registered exclusively on the `/v1/protocols/tsp/**` security filter chain. The filter orchestrates three collaborators:

1. **TspRouteResolver** — resolves the TSP Profile from the request path. If no matching profile is found, the request is rejected with HTTP 401 before any credential is examined.
2. **TspAuthenticator strategies** — each strategy handles exactly one authentication method. The filter runs them in fixed priority order; the first whose `canHandle()` returns `true` claims the request. If the selected method is not listed in the TSP Profile's `allowedAuthenticationMethods`, the request is rejected with HTTP 401. Selection does not fall through: if the matched method is rejected or fails, the request is not retried with another method.
3. **TspChallengeWriter** — on any failure, writes HTTP 401 with a `WWW-Authenticate` header listing the `Basic` and `Bearer` schemes the profile accepts (where applicable). If the profile allows only `CLIENT_CERTIFICATE`, or if the profile cannot be resolved, no `WWW-Authenticate` header is sent.

### Method detection and priority

The authenticator priority order is fixed:

1. `ClientCertificateAuthenticator` — detected when the configured certificate header (default: `ssl-client-cert`) is present
2. `BearerTokenAuthenticator` — detected when the `Authorization` header begins with `Bearer `
3. `BasicPasswordAuthenticator` — detected when the `Authorization` header begins with `Basic `

A request that presents both a client-certificate header and an `Authorization` header is handled exclusively by the certificate authenticator.

---

## Authentication methods

### CLIENT_CERTIFICATE

**Transport:** Mutual-TLS. The TLS-terminating proxy strips the client certificate from the TLS handshake and forwards it in the `ssl-client-cert` request header as a URL-encoded PEM string.

**How the credential is validated:**

`ClientCertificateAuthenticator` reads the header, URL-decodes it, normalizes PEM formatting, and derives the certificate's SHA-256 thumbprint. It then delegates to `PlatformAuthenticationClient.authenticateByCertificate()`, which resolves the platform identity mapped to that certificate. A successful lookup writes a `PlatformAuthenticationToken` to the `SecurityContext` via `TspSecurityContextWriter`.

**Configuration on the TSP Profile:**

The method must be listed in `allowedAuthenticationMethods` as `CLIENT_CERTIFICATE`. No credential records on the TSP Profile are required — identity resolution is handled through the platform's certificate authentication subsystem.

---

### BEARER_TOKEN

**Transport:** `Authorization: Bearer <jwt>` HTTP header.

**How the credential is validated:**

`BearerTokenAuthenticator` extracts the JWT string, decodes and validates it with `PlatformJwtDecoder`, and passes the verified claims to `PlatformAuthenticationClient.authenticateByToken()`. The client resolves the platform identity and the result is written to the `SecurityContext`.

**Configuration on the TSP Profile:**

The method must be listed in `allowedAuthenticationMethods` as `BEARER_TOKEN`. No credential records on the TSP Profile are required — the JWT is validated against the platform's configured OAuth2 issuer.

---

### BASIC_PASSWORD

**Transport:** `Authorization: Basic <base64>` HTTP header containing `username:password`.

**How the credential is validated:**

`BasicPasswordAuthenticator` decodes the Base64 value and splits on the first `:` to recover the username and password. It then:

1. Looks up a `TspProfileBasicCredential` record on the profile whose `username` matches the presented username. If none is found, a fingerprint is computed and discarded (constant-time dummy work to prevent timing side-channel attacks) and the attempt is rejected.
2. Checks `CredentialVerificationCache` for a cached positive result keyed on `(secretUuid, password)`. On a cache hit the principal is established immediately without repeating the fingerprint check.
3. On a cache miss, computes a fingerprint from the presented credentials using `SecretsUtil.calculateSecretContentFingerprint()` and compares it against the stored `fingerprint` field using `MessageDigest.isEqual()` (constant-time comparison).
4. On a match, stores the positive result in the cache and establishes the principal as the `mappedUserUuid` on the credential record.

**Configuration on the TSP Profile:**

The method must be listed in `allowedAuthenticationMethods` as `BASIC_PASSWORD`. At least one `TspProfileBasicCredential` child record must exist on the profile. Each credential record binds:

| Field | Purpose |
|---|---|
| `username` | The username the client presents in the `Authorization: Basic` header |
| `secretUuid` | Reference to the platform-managed secret that holds the hashed credential |
| `mappedUserUuid` | The platform user to which this credential is mapped for authorization decisions |
| `fingerprint` | Pre-computed fingerprint of the stored credential, used for constant-time comparison |

Credentials are managed via the sub-resource API at `%API_BASE_URL%tspProfiles/{uuid}/basicCredentials`.

For a complete description of the `allowedAuthenticationMethods` field and the credential sub-resource, see [TSP Profile](./profiles/tsp-profile.md).

---

## `allowedAuthenticationMethods` enforcement

`allowedAuthenticationMethods` is a list field on the TSP Profile that declares which authentication methods the endpoint will accept. The filter enforces it strictly:

- If the presented method is not in the list, the request is rejected with HTTP 401 even if the credential would otherwise be valid.
- Multiple methods may be listed; the filter accepts any request that satisfies one of them.
- At least one method must be configured for the endpoint to be functional.

The `WWW-Authenticate` response on a 401 advertises only the HTTP-level schemes (`Basic`, `Bearer`) that the profile lists. `CLIENT_CERTIFICATE` is not advertised because there is no HTTP challenge mechanism for mTLS.

---

## Authorization

Authorization runs immediately after authentication, before any timestamping logic executes. The authenticated principal must be permitted the **timestamp** action on the specific TSP Profile, evaluated against the platform's Open Policy Agent (OPA) access-control policies:

| Dimension | Value |
|---|---|
| Resource type | `tspProfiles` |
| Resource instance | UUID of the TSP Profile |
| Action | `timestamp` |

If the policy denies access, the request is mapped to an RFC 3161 `badRequest` rejection — the same response as a non-existent profile, so callers cannot distinguish a missing profile from a forbidden one (enumeration defence).

Role-based access to TSP Profiles is configured through the platform's access-control management API. For the overall access-control and OPA model, see the [Access Control](../../certificate-key/concept-design/architecture/access-control/overview.md) section of the architecture documentation.

---

## Performance: caching

On a high-throughput endpoint, the same profiles, certificates, keys, and credentials are looked up on every request. Several caches keep the hot path off the database and off repeated cryptographic work. Those touched by a timestamp request include:

- **Credential verification cache** — records positive `BASIC_PASSWORD` verification results so the fingerprint comparison is not repeated on every call.
- **Authentication cache** — caches the platform identity resolved for `CLIENT_CERTIFICATE` and `BEARER_TOKEN` requests.
- **TSP profile** and **signing profile** caches — the profile lookups that resolve the request.
- **Signing certificate**, **certificate chain**, and **cryptographic key item** caches — the PKI resources dereferenced during profile resolution.
- **Time quality configuration cache** and **connector API client cache** — the time-quality and formatter-connector resources resolved for the signing operation.

For the full list of caches, their bounds, time-to-live, multi-instance behaviour, and invalidation, see [Caching](/docs/certificate-key/concept-design/architecture/caching).

---

## Related pages

- [TSP Profile](./profiles/tsp-profile.md) — `allowedAuthenticationMethods` field reference, credential sub-resource API
- [Timestamping Request Flow](./timestamping-flow.md) — end-to-end sequence including the authentication and authorization stages
- [Timestamping Overview](./overview.md) — component architecture and workflow taxonomy
