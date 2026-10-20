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

For certificate authentication, the TLS terminator verifies that the client holds the certificate's private key, and `Auth` validates the certificate chain and identifies the registered user. To set it up, follow [Client Certificate Authentication](../../../installation-guide/deployment/client-certificate-authentication.md).

The identity of the authenticated user is forwarded to the [authentication service](./identification.md), which performs identification against the platform's user store. To keep this hot path fast, `Core` caches successful authentication outcomes; see [Caching](../caching.md).

:::info
Based on the technology being used for externalized authentication, multi-factor authentication (MFA) or risk-based authentication (RBA), and any other modern authentication methods may be applied.
:::

:::info
One of the tested authentication servers is [Keycloak](https://www.keycloak.org/). Keycloak can integrate with the API gateway using OIDC and supports integration to various identity providers including various authentication flows.
:::
