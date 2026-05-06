# Externalized Authentication

Platform relies on the externalized authentication of the users.

Platform expects to get authenticated user data, meaning that the authentication was already performed by the external server.

External authentication can be performed using various mechanisms, including, but not limited to (depending on the technology):
- certificate-based authentication
- single-sign on using SAML 2.0 or OAuth 2.0
- OpenID Connect

The identity of authenticated user is forwarded to the identification service.

:::info
Based on the technology being used for externalized authentication, multi-factor authentication (MFA) or risk-based authentication (RBA), and any other modern authentication methods may be applied.
:::

:::info
One of the tested authentication servers is [Keycloak](https://www.keycloak.org/). Keycloak can integrate with the API gateway using OIDC and supports integration to various identity providers including various authentication flows.
:::

## Authentication Cache

The authentication cache improves performance by caching resolved user identities to avoid repeated auth-service lookups. This caching mechanism stores authentication information for users authenticated via certificates or tokens.

### Configuration

Authentication cache can be configured through Helm chart values:

```yaml
caching:
  authentication:
    ttlMinutes: 5   # How long a cached identity is considered valid
    maxSize: 500    # Maximum number of cached identities
```

For more details on configurable parameters, see [Helm chart configurable parameters](../../../installation-guide/deployment/deployment-helm/configurable-parameters#local-parameters).

### Cache Behavior

- **TTL (Time To Live)**: Determines how long authentication information remains in the cache before it expires
- **Max Size**: Limits the maximum number of cached identities to prevent excessive memory usage