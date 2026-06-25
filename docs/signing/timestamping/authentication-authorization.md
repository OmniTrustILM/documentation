---
sidebar_position: 4
---

# Authentication and Authorization

Every RFC 3161 timestamp request must pass two gates before the timestamping engine runs: **authentication** (who is calling?) and **authorization** (is that principal allowed to use this TSP Profile?). Both gates are enforced before any business logic executes.

For the full request sequence from HTTP arrival to RFC 3161 response, see [Timestamping Request Flow](./timestamping-flow.md).

---

## Authentication

Authentication is enforced before any business logic, on every `/v1/protocols/tsp/**` request. Three things happen in order:

1. **Route resolution** — the TSP Profile is resolved from the request path. If no matching profile is found, the request is rejected with HTTP 401 before any credential is examined.
2. **Method selection** — each authentication method is tried in fixed priority order; the first that matches the request claims it. If the selected method is not listed in the TSP Profile's `allowedAuthenticationMethods`, the request is rejected with HTTP 401. Selection does not fall through: if the matched method is rejected or fails, the request is not retried with another method.
3. **Challenge** — on any failure, an HTTP 401 is returned with a `WWW-Authenticate` header listing the `Basic` and `Bearer` schemes the profile accepts (where applicable). If the profile allows only `CLIENT_CERTIFICATE`, or if the profile cannot be resolved, no `WWW-Authenticate` header is sent.

### Method detection and priority

The priority order is fixed:

1. **Client certificate** — detected when the configured certificate header (default: `ssl-client-cert`) is present
2. **Bearer token** — detected when the `Authorization` header begins with `Bearer `
3. **Basic password** — detected when the `Authorization` header begins with `Basic `

A request that presents both a client-certificate header and an `Authorization` header is handled exclusively by the certificate method.

---

## Authentication methods

### CLIENT_CERTIFICATE

**Transport:** Mutual-TLS. The TLS-terminating proxy strips the client certificate from the TLS handshake and forwards it in the `ssl-client-cert` request header as a URL-encoded PEM string.

**How the credential is validated:**

The certificate is read from the header, URL-decoded, PEM-normalized, and reduced to its SHA-256 thumbprint. That thumbprint is resolved to the platform identity mapped to the certificate, through the platform's certificate authentication subsystem; a successful lookup establishes the principal for the request.

**Configuration on the TSP Profile:**

The method must be listed in `allowedAuthenticationMethods` as `CLIENT_CERTIFICATE`. No credential records on the TSP Profile are required — identity resolution is handled through the platform's certificate authentication subsystem.

---

### BEARER_TOKEN

**Transport:** `Authorization: Bearer <jwt>` HTTP header.

**How the credential is validated:**

The JWT is extracted, decoded, and validated, and its verified claims are resolved to a platform identity that becomes the request principal. The JWT is validated against the platform's configured OAuth2 issuer.

**Configuration on the TSP Profile:**

The method must be listed in `allowedAuthenticationMethods` as `BEARER_TOKEN`. No credential records on the TSP Profile are required — the JWT is validated against the platform's configured OAuth2 issuer.

---

### BASIC_PASSWORD

**Transport:** `Authorization: Basic <base64>` HTTP header containing `username:password`.

**How the credential is validated:**

The Base64 value is decoded and split on the first `:` into username and password. Then:

1. A `TspProfileBasicCredential` record on the profile whose `username` matches the presented username is looked up. If none is found, a fingerprint is still computed and discarded (constant-time dummy work to prevent a timing side-channel) and the attempt is rejected.
2. The credential verification cache is checked for a cached positive result keyed on `(secretUuid, password)`. On a cache hit the principal is established immediately, without repeating the fingerprint check.
3. On a cache miss, a fingerprint is computed from the presented credentials and compared against the stored `fingerprint` using a constant-time comparison.
4. On a match, the positive result is cached and the principal is established as the credential's `mappedUserUuid`.

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

`allowedAuthenticationMethods` is a list field on the TSP Profile that declares which authentication methods the endpoint will accept. The endpoint enforces it strictly:

- If the presented method is not in the list, the request is rejected with HTTP 401 even if the credential would otherwise be valid.
- Multiple methods may be listed; the endpoint accepts any request that satisfies one of them.
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

On a high-throughput endpoint, the same profiles, certificates, keys, and credentials are looked up on every request. Several caches keep this hot path off the database and off repeated cryptographic work — including positive `BASIC_PASSWORD` verification results and the platform identity resolved for `CLIENT_CERTIFICATE` and `BEARER_TOKEN` requests.

For the caches involved, their bounds, time-to-live, multi-instance behaviour, and invalidation, see [Caching](/docs/certificate-key/concept-design/architecture/caching).

---

## Related pages

- [TSP Profile](./profiles/tsp-profile.md) — `allowedAuthenticationMethods` field reference, credential sub-resource API
- [Timestamping Request Flow](./timestamping-flow.md) — end-to-end sequence including the authentication and authorization stages
- [Timestamping Overview](./overview.md) — component architecture and workflow taxonomy
