---
sidebar_position: 9
---

# Users

User represents person or third-party system that should be allowed to work with the platform (in the context of assigned roles and permissions).

User can be associated with the X.509 certificate. In such case, the user can be identified based on this X.509 certificate. This is useful for system integrations where you do not need to issue access tokens and authenticate through external authentication server every time action should be executed

User can be assigned with multiple roles. In this case, permissions from all assigner roles will be merged to form authorization token for the user.

## System users

System users are used only for internal purposes. System users can elevate permissions and perform actions that are otherwise subject to authorization. These users are not exposed to external authentication system, nor they can be edited and changed.

The following system users are defined:

| Name                         | Short description                                                                          |
|------------------------------|--------------------------------------------------------------------------------------------|
| `acme`                       | System user for ACME client operations                                                     |
| `scep`                       | System user for SCEP client operations                                                     |
| `cmp`                        | System user for CMP client operations                                                      |
| `est`                        | System user for EST client operations                                                      |
| `localhost`                  | System user for local operations                                                           |
| `attribute-content-resolver` | System user for resolving an authority's own infrastructure references when assembling connector requests |

Each is created together with a [system role](roles-permissions.md#system-roles) of the same name, and that pairing is the whole permission boundary of the identity. Because either half of it could be edited to widen the identity or to hand its permissions to an operator, the platform enforces the following:

- a role paired with a system user accepts no other members, so it cannot be given to a person;
- the system user cannot be detached from its role, whether by removing it, by clearing the user's roles, or by a membership update that omits it;
- a system user holds only its own role and cannot be added to another;
- a system user cannot be enabled or disabled — disabling one would stop the protocol or operation that authenticates as it.

:::note
`superadmin`, `admin` and `auditor` are system roles with no system user behind them, so none of these restrictions applies to them. They are assigned to people; see [Roles and Permissions](roles-permissions.md#system-roles).
:::

## Anonymous user

When user cannot be identified in any way, it will be considered as *anonymous*.
Anonymous user has limited permissions and can execute only the following actions:
- Register connector — this is the unauthenticated connector-registration endpoint, not the `register` action of the `connectors` resource
