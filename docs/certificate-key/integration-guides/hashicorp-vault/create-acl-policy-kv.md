---
sidebar_position: 6
---

# Create KV ACL Policy

Vault policies define a set of permissions for paths in the secrets engine. Policies are written in HashiCorp Configuration Language (HCL) and specify capabilities allowed on a given path.

For more information about Vault policies, refer to the [Vault policies documentation](https://www.vaultproject.io/docs/concepts/policies) and the [Vault policies tutorial](https://developer.hashicorp.com/vault/tutorials/policies/policies).

## KV version 1

The following policy assumes the KV version 1 secrets engine is enabled at the `kv` path. Adjust the path prefix to match your mount path:

```hcl title="ilm-kv1-policy.hcl"
# Allow full CRUD operations and listing on all secrets
path "kv/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
}
```

This policy grants access to all secrets stored under the `kv` mount. To restrict access to a specific sub-path, replace the wildcard with the desired path prefix (e.g., `kv/ilm/*`).

### Create `ilm-kv1` policy

Create a new policy named `ilm-kv1` with the permissions defined in [`ilm-kv1-policy.hcl`](#kv-version-1):

```shell
$ vault policy write ilm-kv1 ilm-kv1-policy.hcl
Success! Uploaded policy: ilm-kv1
```

## KV version 2

KV version 2 uses separate sub-paths for secret data and metadata, so the policy must grant permissions on both. The following policy assumes the KV version 2 secrets engine is enabled at the `kv` path:

```hcl title="ilm-kv2-policy.hcl"
# Allow CRUD operations on secret data
path "kv/data/*" {
    capabilities = ["create", "read", "update", "delete"]
}

# Allow listing and reading secret metadata
path "kv/metadata/*" {
    capabilities = ["read", "list", "delete"]
}

# Allow destroying specific secret versions
path "kv/destroy/*" {
    capabilities = ["update"]
}

# Allow undeleting specific secret versions
path "kv/undelete/*" {
    capabilities = ["update"]
}
```

This policy grants access to all secrets stored under the `kv` mount. To restrict access to a specific sub-path, replace the wildcards with the desired path prefix (e.g., `kv/data/ilm/*`).

:::info[KV v2 path structure]
When working with KV version 2, secret data is always accessed via the `data/` sub-path and metadata via `metadata/`. This applies to both CLI and API operations. See [Enable KV Secrets Engine](./enable-kv-secrets-engine.md) for more information.
:::

### Create `ilm-kv2` policy

Create a new policy named `ilm-kv2` with the permissions defined in [`ilm-kv2-policy.hcl`](#kv-version-2):

```shell
$ vault policy write ilm-kv2 ilm-kv2-policy.hcl
Success! Uploaded policy: ilm-kv2
```
