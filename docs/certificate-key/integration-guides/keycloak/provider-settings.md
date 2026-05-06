---
sidebar_position: 5
---

# Configure OAuth2 Provider

In order to be able to use Keycloak for authentication, it must be configured in  [Authentication Settings](../../settings/authentication.md) as OAuth2 provider.

OpenID Endpoint Configuration can be found at `https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/.well-known/openid-configuration`. An excerpt from the configuration with relevant endpoints could look like this:

```json
{
    "issuer":"https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/",
    "authorization_endpoint":"https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/auth",
    "token_endpoint":"https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/token", ...,
    "end_session_endpoint":"https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/logout", ..., 
    "jwks_uri":"https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/certs",...
}
```

In the example, the name of provider will be set `keycloak`, authentication with JWT token will be enabled, only tokens with audience `czertainly` will be accepted and the user will be logged out after 10 minutes. Since the client is of type OpenID Client, the scopes must include `openid` scope.

To create such provider, a request to the [Update OAuth2 Provider settings API](/api/core-other#tag/Settings/operation/updateOAuth2ProviderSettings) should be made with following JSON body:

```json
{
    "issuerUrl": "https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/",
    "clientId": "CZERTAINLY",
    "clientSecret": "CZERTAINLY-client-secret",
    "authorizationUrl": "https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/auth",
    "tokenUrl": "https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/token",
    "jwkSetUrl": "https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/certs",
    "scope": ["openid"],
    "logoutUrl": "https://<KEYCLOAK_DOMAIN>/realms/CZERTAINLY/protocol/openid-connect/logout",
    "postLogoutUrl": "https://<CZERTAINLY_DOMAIN>/administrator/",
    "audiences": ["czertainly"],
    "sessionMaxInactiveInterval": 600
}
```
