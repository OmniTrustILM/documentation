---
sidebar_position: 15
---

# Token

`Token` holds information about the connection to specific cryptographic technology that can be used to manage keys and request cryptographic operations.

The information held by the `Token` varies depending on the `Kind` of the underneath `Cryptography Provider` and is defined by the `Connector`.
`Cryptography Provider` uses `Attributes` to get the data needed to establish the connection with the `Token`.

`Token` has the following parameters:

| Parameter               | Description                                                                             |
|-------------------------|-----------------------------------------------------------------------------------------|
| Name                    | Name of the `Token`                                                                     |
| `Cryptography Provider` | Identification of `Connector` implementing the `Cryptography Provider` `Function Group` |
| `Kind`                  | `Kind` of the technology implemented by the `Connector`                                 |
| `Attributes`            | `Attributes` defined by `Connector` implementation and the specific `Kind`              |

### `Cryptography Provider`

For more information, refer to [Cryptography Provider](../../connectors/provider-interfaces/cryptography-provider.md) description.

### `Token Profile`

`Token Profile` is created on top of the `Token`. For more information, refer to [Token Profile](./token-profile.md).
