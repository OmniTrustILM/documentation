---
sidebar_position: 30
---

# Authentication

`Authentication` settings include options for customizing how authentication is handled, with a focus on managing OAuth 2.0 providers.

## OAuth 2.0 provider management

OAuth 2.0 providers can be managed using [OAuth2 provider settings API](/api/core-other#tag/Settings/operation/updateOAuth2ProviderSettings).

Example of how to set a provider can be found in [Keycloak Integration Guide](../integration-guides/keycloak/provider-settings).

OAuth 2.0 providers support both sessions, that are useful for browser-based authentication, and also token-based authentication using `Authorization: Bearer` header that is useful for system-based integration.
