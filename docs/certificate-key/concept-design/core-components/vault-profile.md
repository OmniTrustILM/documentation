---
sidebar_position: 20
---

# Vault Profile

`Vault Profile` can be used to manage secrets in a `Vault` in a more granular way. It is created on top of a `Vault` and defines the configuration for managing secrets in that vault.

`Vault Profile` has the following parameters:

| Parameter     | Description                                                                    |
|---------------|--------------------------------------------------------------------------------|
| Name          | Name of the `Vault Profile`                                                    |
| Description   | Optional description of the `Vault Profile`                                    |
| `Vault`       | Reference to the parent `Vault` instance                                       |
| Enabled       | Whether the `Vault Profile` is enabled (defaults to enabled)                   |
| `Attributes`  | `Attributes` defined by `Connector` implementation for the `Vault Profile`     |

### Source and Sync Profiles

`Vault Profile` can be either a source profile for a `Secret` or a sync profile for a `Secret`, see [Secret](secret.md).
When `Vault Profile` is a source profile, access to a secret is based on access to the `Vault Profile`. When a source `Vault Profile` is disabled, operations on secrets in that vault profile are not allowed.

### Supported `Attributes`

`Vault Profile` supports the following `Attribute` types:
- **Connector Attributes** — defined by the `Connector` implementation. These attributes configure the profile-specific settings for managing secrets and vary depending on the `Vault`.
- **Custom Attributes** — user-defined attributes that can be attached to the `Vault Profile` for additional categorization and metadata.

For more information about `Attributes`, refer to [A<sup>2</sup> Engine](../architecture/attributes/overview.md).

For management of `Vault Profiles`, see [Vault Profile Management API](/api/core-vault-profile/).
