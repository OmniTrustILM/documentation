---
sidebar_position: 15
---

# Secret Inventory

`Secret Inventory` consists of all available `Secrets` that can be managed by the platform.
It provides the functionality further described below.

## Inventory operations

The platform offers the following list of operations from the Secret Inventory:

| Operation                | Description                                                                       |
|--------------------------|-----------------------------------------------------------------------------------|
| Create new `Secret`      | Create a new `Secret` from selected `Vault Profile`.                              |
| Change status of `Secret`| Enable / disable `Secret`.                                                        |
| Update `Secret`          | Update the content of the `Secret`.                                               |
| Get `Secret` content     | Retrieve the secret content from the source `Vault`.                              |
| Synchronize `Secret`     | Synchronize the `Secret` content from source `Vault` to sync `Vault Profiles`.    |
| Delete `Secret`          | Removes the `Secret` from inventory and all associated `Vaults`.                  |

## Secret details

See [`Secret`](../core-components/secret.md) for more information.
