---
sidebar_position: 4
---

# Enable KV Secrets Engine

To enable and configure the KV secrets engine, follow the official HashiCorp Vault documentation for [KV secrets engine](https://developer.hashicorp.com/vault/docs/secrets/kv).

The KV (Key-Value) secrets engine is used to store arbitrary secrets within the Vault. It is used by the HashiCorp Vault Connector when integrating with the Secrets Provider to store and manage secrets.

Each KV secrets engine is mounted at a specific path in the Vault. The path is used as the endpoint for all API requests. The KV secrets engine can be mounted multiple times at different paths, each with its own configuration.

## KV versions

The KV secrets engine is available in two versions:
- **KV version 1** — simple key-value store without versioning
- **KV version 2** — key-value store with versioning support, allowing retrieval and restoration of previous secret versions

:::info[Choosing a KV version]
KV version 2 is recommended for production environments as it supports secret versioning, which allows you to track and recover previous secret values. KV version 1 is simpler and has lower overhead, which may be suitable for environments that do not require versioning.
:::

## Path structure

The path structure differs between KV version 1 and version 2:

| Version | Read / Write path  | List / Metadata path    |
|---------|--------------------|-------------------------|
| v1      | `kv/<path>`        | `kv/<path>`             |
| v2      | `kv/data/<path>`   | `kv/metadata/<path>`    |

This distinction is important when writing ACL policies, as KV v2 requires permissions on both the `data` and `metadata` sub-paths. See [Create ACL Policy](./create-acl-policy-kv.md) for policy examples for each version.

For more information about the KV path structure, refer to the [KV v1](https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v1) and [KV v2](https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v2) documentation.
