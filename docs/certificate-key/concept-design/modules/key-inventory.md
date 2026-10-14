---
sidebar_position: 12
---

# Key Inventory

`Key Inventory` consists of all available `Keys` that can be managed by the platform.
It provides the functionality further described below.

## Inventory operations

The platform offers the following list of operations from the Key Inventory:

| Operation              | Description                                    |
|------------------------|------------------------------------------------|
| Create new `Key`       | Create new `Key` from selected `Token Profile` |
| Change status of `Key` | Enable / disable `Key`                         |
| Update `Key` usage     | Update key usage of the `Key`                  |
| Rename `Key` item      | Change the name of an individual key item      |
| Compromise `Key`       | Mark `Key` as compromised                      |
| Destroy `Key`          | Destroy the `Key`                              |
| Delete `Key`           | Removes the `Key` from inventory               |
| Sign with `Key`        | Sign data with the `Key`                       |
| Verify with `Key`      | Verify data with the `Key`                     |

## Key details

See [`Key`](../core-components/key.md) for more information.

## Discovered keys

A `Key` usually comes from a `Token Profile`, where it is created or imported. A [discovery](discovery.md) that targets keys adds a second source: it brings into the inventory the keys a `Discovery Provider` finds.

- **No token, public part only.** A discovered key belongs to no token and no `Token Profile`, and the platform holds only its public part. Only a key whose public part is in SubjectPublicKeyInfo form is added to the inventory. A private, secret or split key, or a public part in another form, is listed in the discovery's results as not imported, with the reason.
- **One record per key.** A key is identified by the fingerprint of its public key, computed the same way as for the public key of a certificate. A key discovered directly and the same key inside a certificate are one record, whichever arrives first, and a key the inventory already holds is not duplicated.
- **Naming.** A key that a discovery adds is named `discovered_<reference>_<fingerprint>`, where `<reference>` is the provider's reference for the key and `<fingerprint>` is the first 8 characters of the key's fingerprint. A key found again later, or one the inventory already held, keeps its name.
- **Where it was found.** Where the provider found the key is kept on it as metadata, with the discovery as its source, from every discovery that finds it.

A discovered key starts `Active` and enabled, with no key usages. Without a token, only the platform's record of the key can change: you can edit it, enable or disable it, update its key usages, mark it compromised and then destroy it, or delete it. Signing, verification, encryption, decryption and export are not available, because no token holds the key.
