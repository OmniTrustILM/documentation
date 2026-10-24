---
sidebar_position: 5
---

# Configure OAuth2 Provider

In order to be able to use Keycloak for authentication, it must be configured in  [Authentication Settings](../../settings/authentication.md) as OAuth2 provider.

OpenID Endpoint Configuration can be found at `https://<KEYCLOAK_DOMAIN>/realms/ILM/.well-known/openid-configuration`. An excerpt from the configuration with relevant endpoints could look like this:

```json
{
    "issuer":"https://<KEYCLOAK_DOMAIN>/realms/ILM/",
    "authorization_endpoint":"https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/auth",
    "token_endpoint":"https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/token", ...,
    "end_session_endpoint":"https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/logout", ..., 
    "jwks_uri":"https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/certs",...
}
```

In the example, the name of provider will be set `keycloak`, authentication with JWT token will be enabled, only tokens with audience `ilm` will be accepted and the user will be logged out after 10 minutes. Since the client is of type OpenID Client, the scopes must include `openid` scope.

To create such provider, a request to the [Update OAuth2 Provider settings API](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName}) should be made with following JSON body:

```json
{
    "issuerUrl": "https://<KEYCLOAK_DOMAIN>/realms/ILM/",
    "clientId": "ilm",
    "clientSecret": "ilm-client-secret",
    "authorizationUrl": "https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/auth",
    "tokenUrl": "https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/token",
    "jwkSetUrl": "https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/certs",
    "scope": ["openid"],
    "logoutUrl": "https://<KEYCLOAK_DOMAIN>/realms/ILM/protocol/openid-connect/logout",
    "postLogoutUrl": "https://<PLATFORM_DOMAIN>/administrator/",
    "audiences": ["ilm"],
    "sessionMaxInactiveInterval": 600
}
```

## Allow delegated integrations

Delegation is disabled for the provider until `allowedDelegates` contains the integration's exact identifier. For Keycloak client delegation, keep `delegateClaim: "client_id"` and add the actor client's ID, for example `automation-client`, to `allowedDelegates`. Merge the fields into the complete provider configuration above; they do not replace the issuer, audience, or user mapping settings.

See [Authentication settings](../../settings/authentication.md#allowed-delegates) for validation and [Delegate access through token exchange](delegation.md) for the Keycloak setup. The provider validates the resulting access token; the exchange itself happens at Keycloak's token endpoint.
