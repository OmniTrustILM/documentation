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

A `Key` usually comes from a `Token Profile`, where it is created or imported. A [discovery](certificate-discovery.md#discovered-keys) that targets keys adds a second source: it brings into the inventory the keys a `Discovery Provider` finds, without any token.

- **No token, public part only.** A discovered key belongs to no token and no `Token Profile`. The platform holds at most its public part. The discovery contract carries no private, secret or split key material, and `Core` refuses an item that does.
- **What is onboarded.** Only a key with a public part in SubjectPublicKeyInfo form is added to the inventory. A private, secret or split key, or a public part in another encoding, stays listed on the discovery as **Not imported**, with the reason on its item.
- **One record per key.** The key's identity is the fingerprint of its SubjectPublicKeyInfo, computed the same way as for the public key of a certificate. A key discovered directly and the same key inside a certificate are therefore one record, whichever arrives first, and a key the inventory already holds through a token is not duplicated.
- **Naming.** A key that a discovery adds is named `discovered_<reference>_<fingerprint>`, where `<reference>` is the provider's reference for the item and `<fingerprint>` is the first 8 characters of the key's SHA-256 fingerprint. A key found again later lands on the existing record and is never renamed, and a key the inventory already held keeps its name.
- **Where it was found.** What the provider reports about where it found the key is kept on the key item as metadata, with the discovery as its source. Every discovery that finds the key adds its own, including on a record that already existed.

A discovered key has a single public key item. It starts `Active` and enabled, with no key usages, and it is never exportable. Without a token, only the platform's record of the key can change:

| Operation                                           | Discovered key                                                                                                            |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Edit, enable / disable, update key usage            | Allowed                                                                                                                   |
| Compromise `Key`                                    | Allowed                                                                                                                   |
| Destroy `Key`                                       | Allowed once the key is compromised. It marks the record destroyed; there is no token to destroy the key in              |
| Delete `Key`                                        | Allowed. It removes the record from the inventory                                                                         |
| Sign, verify, encrypt, decrypt                      | Not available: there is no token to perform the operation                                                                 |
| Export                                              | Not available: only private and secret key items are exported                                                             |

The public key itself is shown on the key item.
