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
