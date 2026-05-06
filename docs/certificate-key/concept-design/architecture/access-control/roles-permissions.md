---
sidebar_position: 11
---

# Roles and Permissions

Role consists of the set of actions on available resources that can be allowed or denied. All actions are forbidden by default and all resources and objects inherits from it.

Each role can be associated with multiple users.

## System roles

System role is internal predefined role with the set of permissions that cannot be changed.
It is used mainly for internal purposes and in connection with system user, however other users can be also assigned with system role. 

The following system roles are defined:

| Role         | Description                                                                                                                                                                                    |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `superadmin` | Highest level of privilege in the platform. `superadmin` has the full permissions in the platform. Should be used as initial user and for the breaking glass in case of exceptional situation. |
| `admin`      | `admin` has the full permissions in the platform, manages users and roles, performs system configuration and administration.                                                                   |
| `acme`       | Internal role that is allowed to manage certificates and related operations that are needed as part of the [ACME](../../../protocols/acme/overview.md) protocol.                               |
| `scep`       | Internal role that is allowed to manage certificates and related operations that are needed as part of the [SCEP](../../../protocols/scep/overview.md) protocol.                               |
| `cmp`        | Internal role that is allowed to manage certificates and related operations that are needed as part of the [CMP](../../../protocols/cmp/overview.md) protocol.                                 |
| `localhost`  | Internal role that is allowed to manage authentication and authorization from localhost to enable initial setup and configuration.                                                             |

:::warning
`superadmin` has the full permission in the platform. Therefore, it is recommended to use the `superadmin` role only if needed, for example, as a break glass functionality.
:::
