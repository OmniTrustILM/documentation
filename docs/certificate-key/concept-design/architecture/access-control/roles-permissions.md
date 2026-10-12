---
sidebar_position: 11
---

# Roles and Permissions

Role consists of the set of actions on available resources that can be allowed or denied. All actions are forbidden by default and all resources and objects inherits from it.

Each role can be associated with multiple users.

## System roles

System role is internal predefined role whose permissions are maintained by the platform and cannot be edited by an administrator.

Some system roles are paired with a [system user](users.md#system-users) — the identity the platform authenticates as when it performs an operation on its own behalf. Others exist to be assigned to people: `superadmin`, `admin` and `auditor` have no system user behind them.

The following system roles are defined:

| Role                         | Paired system user | Description                                                                                                                                                                                    |
|------------------------------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `superadmin`                 | no                 | Highest level of privilege in the platform. `superadmin` has the full permissions in the platform. Should be used as initial user and for the breaking glass in case of exceptional situation. |
| `admin`                      | no                 | `admin` has the full permissions in the platform, manages users and roles, performs system configuration and administration.                                                                   |
| `auditor`                    | no                 | Read-only oversight. Holds the read actions of every resource, apart from those returning stored secret material, and no action that changes anything. See [Auditor role](#auditor-role).       |
| `acme`                       | yes                | Internal role that is allowed to manage certificates and related operations that are needed as part of the [ACME](../../../protocols/acme/overview.md) protocol.                               |
| `scep`                       | yes                | Internal role that is allowed to manage certificates and related operations that are needed as part of the [SCEP](../../../protocols/scep/overview.md) protocol.                               |
| `cmp`                        | yes                | Internal role that is allowed to manage certificates and related operations that are needed as part of the [CMP](../../../protocols/cmp/overview.md) protocol.                                 |
| `localhost`                  | yes                | Internal role that is allowed to manage authentication and authorization from localhost to enable initial setup and configuration.                                                             |
| `attribute-content-resolver` | yes                | Internal role used when the platform resolves an authority's own infrastructure references (connector, credential, secret, certificate, authority, entity, location, vault profile) while assembling a request to a connector. Holds read actions on those resources, including the sensitive read that returns secret content — see [Action access types](#action-access-types). |

:::warning
`superadmin` has the full permission in the platform. Therefore, it is recommended to use the `superadmin` role only if needed, for example, as a break glass functionality.
:::

Any role granting access to all resources (`superadmin` and `admin` among them) can only be assigned by a user who already holds all resources. So a `superadmin` can grant `superadmin` or `admin`, while an administrator who only manages users cannot grant either. Without this, the permission to manage users would be enough to grant oneself full administration.

Further restrictions apply to roles paired with a system user; see [System users](users.md#system-users).

## Auditor role

`auditor` holds the read actions of every resource — apart from the two below, which return stored secret material — and no action that changes anything. It is intended for oversight — auditors, security reviewers, support — so that read access can be granted with one role instead of a permission set assembled by hand, which drifts behind the platform as resources are added.

Its permissions are not maintained by hand and are not seeded once. On every startup the platform derives them from the actions it discovers in the code, so a resource or action added in a later release is covered by the role as soon as it exists.

Two kinds of read are deliberately **excluded**, because they disclose stored secret material rather than describing it:

| Excluded action                | Why                                                                                                     |
|--------------------------------|---------------------------------------------------------------------------------------------------------|
| `secrets` / `getSecretContent` | Returns the secret value itself from the source vault.                                                  |
| `proxies` / `getProxyInstallation` | Returns installation instructions containing live credentials for the proxy to authenticate with.   |

Everything else readable is included, so an auditor can list and open certificates, keys, secrets metadata, discoveries, connectors, RA profiles, users, roles and their permissions, approvals, settings and the audit log.

:::info[Assigning the auditor role]
`auditor` is a system role but carries no system user, so it is assigned to people like any ordinary role. Its permission set is fixed by the platform and cannot be edited.
:::

## Action access types

Every action a resource offers is classified by what it does, and the classification is what decides whether a read-only role such as [`auditor`](#auditor-role) receives it.

| Access type      | Meaning                                                                                                                    | In `auditor` |
|------------------|----------------------------------------------------------------------------------------------------------------------------|--------------|
| `READ`           | Returns information without changing anything.                                                                             | yes          |
| `SENSITIVE_READ` | Returns stored secret material.                                                                                            | no           |
| `WRITE`          | Changes platform state, has an effect in a system the platform calls, or uses platform key material.                        | no           |
| `NOT_GRANTABLE`  | Internal markers that are never stored as a permission.                                                                    | no           |

`WRITE` covers more than persistence. Signing, encryption, decryption, verification and timestamping change nothing that is stored, but they use platform key material, so they are not available to a read-only role. Triggering a compliance check is also `WRITE`, because it writes the compliance result; reading a result afterwards is a `READ` on the certificate.

:::note
The classification lives with the action definitions in the [`ResourceAction` enum](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/core/model/auth/ResourceAction.java). Adding an action requires classifying it — see [Extending resources and actions](../../../../contributors/access-control.md#extending-resources-and-actions).
:::
