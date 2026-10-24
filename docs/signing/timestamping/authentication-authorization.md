---
sidebar_position: 8
---

# Authentication and authorization

Before the platform processes a timestamp request, it checks two things: who is making the request (authentication), and whether that user is allowed to perform timestamping using the `TSP Profile`, `Signing Profile`, and other related resources they are targeting (authorization). Both checks happen before any timestamping takes place.

For the full request sequence from HTTP arrival to RFC 3161 response, see [Timestamping request flow](./timestamping-flow.md).

---

## Authentication

Authentication for timestamping is configured on the `TSP Profile`. For a description of each authentication method and how credentials are configured, see [TSP Profile — Authentication methods](./tsp-profile.md#authentication-methods).

### Method detection and priority

The priority order is fixed:

1. **Client certificate** — detected when the configured client certificate header is present
2. **Bearer token** — detected when the `Authorization` header begins with `Bearer `
3. **Basic password** — detected when the `Authorization` header begins with `Basic `

When multiple methods are present in a request, the first one in the priority order above takes precedence.

The client certificate header and its setup are described in [Client Certificate Authentication](../../certificate-key/installation-guide/deployment/client-certificate-authentication.md). A request whose certificate fails validation is rejected; it does not fall back to bearer or Basic authentication.

### Delegation tokens

When the `TSP Profile` accepts bearer tokens, the timestamping endpoint applies the same [delegation validation](../../certificate-key/concept-design/architecture/access-control/identification.md#delegation-tokens) as the API. The external identity provider issues the access token; Core validates it against the OAuth 2.0 provider selected by its issuer, including the signature, audience, time, and the provider's [allowed delegates](../../certificate-key/settings/authentication.md#allowed-delegates).

A token carrying `act` is refused with HTTP `401` if the immediate delegate is not allowed or the actor claim is malformed. An empty allowlist refuses every delegation token. Only the outermost `act` is checked and recorded. A token without `act` follows the existing bearer-token behavior.

The user identified by the token's top-level claims still needs every permission listed below. The delegate receives no platform role or permission. The request's audit record identifies the user and adds the [delegate](../../certificate-key/logging/log-record-structure.md#delegate); the complete token is never logged. Changes to the provider's allowlist take effect on the next timestamping request, even when the user's identity is cached.
### Rejection and the 401 challenge

When authentication fails — the presented method is not allowed by the profile, or the credentials do not verify — the platform answers with HTTP 401. If the profile accepts password or bearer-token authentication, the response's `WWW-Authenticate` header advertises those methods to the caller. For a profile that accepts only client certificates, or when no profile could be resolved, there is no client-actionable HTTP challenge, so the header is omitted.

---

## Authorization

Two distinct accounts are involved in a production timestamping setup:

- **Provisioning operator** — a human administrator who creates and configures `TSP Profiles`, `Signing Profiles`, tokens, and credentials. This account needs broad permissions across many resources.
- **Timestamping user** — a platform user that TSP clients authenticate as. This can be a real user account, a system account, or a dedicated application account. Either way, it should have only the permissions required to perform timestamping against the specific profiles and keys it is authorized for.

Keeping these two accounts separate is important: the timestamping user's permission set is the effective security boundary on what a TSP client can timestamp with.

### Required permissions for timestamping

For a timestamp request to complete successfully, the timestamping user must have the following permissions:

| Resource | Action | Why |
|---|---|---|
| `TSP Profile` | `timestamp` | The timestamp operation itself |
| `TSP Profile` | `detail` | Loading the `TSP Profile` by name |
| `Signing Profile` | `detail` | Loading the `Signing Profile` referenced by the `TSP Profile` |
| `Token Profile` | `detail` | Loading the `Token Profile` |
| `Token` | `detail` | Loading the `Token` that owns the key |
| `Key` | `sign` | The cryptographic signing operation |

Grant `TSP Profile`, `Signing Profile`, `Token`, and `Token Profile` permissions to the specific object UUIDs the timestamping user needs — the account should not be able to see or interact with any other objects of those types. `Key` is an exception: it does not support object-scoped grants and must be granted resource-wide.

If a timestamp request is denied, the platform returns an HTTP 200 response with a timestamp response with a failed status.

For the overall access-control model, see the [Access Control](../../certificate-key/concept-design/architecture/access-control/overview.md) section of the architecture documentation.

---

## Performance: caching

On a high-throughput endpoint, the same profiles, certificates, keys, and credentials are looked up on every request. Several caches keep this off the database and avoid repeated cryptographic work — including verified **Basic Authentication** credentials and the platform identities resolved for **Client Certificate** and **Bearer Token** requests.

For the caches involved, their bounds, time-to-live, multi-instance behavior, and invalidation, see [Caching](/docs/certificate-key/concept-design/architecture/caching).

---

## Related pages

- [TSP Profile](./tsp-profile.md) — authentication methods configuration and credential management
- [Timestamping request flow](./timestamping-flow.md) — end-to-end sequence including the authentication and authorization stages
- [Access Control](../../certificate-key/concept-design/architecture/access-control/overview.md) — the platform's role-based access control model
