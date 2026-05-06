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

| Name        | Short description                      |
|-------------|----------------------------------------|
| `acme`      | System user for ACME client operations |
| `scep`      | System user for SCEP client operations |
| `cmp`       | System user for CMP client operations  |
| `localhost` | System user for local operations       |

## Anonymous user

When user cannot be identified in any way, it will be considered as *anonymous*.
Anonymous user has limited permissions and can execute only the following actions:
- Register connector
