---
sidebar_position: 3
---

# Create Realm and Client

:::warning[Keycloak version]
Based on your Keycloak version, steps to create realm and OIDC client may differ. Refer to the Keycloak documentation specific for your Keycloak version.
:::

Keycloak realm provides a management space where you can create users and give them permissions to use CZERTAINLY.
CZERTAINLY realm can be considered as a kind of isolation you want to have for your users and applications using the platform.

You can create multiple realms in Keycloak for more granular isolation of use-cases related to the platform. For the purpose of this guide, we will create one new realm for CZERTAINLY.

To protect using OpenID connect protocol, we will need to create an OIDC client in the respective realm.

## Create Realm

To create a new realm, follow steps in [Creating a realm](https://www.keycloak.org/docs/latest/server_admin/#proc-creating-a-realm_server_administration_guide) with the following attributes:

- Realm name: **CZERTAINLY**

## Create OIDC Client

To create new OIDC client, follow steps described in [Creating an OpenID Connect client](https://www.keycloak.org/docs/latest/server_admin/#proc-creating-oidc-client_server_administration_guide) with the following attributes:

- Client type: **OpenID Connect**
- Client ID: **czertainly**
- Name: **czertainly**
- Client authentication: **On**
- Root URL: **https://\<CZERTAINLY_DOMAIN>**, where `<CZERTAINLY_DOMAIN>` is the domain of your CZERTAINLY instance. This serves as an access point to your deployment
- Valid redirect URIs: URI pointing to redirect in Core after login via Keycloak, must contain `https://<CZERTAINLY_DOMAIN>/api/login/oauth2/code/<oauth2ProviderName>`, where `oauth2ProviderName` is the `providerName` of OAuth2 Provider configured in platform [settings](/api/core-other#tag/Settings/operation/updateOAuth2ProviderSettings)
- Valid post logout redirect URIs: list of valid post logout redirect URIs, for example `https://<CZERTAINLY_DOMAIN>/administrator/`

:::warning[URIs and origins]
Valid URIs and web origins should be properly configured to avoid any security related issues, for example Cross-origin resource sharing (CORS) issues.
:::

### Configure CZERTAINLY dedicated scope

The user in the platform is identified using JWT Access Token as described in the [Identification](../../concept-design/architecture/access-control/identification#json-web-token-jwt) part of the access control.

Based on the attributes coming from the configuration of the identity provider, proper mappers for the dedicated scope should be created.
For more information, see [OIDC token and SAML assertion mappings](https://www.keycloak.org/docs/latest/server_admin/#_protocol-mappers) in the Keycloak documentation.

As an example, for situation you are going to use manual user management in Keycloak, you need to create mapper that will map `groups` attributes to array of `roles` in the JWT Claims Set. After adding **czertainly** client, click on **Client scopes tab**, select **czertainly-dedicated** and add following mappers:

#### Groups Mapper
- Mapper type: **User Attribute**
- Name: **Groups**
- User Attribute: **groups**
- Token Claim Name: **roles**
- Claim JSON Type: **String**
- Add to ID token: **On**
- Add to access token: **On**
- Add to lightweight access token: **Off**
- Add to userinfo: **On**
- Add to token introspection: **On**
- Multivalued: **On**
- Aggregate attribute values: **Off**

#### Audience Mapper
- Mapper type: **Audience**
- Name: **Audience**
- Included Client Audience: **czertainly**
- Included Custom Audience: **empty**
- Add to ID token: **On**
- Add to access token: **On**
- Add to lightweight access token: **Off**
- Add to token introspection: **On**

#### Username Mapper
- Mapper type: **User Property**
- Name: **Username**
- Property: **username**
- Token Claim Name: **username**
- Claim JSON Type: **String**
- Add to ID token: **On**
- Add to access token: **On**
- Add to lightweight access token: **Off**
- Add to userinfo: **On**
- Add to token introspection: **On**