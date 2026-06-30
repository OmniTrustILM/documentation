---
sidebar_position: 1
---

# Introduction

Certificate Storage Providers are managing storage of the certificate information associated with the assigned private key of the user. The certificates are identified based on the specific implementation, basic values for identification are generally `userId` and `keyId`.

`CERT_STORAGE_IMPLEMENTATION_CLASS` property must be configured with proper implementation of the Certificate Storage Provider.

The following implementations are available:

- [File System Certificate Storage Provider](./filesystem.mdx)
- [Key Data Certificate Storage Provider](./keydata.md)
