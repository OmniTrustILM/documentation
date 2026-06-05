---
sidebar_position: 8
---

# Caching

To keep request latency low — especially on the authentication hot path, where the same lookups repeat across many requests — `Core` maintains a number of in-memory caches. Each cache holds the result of an operation that is comparatively expensive to recompute (an authentication decision, a resolved certificate chain, a connector lookup) so that subsequent identical requests are served without repeating the work.

All caches share the same foundation:

- **In-memory and per-instance.** Caches live in the memory of each `Core` instance and are not shared between instances. In a high-availability deployment, every instance warms and invalidates its own caches independently.
- **Bounded.** Each cache is limited both by a time-to-live (an entry expires a fixed time after it is written) and by a maximum number of entries. Both limits are tunable. Caches also record runtime statistics.
- **Transaction-safe invalidation.** When a change requires a cached entry to be removed, the eviction is deferred until the surrounding database transaction commits, so a rolled-back change never disturbs the cache. Within a single transaction, repeated full-cache clears are collapsed into one.

:::info
Caching is transparent to API consumers. A cached result is always equivalent to a freshly computed one; caches affect only how quickly a response is produced, never its content.
:::

## Authentication cache

Authentication is performed on every API request. Without caching, each request would trigger a round-trip to the authentication service. The authentication cache stores the outcome of a successful authentication so that repeated requests from the same identity are served without contacting the authentication service again.

Authentication results are cached separately per authentication method:

- **Client certificate** — keyed by the certificate's fingerprint.
- **Token** — keyed by the token's unique identifier (`jti`).
- **User UUID** — keyed by the user's identifier.
- **System user** — for the platform's internal system user.

Some results are deliberately never cached:

- Anonymous outcomes — which include failed authentication, anonymous access, and localhost access — always go through the authentication service.
- Tokens without a `jti` claim — without a stable identifier they cannot be cached safely, so each such request is authenticated anew.

### Keeping authentication results fresh

Beyond time-to-live expiry, the authentication cache is invalidated whenever a change could affect an authentication decision. Invalidation happens at two granularities:

- **Per-identity** — the cached entries for a single user are removed when that user's profile is updated, the user's role assignments change, or the user is disabled or deleted; and the cached entry for a certificate is removed when its association to a user changes. The next request from that identity re-authenticates.
- **Global** — when a role itself changes (the role is updated or deleted, or its permissions are changed), the entire authentication cache is cleared. Because such a change can affect every user holding that role, clearing all entries is the safe choice; all identities re-authenticate on their next request.

## Certificate chain cache

Resolving a certificate's full chain of trust requires walking issuer relationships in the database. `Core` caches resolved certificate chains so this work is not repeated for every request that needs them.

Because a single certificate change can affect many chains — any chain whose path passes through the changed certificate — the certificate chain cache is cleared in full whenever a certificate is modified, rather than evicting individual entries.

## Cryptographic key item cache

`Core` caches cryptographic key items so that frequently accessed key metadata does not have to be reloaded on every use. Entries are keyed by the key item and evicted individually whenever that key item changes.

## Connector API client cache

Calls to connectors rely on connector routing information that would otherwise be looked up repeatedly. `Core` caches this per-connector lookup so connector calls avoid the repeated resolution. The entry for a connector is evicted when that connector is edited or deleted, so configuration changes take effect immediately.

## Operational considerations

Because caches are held in memory on each `Core` instance, they are not shared across a high-availability deployment: each instance maintains its own cache, and an entry evicted on one instance remains on the others until it expires or is independently evicted there. Entries also do not survive a restart — caches start empty and warm up as requests arrive.

The time-to-live and maximum size of each cache express a trade-off between freshness and performance. Larger sizes and longer lifetimes reduce recomputation but increase memory use. The defaults are chosen to be safe for typical deployments and can be tuned where needed.
