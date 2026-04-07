---
sidebar_position: 20
---

# Vault Profile

`Vault Profile` can be used to manage secrets in a `Vault` in a more granular way. It is created on top of a `Vault` and defines the configuration for managing secrets in that vault. 
 `Vault Profile` can be either a source profile for a `Secret` or a sync profile for a `Secret`, see [Secret](secret.md).
When `Vault Profile` is a source profile, access to a secret is based on access to the `Vault Profile`. When a source `Vault Profile` is disabled, operations on secrets in that vault are not allowed.
For management of Vault Profiles, see [Vault Profile Management API](/api/core-vault-profile/).

