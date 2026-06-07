---
sidebar_position: 8
---

# Caching

To keep request latency low — especially on the authentication hot path, where the same lookups repeat across many requests — `Core` maintains a number of in-memory caches. Each cache holds the result of an operation that is comparatively expensive to recompute (an authentication decision, a resolved certificate chain, a connector lookup) so that subsequent identical requests are served without repeating the work.

All caches share the same foundation:

- **In-memory and per-instance.** Caches live in the memory of each `Core` instance and are not shared between instances. In a high-availability deployment, every instance warms and invalidates its own caches independently.
- **Bounded.** Each cache is limited both by a time-to-live (an entry expires a fixed time after it is written, **five minutes by default**) and by a maximum number of entries. Both limits are tunable.
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

- **Per-identity** — cached entries for a user are removed when that user's profile is updated, role assignments change, or the user is disabled or deleted. The cached entry for a certificate is removed when its user association changes or when the certificate is revoked through the platform. The next request from that identity re-authenticates.
- **Global** — when a role itself changes (the role is updated or deleted, or its permissions are changed), the entire authentication cache is cleared. Because such a change can affect every user holding that role, clearing all entries is the safe choice; all identities re-authenticate on their next request.

## Certificate chain cache

Resolving a certificate's full chain of trust requires walking issuer relationships in the database. `Core` caches resolved certificate chains so this work is not repeated for every request that needs them.

Because a single certificate change can affect many chains — any chain whose path passes through the changed certificate — the certificate chain cache is cleared in full whenever a certificate is modified, rather than evicting individual entries.

## Cryptographic key item cache

`Core` caches cryptographic key items so that frequently accessed key metadata does not have to be reloaded on every use. Entries are keyed by the key item's UUID and evicted individually whenever that key item changes.

## Connector API client cache

Calls to connectors rely on connector routing information that would otherwise be looked up repeatedly. `Core` caches this per-connector lookup so connector calls avoid the repeated resolution. The entry for a connector is evicted when that connector is edited or deleted, so configuration changes take effect immediately.

## Effective time of changes

How quickly a cached value becomes consistent with a fresh recomputation depends on **where** the change is observed:

- **On the instance that processed the change** — invalidation is immediate. The next request on that instance sees the new value.
- **On other instances in a high-availability deployment** — those instances did not observe the change. Their cached entries continue to serve the previous value until they expire by time-to-live.

In practice this means:

- User-affecting changes (disabling a user, changing role permissions, revoking a user's certificate association) become effective platform-wide **within the time-to-live window** — not instantly.
- Credentials revoked **outside** of `Core` are not signalled to the cache. This includes JWTs revoked at the identity provider and client certificates revoked at the issuing CA but not yet reflected in `Core`'s own certificate state. The cached authentication outcome remains valid for that credential until its time-to-live elapses.
- A role change clears the entire authentication cache on the processing instance, so every cached identity there re-authenticates on its next request — briefly raising load on the authentication service.

## Operational considerations

Because caches are held in memory on each `Core` instance, they are not shared across a high-availability deployment: each instance maintains its own cache, and an entry evicted on one instance remains on the others until it expires or is independently evicted there.

Entries also do not survive a restart — caches start empty and warm up as requests arrive. The first requests after a restart pay the full uncached cost; subsequent requests benefit from the cached results as each cache reaches steady state.

## Resetting a cache

In normal operation a cache never needs to be reset by hand. Entries are removed automatically whenever the underlying data changes — a single key is evicted when its object changes, and the whole authentication cache is cleared when a role changes — and any entry that is not invalidated expires on its own once its time-to-live elapses (five minutes by default).

There is currently **no runtime endpoint to flush a cache**: at present the management interface exposes only health and info, so caches cannot be cleared through an API call today. When a full reset is genuinely required — for example after a direct database change that bypasses `Core` — the supported way to discard all cached state is to **restart the `Core` instance**. Because caches are in-memory and per-instance, they start empty on boot and warm up again as requests arrive; in a high-availability deployment each instance must be restarted to clear its own copy.
