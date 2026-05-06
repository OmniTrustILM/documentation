---
sidebar_position: 1
---

# Overview

This integration guide describes how to integrate platform with [Keycloak](https://www.keycloak.org/) as an authentication server.

CZERTAINLY access control decouples the identification, authentication, and authorization process. It provides flexible configuration of [Externalized Authentication](../../concept-design/architecture/access-control/externalized-authentication).

:::info[Access Control]
To get more information about the identification, authentication, and authorization process, refer to [Access Control](../../concept-design/architecture/access-control/overview).
:::

## Keycloak

Keycloak is an open source identity and access management solution. It provides a single place to manage all your users and applications. It can be used to secure applications and services with little to no code. It also support single sign-on and other advanced features like multi-factor authentication or risk-based authentication.

Enterprise grade authentication can be achieved by integrating Keycloak with CZERTAINLY.

:::warning[Keycloak installation]
This integration guide assumes that you have already installed and configured Keycloak. For more information, refer to [Keycloak documentation](https://www.keycloak.org/documentation.html).
:::

## Integration

The following steps should be done to integrate Keycloak with CZERTAINLY:

| #     | Reference                                                  | Short description                                                |
|-------|------------------------------------------------------------|------------------------------------------------------------------|
| **1** | [Create Realm and Client](create-realm.md)                 | Create and configure new Keycloak Realm and Client               |
| **2** | [Configure OAuth2 Provider](provider-settings.md)          | Add Keycloak provider to CZERTAINLY OAuth2 provider settings     |
| **3** | [Create User and Login](create-user-login.md)              | Create new Keycloak User for CZERTAINLY and login                |
| **4** | **(Optional)** [Add CZERTAINLY Theme](czertainly-theme.md) | Add CZERTAINLY custom theme to Keycloak and realm                |

## Identity providers

For the first experiments with Keycloak, you would probably just [create local users](create-user-login.md).

For production, you can configure Identity Providers together with appropriate attribute mapping to allow users to log in to CZERTAINLY with their existing accounts from your organizational IdP. Keycloak supports multiple identity providers. For more information, refer to [Identity Providers](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker) in the Keycloak documentation.

:::tip[MS Active Directory Federation Services]
You can also use [MS Active Directory Federation Services](../adfs/overview.mdx) integration guide for more information on how to federate AD users with Keycloak.
:::
