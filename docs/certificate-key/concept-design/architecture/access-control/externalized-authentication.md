---
sidebar_position: 3
---

# Externalized Authentication

Platform relies on the externalized authentication of the users.

Platform expects to get authenticated user data, meaning that the authentication was already performed by the external server.

External authentication can be performed using various mechanisms, including, but not limited to (depending on the technology):
- certificate-based authentication
- single-sign on using SAML 2.0 or OAuth 2.0
- OpenID Connect

The identity of authenticated user is forwarded to the identification service. To keep this hot path fast, `Core` caches successful authentication outcomes; see [Caching](../caching.md).

:::info
Based on the technology being used for externalized authentication, multi-factor authentication (MFA) or risk-based authentication (RBA), and any other modern authentication methods may be applied.
:::

:::info
One of the tested authentication servers is [Keycloak](https://www.keycloak.org/). Keycloak can integrate with the API gateway using OIDC and supports integration to various identity providers including various authentication flows.
:::
