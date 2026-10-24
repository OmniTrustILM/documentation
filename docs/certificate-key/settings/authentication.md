---
sidebar_position: 30
---

# Authentication

`Authentication` settings include options for customizing how authentication is handled, with a focus on managing OAuth 2.0 providers.

## OAuth 2.0 provider management

OAuth 2.0 providers can be managed using [OAuth2 provider settings API](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}).

Example of how to set a provider can be found in [Keycloak Integration Guide](../integration-guides/keycloak/provider-settings).

OAuth 2.0 providers support both sessions, that are useful for browser-based authentication, and also token-based authentication using `Authorization: Bearer` header that is useful for system-based integration.

## Username resolution

When a user authenticates with an OAuth 2.0 provider (browser session or `Authorization: Bearer` token), the platform identity is taken from a single token claim:

- If the provider setting `usernameClaim` is set, that claim is used.
- Otherwise the `username` claim is used.

The effective claim must be present as a non-empty string in the token claims (access token, ID token, or User Info response). There is no fallback: if the claim is missing, authentication fails.

The resolved claim value is the username under which the user is identified. When automatic registration is enabled (`createUnknownUsers`), the user is created with this username. Additionally, roles from the token's `roles` claim are registered automatically when `createUnknownRoles` is enabled.

:::info[Identity providers without a username claim]
Some identity providers, for example Microsoft Entra ID, do not issue a `username` claim and provide `preferred_username` instead. For these providers, set `usernameClaim` to `preferred_username` in the [OAuth2 provider settings](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}).
:::

:::warning[Changing the username claim of an existing provider]
The resolved username is the user's identity. Changing `usernameClaim` (or switching identity providers) changes the username resolved from tokens for existing users, but the platform does not rename accounts automatically. Existing users may no longer match on login if their new resolved username differs from their account name. Audit existing usernames for collisions and rename affected users before changing this setting.
:::

Issuer URLs must be unique across configured OAuth 2.0 providers — the provider is selected by the token's `iss` claim. If multiple providers share the same issuer URL, authentication is rejected.

## Allowed delegates

For OAuth 2.0 bearer tokens carrying `act`, configure the provider's **Allowed delegates** and **Delegate claim** in the administrator interface, or use the [OAuth2 provider settings API](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}).

| Setting | Default | Meaning |
|---|---|---|
| `allowedDelegates` | `[]` | Exact identifiers of systems allowed to act on behalf of users. An empty list refuses every token carrying `act`. There is no wildcard matching. |
| `delegateClaim` | `client_id` | Claim name inside the outermost `act` object used as the delegate identifier. It does not select a top-level token claim. |

For example, merge these fields into the complete configuration of the provider that issues your integration's access tokens:

```json
{
  "allowedDelegates": ["automation-client"],
  "delegateClaim": "client_id"
}
```

Identifiers are case-sensitive and matched exactly. When saved, surrounding whitespace in allowlist entries is removed and empty entries are omitted; duplicate entries and identifiers longer than 255 characters are rejected. The delegate claim name is trimmed and must not be blank. A saved change is audited and takes effect on the next bearer request, including when the user's identity is cached.

Keep `client_id` when the issuer puts a stable client identifier in `act.client_id`, as [Keycloak client delegation](../integration-guides/keycloak/delegation.md) does. Change it only when the issuer uses a different claim inside `act`. For example, use `sub` and allow the actor's subject identifier if that is the only actor identifier the issuer provides. Keycloak's `act.sub` is a service-account user ID; it can change when a realm is recreated or re-imported, so `client_id` is the more stable choice for client delegation.

The platform rejects a token with HTTP `401` when `act` is not an object, the configured delegate claim is missing, blank, or not a string, or its value is not allowed. Nested actors do not change this check: only the outermost `act` is checked and recorded. A token without `act` does not need an allowed delegate.

Allowing a delegate does not grant permissions to it or change the user's authorization. The user's existing roles and permissions govern every operation, including access to RA profiles. The delegate is taken only from the signature-validated access token; changing User Info claims cannot allow a delegate. See [Identification](../concept-design/architecture/access-control/identification.md#delegation-tokens) for token validation and [Audit Logs](../logging/audit-logs.md#delegated-requests) for attribution.
