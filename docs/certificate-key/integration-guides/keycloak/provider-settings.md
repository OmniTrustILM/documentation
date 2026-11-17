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

## Sign-in for applications

To let applications sign in through Keycloak, as described in [Sign-in for applications](../../settings/authentication.md#sign-in-for-applications), create a second OIDC client in the **ILM** realm:

- Client type: **OpenID Connect**
- Client ID: **ilm-applications**
- Client authentication: **Off**
- Authentication flow: **Standard flow** only
- Valid redirect URIs: the redirect URIs of the applications
- Proof Key for Code Exchange Code Challenge Method (in the client's **Advanced** settings): **S256**

The tokens of this client must be accepted by the provider, so add the same **Audience** and **Username** mappers to its dedicated scope as for the **ilm** client, with Included Client Audience **ilm**, and the **Groups** mapper if roles come from Keycloak groups.

Then add the `applications` block to the provider. The request replaces the provider settings, so it carries the whole body:

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
    "sessionMaxInactiveInterval": 600,
    "applications": {
        "enabled": true,
        "name": "Keycloak",
        "clientId": "ilm-applications",
        "scopes": ["openid"]
    }
}
```

The provider then appears in the protected resource metadata of the platform at `https://<PLATFORM_DOMAIN>/.well-known/oauth-protected-resource/api`.
