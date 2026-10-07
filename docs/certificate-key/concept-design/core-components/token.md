---
sidebar_position: 15
---

# Token

`Token` holds information about the connection to specific cryptographic technology that can be used to manage keys and request cryptographic operations.

The information held by the `Token` is defined by the `Connector`.
`Cryptography Provider` uses `Attributes` to get the data needed to establish the connection with the `Token`.

`Token` has the following parameters:

| Parameter               | Description                                                                             |
|-------------------------|-----------------------------------------------------------------------------------------|
| Name                    | Name of the `Token`                                                                     |
| `Cryptography Provider` | Identification of `Connector` implementing the `Cryptography Provider` interface        |
| `Kind`                  | `Kind` of the technology implemented by a Cryptography Provider v1 `Connector`          |
| `Attributes`            | `Attributes` defined by the `Connector` implementation                                  |

### `Cryptography Provider`

A `Token` is bound to the interface version its `Connector` reports at creation. The `Token` keeps that version for its whole life. A `Token` on the default [Cryptography Provider v2](../../connectors/provider-interfaces/cryptography-provider-v2.md) lives only in the platform. That `Token` is usable as soon as the `Connector` reaches it. A `Token` on the deprecated [Cryptography Provider v1](../../connectors/provider-interfaces/cryptography-provider.md) also has a copy in its `Connector`. That copy is activated before use.

### `Token Profile`

`Token Profile` is created on top of the `Token`. For more information, refer to [Token Profile](./token-profile.md).
