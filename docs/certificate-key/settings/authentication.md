---
sidebar_position: 30
---

# Authentication

`Authentication` settings include options for customizing how authentication is handled, with a focus on managing OAuth 2.0 providers.

## OAuth 2.0 provider management

OAuth 2.0 providers can be managed using [OAuth2 provider settings API](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}).

Example of how to set a provider can be found in [Keycloak Integration Guide](../integration-guides/keycloak/provider-settings).

OAuth 2.0 providers support both sessions, that are useful for browser-based authentication, and also token-based authentication using `Authorization: Bearer` header that is useful for system-based integration.

### Concurrent changes

When two administrators edit the same provider, the later save does not silently overwrite the earlier one. In the administrator interface, a save is refused when the provider was changed since its form was opened; reload the provider to see the current settings and make the change again.

The API offers the same protection. The [provider's settings](/api/core-other#tag/settings/GET/v1/settings/authentication/oauth2Providers/{providerName}) are returned with an `ETag` header. Send that value in the `If-Match` header of the [update](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}), and the update is refused with `412 Precondition Failed` when the provider changed since it was read, or no longer exists:

```json
{
  "message": "OAuth2 provider 'keycloak' was changed since it was read. Reload it and try again."
}
```

`If-Match: *` matches any existing provider. An update without `If-Match` applies unconditionally. The client secret does not contribute to the tag, so a change of the secret alone does not refuse an update.

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

## Sign-in for applications

Applications that call the API on behalf of a user, such as a command-line tool or a desktop client, need to know where to obtain a token. The platform publishes this as OAuth 2.0 Protected Resource Metadata ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)): a public document that lists the OAuth 2.0 providers enabled for applications. An application reads the document, lets the user sign in at one of the listed providers, and calls the API with the access token in the `Authorization: Bearer` header.

### Enable a provider for applications

A provider is listed once its `applications` block is enabled in the [OAuth2 provider settings](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}):

| Field | Description |
|---|---|
| `enabled` | Lists the provider in the document. Default `false`; a provider without the block is not listed. Requires the provider's `issuerUrl`, which is published, so it must be an `http` or `https` URL with a valid host name and without credentials, query or fragment. |
| `name` | Name an application shows to its users. The provider name is used when not set. |
| `clientId` | Client ID that applications use. It must differ from the provider's `clientId`, which is the confidential client of the platform's own browser login. |
| `scopes` | Scopes that applications request. Blank entries are refused; duplicates are removed. |
| `resource` | Resource indicator ([RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)) that applications send to the provider: an absolute `http` or `https` URI without credentials or a fragment. |

Applications cannot keep a client secret, so their client in the identity provider is a public client that uses the authorization code flow with PKCE. The tokens it issues are validated like any other bearer token of the provider: they must carry an accepted audience and the claim described in [Username resolution](#username-resolution).

An example for Keycloak is in the [Keycloak Integration Guide](../integration-guides/keycloak/provider-settings#sign-in-for-applications).

### Protected resource metadata

The document is served without authentication at `https://<PLATFORM_DOMAIN>/.well-known/oauth-protected-resource/api`. Check it with `curl`:

```bash
curl https://<PLATFORM_DOMAIN>/.well-known/oauth-protected-resource/api
```

With the provider `keycloak` from the Keycloak example enabled for applications, the response is:

```json
{
  "resource": "https://<PLATFORM_DOMAIN>/api",
  "resource_name": "OmniTrust ILM",
  "authorization_servers": ["https://<KEYCLOAK_DOMAIN>/realms/ILM/"],
  "bearer_methods_supported": ["header"],
  "otilm_authorization_servers": [
    {
      "issuer": "https://<KEYCLOAK_DOMAIN>/realms/ILM/",
      "name": "Keycloak",
      "client_id": "ilm-applications",
      "scopes": ["openid"]
    }
  ]
}
```

- `resource` and the address of the document are derived from the request, so they follow the domain under which the platform is reached.
- `authorization_servers` holds the `issuerUrl` of every provider enabled for applications, ordered by provider name.
- `otilm_authorization_servers` holds one entry per listed provider with the details an application needs to sign in. `client_id` and `resource` appear only when they are set; `scopes` is always present and may be empty.
- When no provider is enabled for applications, both lists are empty.

The document contains nothing else from the provider settings.

### Authentication challenge

Every request that the API refuses with `401 Unauthorized` carries a `WWW-Authenticate` header that points to the document, so an application can find where to sign in without prior configuration:

```bash
curl -i https://<PLATFORM_DOMAIN>/api/v1/auth/profile
```

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://<PLATFORM_DOMAIN>/.well-known/oauth-protected-resource/api"
```

When a bearer token was sent and refused, the header keeps the error parameters of [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750#section-3) and adds the same parameter at the end, for example `Bearer error="invalid_token", error_description="...", error_uri="...", resource_metadata="..."`.
