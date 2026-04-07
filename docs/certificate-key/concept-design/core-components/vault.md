---
sidebar_position: 19
---

# Vault

`Vault` is the first resource you create when working with secrets. It establishes the connection to a secret provider and represents the provider-side storage where secrets are kept. From a specific `Vault` instance, you can then create `Vault Profiles` to further manage secrets.

The information held by the `Vault` is defined by the `Connector` and the specific [Secret Provider](../../connectors/provider-interfaces/secret-provider.md) interface version it implements. `Secret Provider` uses `Attributes` to get the data needed to establish the connection to the vault.

`Vault` has the following parameters:

| Parameter         | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name              | Name of the `Vault`                                                                                                                                              |
| `Secret Provider` | Identification of `Connector` implementing the `Secret Provider` `Function Group`                                                                                |
| Interface         | [Secret Provider](../../connectors/provider-interfaces/secret-provider.md) interface version supported by the `Connector`                                        |
| `Attributes`      | `Attributes` defined by `Connector` implementation and the specific interface                                                                                    |

### `Secret Provider`

- One `Connector` can serve for more than one `Vault`.
- Inputs for the `Connector` to determine the vault are captured and stored in the `Vault`.

For more information, refer to [Secret Provider](../../connectors/provider-interfaces/secret-provider.md) description.

### `Vault Profile`

`Vault Profile` is created on top of the `Vault`. For more information, refer to [Vault Profile](./vault-profile.md).

For `Vault Management`, see [Vault Management API](/api/core-vault/).
