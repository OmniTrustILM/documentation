---
sidebar_position: 2
---

# TSP Profile

A TSP Profile is the inbound-facing configuration object for an RFC 3161 Timestamp Protocol endpoint. It declares which authentication methods inbound clients may use, which Signing Profile is the default when no explicit profile is specified, optional Vault-backed credential storage, and per-credential username-to-platform-user mappings.

For the full entity-relationship diagram showing how a TSP Profile relates to Signing Profiles, Time Quality Configuration, and bound PKI resources, see the [entity-relationship diagram on the Signing Profile page](./signing-profile.md#entity-relationship-diagram).

---

## Purpose

A TSP Profile applies authentication policy to inbound `TimeStampReq` requests before they reach the timestamping engine. An RFC 3161 client reaches the engine through one of two routes:

**Direct — keyed by TSP Profile name.** The caller names the TSP Profile, and the request is timestamped using that profile's default Signing Profile:

```
POST /v1/protocols/tsp/{tspProfileName}
```

This route requires the TSP Profile to have a default Signing Profile configured.

**Indirect — keyed by Signing Profile name.** The caller names the Signing Profile directly:

```
POST /v1/protocols/tsp/signingProfiles/{signingProfileName}
```

The named Signing Profile must be associated with an enabled TSP Profile, which supplies the authentication policy.

Either way, the TSP Profile is what authenticates the request. The management API for TSP Profiles is available under `/v1/tspProfiles`.

---

## Authentication methods

`allowedAuthenticationMethods` controls which authentication transports the TSP Authentication Filter will accept on the endpoint. At least one method must be configured.

| Value | Transport | Secret type |
|---|---|---|
| `CLIENT_CERTIFICATE` | Mutual-TLS; the client certificate arrives in the `ssl-client-cert` header | X.509 certificate |
| `BEARER_TOKEN` | `Authorization: Bearer` header | JWT |
| `BASIC_PASSWORD` | `Authorization: Basic` header | Username and password (matched against `TspProfileBasicCredential`) |

Multiple methods may be listed simultaneously; the filter accepts requests that satisfy any of them. The authentication-authorization page covers how the detected identity is mapped to platform permissions.

---

## Default Signing Profile

The default Signing Profile is what the **direct route** (`/v1/protocols/tsp/{tspProfileName}`) timestamps against — the caller names only the TSP Profile, and this is the Signing Profile that handles the request. It is therefore required for the direct route to work.

The **indirect route** (`/v1/protocols/tsp/signingProfiles/{signingProfileName}`) ignores the default, since the caller names the Signing Profile explicitly.

---

## Vault Profile

A Vault Profile is required when the TSP Profile permits the `BASIC_PASSWORD` authentication method: it is the backend that stores and retrieves the basic-credential password secrets. Profiles that use only `CLIENT_CERTIFICATE` or `BEARER_TOKEN` do not need one.

---

## Relationships summary

- A TSP Profile references at most one **Signing Profile** as its default. Multiple Signing Profiles may associate with the same TSP Profile.
- A TSP Profile references at most one **Vault Profile** for secret storage.
- A TSP Profile owns zero or more basic-credential records (cascade delete: credentials are removed when the TSP Profile is deleted).

See the [entity-relationship diagram on the Signing Profile page](./signing-profile.md#entity-relationship-diagram) for the full cardinality map.
