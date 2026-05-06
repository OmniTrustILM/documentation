---
sidebar_position: 6
---

# Authority

`Authority` holds the access information related to the certificate authority technology, i.e., it contains the information of which CA to use and the attributes of the CA.

The information held by the `Authority` varies depending on the `Kind` of CA and is defined by the `Connector`.
`Authority Provider` uses `Attributes` to get the data needed to establish the connection to the CA.

`Authority` has the following parameters:

| Parameter            | Description                                                                          |
|----------------------|--------------------------------------------------------------------------------------|
| Name                 | Name of the `Authority`                                                              |
| `Authority Provider` | Identification of `Connector` implementing the `Authority Provider` `Function Group` |
| `Kind`               | `Kind` of the CA technology implemented by the `Connector`                           |
| `Attributes`         | `Attributes` defined by `Connector`implementation and the specific `Kind`            |

### `Authority Provider`

- One `Connector` can serve for more than one `Authority`.
- Inputs for the `Connector` to determine the CA are captured and stored in the `Authority`.

For more information, refer to [Authority Provider](../../connectors/provider-interfaces/authority-provider-v2.md) description.

### `RA Profile`

`RA Profile` is created on top of the `Authority`. For more information, refer to [RA Profile](./ra-profile.md).
