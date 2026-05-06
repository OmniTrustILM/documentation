---
sidebar_position: 7
---

# Create User and Login

Create user in the CZERTAINLY realm following steps described in the [Creating users](https://www.keycloak.org/docs/latest/server_admin/#proc-creating-user_server_administration_guide) section of the Keycloak documentation, with these attributes:
- Username: **admin**
- Email: **admin@czertainly.local**
- First name: **CZERTAINLY**
- Last name: **Administrator**

You can use the attributes mapping to define roles for the user. For that purpose, set the user attributes according to [Configuring user attributes](https://www.keycloak.org/docs/latest/server_admin/#proc-configuring-user-attributes_server_administration_guide):
- groups: **superadmin**

This will map the `groups` attribute to the `roles` attribute in the token of the user and the resulting token will contain the following roles:
```json
{
  "email_verified": true,
  "roles": [
    "superadmin"
  ],
  "username": "admin",
  "sub": "5560f639-8067-415d-85ae-809b06e48d19",
  "given_name": "CZERTAINLY",
  "family_name": "Administrator",
  "email": "admin@czertainly.local",
  "id": "5560f639-8067-415d-85ae-809b06e48d19",
  "preferred_username": "admin",
  "name": "CZERTAINLY Administrator"
}
```

:::info[Automatic registration of user and roles]
By default the users and roles that do not exists are rejected. However, in some cases, it is desirable to automatically register the user and roles. This is required for example when single sign-on (SSO) and user federation is allowed. The behavior of the user and roles registration is controlled by the values `createUnknownUsers` and `createUnknownRoles` in the `Auth` service. If you want to enable automatic registration of users and roles, set the following values when installing or upgrading Helm chart:
```yaml
authService:
  createUnknownUsers: "true"
  createUnknownRoles: "true"
```
:::

## Login

You can login to CZERTAINLY with configured user:
- Open the CZERTAINLY login page: `https://<CZERTAINLY_DOMAIN>/login?redirect=%2Fadministrator%2F`
- Login with username `admin`
