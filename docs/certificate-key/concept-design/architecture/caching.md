---
sidebar_position: 8
---

# Caching

To keep request latency low — especially on the authentication hot path, where the same lookups repeat across many requests — `Core` maintains a number of in-memory caches. Each cache holds the result of an operation that is comparatively expensive to recompute (an authentication or authorization decision, a resolved certificate chain, a connector lookup) so that subsequent identical requests are served without repeating the work.

All caches share the same foundation:

- **In-memory and per-instance.** Caches live in the memory of each `Core` instance and are not shared between instances. In a high-availability deployment, every instance warms and invalidates its own caches independently.
- **Bounded.** Each cache is limited both by a time-to-live (an entry expires a fixed time after it is written, **five minutes by default**) and by a maximum number of entries. Both limits are tunable; [Configuration](#configuration) lists the settings of the authentication and the authorization cache.
- **Transaction-safe invalidation.** When a change requires a cached entry to be removed, the eviction is deferred until the surrounding database transaction commits, so a rolled-back change never disturbs the cache. Within a single transaction, repeated full-cache clears are collapsed into one.

:::info
Caching is transparent to API consumers — clients never need to manage or signal cache state. How quickly a change becomes visible across the platform depends on the invalidation rules described below; see [Effective time of changes](#effective-time-of-changes) for the high-availability case.
:::

## Authentication cache

Authentication is performed on every API request. Without caching, each request would trigger a round-trip to the authentication service. The authentication cache stores the outcome of a successful authentication so that repeated requests from the same identity are served without contacting the authentication service again. For how authentication itself is performed, see [Externalized authentication](./access-control/externalized-authentication.md).

Authentication results are cached separately per authentication method:

- **Client certificate** — keyed by the certificate's SHA-256 fingerprint.
- **Token** — keyed by the token's unique identifier (`jti`).
- **User UUID** — keyed by the user's identifier.
- **System user** — for the platform's internal system user.

Some results are deliberately never cached:

- Anonymous outcomes — including failed authentication, anonymous access, and requests originating from within the platform itself — always go through the authentication service.
- Tokens without a `jti` claim — without a stable identifier they cannot be cached safely, so each such request is authenticated anew.

### Keeping authentication results fresh

Beyond time-to-live expiry, the authentication cache is invalidated whenever a change could affect an authentication decision. Invalidation happens at two granularities:

- **Per-identity** — cached entries for a user are removed when that user's profile is updated, role assignments change, or the user is disabled or deleted. The cached entry for a certificate is removed when its user association changes or when the certificate is revoked through the platform. The next request from that identity re-authenticates. Because sign-in does not check revocation, a revoked certificate that is still associated with an enabled user is accepted again; to block it, remove the association or disable the user.
- **Global** — when a role itself changes (the role is updated or deleted, or its permissions are changed), the entire authentication cache is cleared. Because such a change can affect every user holding that role, clearing all entries is the safe choice; all identities re-authenticate on their next request.

## Authorization cache

Every protected operation is checked against the platform's authorization policies, which are evaluated by the Open Policy Agent (OPA). Without caching, each check would be a round-trip to OPA. The authorization cache stores the results of these checks, so a repeated check is served from memory and does not leave the `Core` process. For how authorization works, see [Authorization](./access-control/authorization.md).

Two kinds of results are cached, each in its own cache:

- **Verdicts** — the answer to whether a caller may perform an action on a resource.
- **Object filters** — the set of objects of a resource that a caller may access, as used when listing and reading objects.

Each has its own size limit, and the authorization cache can be switched off; see [Configuration](#configuration).

### What an entry is keyed by

An entry is keyed by the caller's **effective permissions**, not by the caller's identity, so users who hold the same permissions share cached results. When a user's permissions change, for example because a role is assigned or removed, the user's next request is checked against the new permissions.

### Keeping authorization decisions fresh

Beyond time-to-live expiry, the authorization cache is cleared in full when a role changes: the same changes that clear the authentication cache (a role is updated or deleted, or its permissions are changed) clear both caches on the instance that processed the change.

A redeployment of the OPA policies does not clear the cache; decisions made under the previous policies are served until they expire.

A change cleared on one `Core` instance reaches the others when their entries expire; see [Effective time of changes](#effective-time-of-changes).

## Certificate chain cache

Resolving a certificate's full chain of trust requires walking issuer relationships in the database. `Core` caches resolved certificate chains so this work is not repeated for every request that needs them.

Because a single certificate change can affect many chains — any chain whose path passes through the changed certificate — the certificate chain cache is cleared in full whenever a certificate is modified, rather than evicting individual entries.

## Cryptographic key item cache

`Core` caches cryptographic key items so that frequently accessed key metadata does not have to be reloaded on every use. Entries are keyed by the key item's UUID and evicted individually whenever that key item changes.

## Connector API client cache

Calls to connectors rely on connector routing information that would otherwise be looked up repeatedly. `Core` caches this per-connector lookup so connector calls avoid the repeated resolution. The entry for a connector is evicted when that connector is edited or deleted, so configuration changes take effect immediately.

## Signing profile cache

`Core` caches signing profiles so that the signing and timestamping pipeline can resolve a profile by name without reloading it from the database on every request. The cache key is the profile's name.

Eviction is deferred until the transaction commits, so a rolled-back change never disturbs the cache. A cached entry is evicted when the profile is updated, deleted, enabled, or disabled. On a rename, both the old name and the new name are evicted so neither access path serves stale data. When the profile's TSP protocol activation changes — a TSP profile is linked or unlinked — the entry is also evicted, and the TSP profile cache is bulk-cleared (see below).

Staleness beyond a single instance follows the pattern described in [Effective time of changes](#effective-time-of-changes): the instance that processed the change invalidates immediately; other instances continue to serve the previous value until their entry expires by time-to-live.

## TSP profile cache

`Core` caches TSP profiles so that both the TSP protocol path (which resolves a profile by name) and the signing-profile path (which resolves by UUID) avoid repeated database lookups. Each profile is cached under **two keys** — its name and its UUID — so a single profile occupies up to two entries. The effective profile capacity of the cache is therefore up to half its configured entry limit.

Eviction follows the same deferred pattern as the signing profile cache. Both keys are evicted together on every mutation — update, delete, enable, or disable — so neither access path can serve stale data independently.

The TSP profile cache is also **bulk-cleared** whenever a signing profile is mutated (updated, deleted, enabled, disabled, or its TSP activation changed). This is because a TSP profile model embeds references to its default signing profile; a signing profile change can affect every TSP profile that references it, so clearing the whole TSP profile cache is the safe choice.

Staleness beyond the processing instance is bounded by the time-to-live, as described in [Effective time of changes](#effective-time-of-changes).

## Time quality configuration cache

`Core` caches time quality configurations, keyed by UUID, so that the signing pipeline can resolve one without a database round-trip on each request.

Eviction is deferred until the transaction commits. The single entry for a configuration is evicted when that configuration is created, updated, or deleted.

In addition to cache eviction, any change to a configuration publishes a configuration-changed event, and deletion publishes a configuration-deleted event. These events are separate from cache eviction: the cache entry is removed so the next load reads fresh data from the database, while the events let other components — such as the time quality monitor — react to the change independently.

Staleness beyond the processing instance is bounded by the time-to-live, as described in [Effective time of changes](#effective-time-of-changes).

## Effective time of changes

How quickly a cached value becomes consistent with a fresh recomputation depends on **where** the change is observed:

- **On the instance that processed the change** — invalidation is immediate. The next request on that instance sees the new value.
- **On other instances in a high-availability deployment** — those instances did not observe the change. Their cached entries continue to serve the previous value until they expire by time-to-live.

In practice this means:

- User-affecting changes (disabling a user, changing role permissions, removing a user's certificate association) become effective platform-wide **within the time-to-live window** — not instantly.
- Credentials revoked **outside** of `Core` are not signaled to the cache. This includes JWTs revoked at the identity provider. The cached authentication outcome remains valid for that credential until its time-to-live elapses.
- A role change clears the entire authentication cache on the processing instance, so every cached identity there re-authenticates on its next request — briefly raising load on the authentication service. It also clears the authorization cache there, so the next checks go to OPA until the cache warms up again.

A change to the trusted client CAs is not signaled to the authentication cache, so the certificates of a removed CA can stay signed in until their entries expire; see [Rotate CAs](../../installation-guide/deployment/client-certificate-authentication.md#rotate-cas).

## Operational considerations

Because caches are held in memory on each `Core` instance, they are not shared across a high-availability deployment: each instance maintains its own cache, and an entry evicted on one instance remains on the others until it expires or is independently evicted there.

Entries also do not survive a restart — caches start empty and warm up as requests arrive. The first requests after a restart pay the full uncached cost; subsequent requests benefit from the cached results as each cache reaches steady state.

## Resetting a cache

In normal operation a cache never needs to be reset by hand. Entries are removed automatically whenever the underlying data changes — a single key is evicted when its object changes, and both the authentication and the authorization cache are cleared in full when a role changes — and any entry that is not invalidated expires on its own once its time-to-live elapses (five minutes by default).

There is **no runtime endpoint to flush a cache**: the management interface exposes only health and info. When a full reset is genuinely required — for example after a direct database change that bypasses `Core` — the supported way to discard all cached state is to **restart the `Core` instance**. Because caches are in-memory and per-instance, they start empty on boot and warm up again as requests arrive; in a high-availability deployment each instance must be restarted to clear its own copy.

## Configuration

The authentication and the authorization cache are configured through these `Core` environment variables, which take effect when `Core` starts. Set them with Helm in the `ilm` chart's [`additionalEnv.variables`](../../installation-guide/deployment/deployment-helm/configurable-parameters.md#customization-parameters), or with the Operator in [`spec.core.env`](../../installation-guide/deployment/deployment-operator/custom-resources/platform.md#per-component-overrides).

| Variable | Default | Meaning |
|---|---|---|
| `AUTH_CACHE_TTL_MINUTES` | `5` | Minutes an authentication result stays cached. |
| `AUTH_CACHE_MAX_SIZE` | `500` | Maximum number of cached results per authentication method. |
| `AUTHZ_CACHE_ENABLED` | `true` | `false` switches the authorization cache off, so every check goes to OPA. |
| `AUTHZ_CACHE_TTL_MINUTES` | `5` | Minutes an authorization decision stays cached. Keep it at or below `AUTH_CACHE_TTL_MINUTES`; `Core` logs a warning otherwise. |
| `AUTHZ_RESOURCE_CACHE_MAX_SIZE` | `10000` | Maximum number of cached verdicts. |
| `AUTHZ_OBJECT_CACHE_MAX_SIZE` | `1000` | Maximum number of cached object filters. |
