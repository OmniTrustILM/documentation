---
sidebar_position: 10
---

# Location

`Location` is a specific storage for certificates and cryptographic keys that can be accessed through the [`Entity`](entity.md).

As an example, `Location` can be:
- Software Key Store
- SSL Profile
- File System PEM
- Active Directory account

`Location` cannot exists without [`Entity`](entity.md) and each `Entity` can have multiple `Locations` (if supported by the implementation of `Entity Provider`).

## Characteristics

`Location` capabilities are defined by:

| Item                     | Description                                                                                                                                   |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `Entity`                 | `Location` can be accessed only through `Entity` that holds it                                                                                |
| Multiple entries support | If the `Location` can store only one or multiple entries, typically certificates                                                              |
| Key management support   | If the `Location` is capable to store and manage cryptographic keys                                                                           |
| Status                   | Status of the `Location`, which can be <span class="badge badge--success">enabled</span> or <span class="badge badge--danger">disabled</span> |

`Location` support the following operations:
- Sync content with the inventory
- Push `Certificate` from inventory
- Remove `Certificate`

When the `Location` supports key management, additional operations can be performed:
- Issue new `Certificate`
- Renew `Certificate`
