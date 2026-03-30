---
sidebar_position: 4
---

# Enable KV Secrets Engine

The KV (Key-Value) secrets engine is used to store arbitrary secrets within the Vault. It is used by the HashiCorp Vault Connector when integrating with the CZERTAINLY Secrets Provider to store and manage secrets.

The KV secrets engine is available in two versions:
- **KV version 1** - Simple key-value store without versioning
- **KV version 2** - Key-value store with versioning support, allowing retrieval and restoration of previous secret versions

Each KV secrets engine is mounted at a specific path in the Vault. The path is used as the endpoint for all API requests. The KV secrets engine can be mounted multiple times at different paths, each with its own configuration.

For more information about the KV secrets engine, refer to the [HashiCorp Vault KV secrets engine documentation](https://developer.hashicorp.com/vault/docs/secrets/kv).

## Enable KV Version 1

To enable the KV version 1 secrets engine at the `kv` path, run:

```shell
$ vault secrets enable -path=kv kv
Success! Enabled the kv secrets engine at: kv/
```

## Enable KV Version 2

To enable the KV version 2 secrets engine at the `kv` path, run:

```shell
$ vault secrets enable -path=kv kv-v2
Success! Enabled the kv-v2 secrets engine at: kv/
```

Alternatively, you can upgrade an existing KV version 1 mount to version 2:

```shell
$ vault kv enable-versioning kv/
Success! Tuned the secrets engine at: kv/
```

:::info[Choosing a KV version]
KV version 2 is recommended for production environments as it supports secret versioning, which allows you to track and recover previous secret values. KV version 1 is simpler and has lower overhead, which may be suitable for environments that do not require versioning.
:::

## KV Secret Paths

The path structure differs between KV version 1 and version 2:

| Version | Read / Write path  | List / Metadata path    |
|---------|--------------------|-------------------------|
| v1      | `kv/<path>`        | `kv/<path>`             |
| v2      | `kv/data/<path>`   | `kv/metadata/<path>`    |

This distinction is important when writing ACL policies, as KV v2 requires permissions on both the `data` and `metadata` sub-paths. See [Create ACL Policy](./create-acl-policy.md) for policy examples for each version.
