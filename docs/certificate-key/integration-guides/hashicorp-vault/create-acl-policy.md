---
sidebar_position: 5
---

# Create ACL Policy

Vault policies are used to define a set of permissions for a path in the secrets engine. Policies are written in HashiCorp Configuration Language (HCL) and define a set of capabilities that are allowed on a given path.

For more information about the Vault policies, refer to the [Vault policies documentation](https://www.vaultproject.io/docs/concepts/policies).

## PKI secrets engine ACL policy

This following policy assumes the PKI secrets engine is enabled at the `/pki` path in Vault. Since it is possible to enable secrets engines at any location, the policy should be adjusted accordingly:

```hcl title="czertainly-policy.hcl"
# Allow to list pki issuers
path "pki/issuers" {
  	capabilities = ["list"]
}

# Allow to list available pki roles
path "pki/roles" {
  	capabilities = ["list"]
}

# Allow to read configuration of pki roles
path "pki/roles/*" {
  	capabilities = ["read"]
}

# Allow to list certificates issued
path "pki/certs" {
  	capabilities = ["list"]
}

# Allow signing of certificates for all roles
path "pki/sign/*" {
  	capabilities = ["create", "update"]
}

# Allow to revoke certificate
path "pki/revoke" {
  	capabilities = ["update"]
}
```

This policy assumes access to all roles that are configured in the PKI secrets engine. If you want to restrict access to specific roles, adjust the policy accordingly.

## Create `czertainly` policy

Create a new policy named `czertainly` with the permissions defined in the [`czertainly-policy.hcl`](#pki-secrets-engine-acl-policy):

```shell
$ vault policy write czertainly czertainly-policy.hcl
Success! Uploaded policy: admin
```

For more information on how to create and manage policies, refer to the [Vault policies](https://developer.hashicorp.com/vault/tutorials/policies/policies).

## KV version 1 secrets engine ACL policy

The following policy assumes the KV version 1 secrets engine is enabled at the `kv` path. Adjust the path prefix to match your mount path:

```hcl title="czertainly-kv1-policy.hcl"
# Allow full CRUD operations and listing on all secrets
path "kv/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
}
```

This policy grants access to all secrets stored under the `kv` mount. To restrict access to a specific sub-path, replace the wildcard with the desired path prefix (e.g., `kv/czertainly/*`).

### Create `czertainly-kv1` policy

Create a new policy named `czertainly-kv1` with the permissions defined in [`czertainly-kv1-policy.hcl`](#kv-version-1-secrets-engine-acl-policy):

```shell
$ vault policy write czertainly-kv1 czertainly-kv1-policy.hcl
Success! Uploaded policy: czertainly-kv1
```

## KV version 2 secrets engine ACL policy

KV version 2 uses separate sub-paths for secret data and metadata, so the policy must grant permissions on both. The following policy assumes the KV version 2 secrets engine is enabled at the `kv` path:

```hcl title="czertainly-kv2-policy.hcl"
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

This policy grants access to all secrets stored under the `kv` mount. To restrict access to a specific sub-path, replace the wildcards with the desired path prefix (e.g., `kv/data/czertainly/*`).

:::info[KV v2 path structure]
When working with KV version 2, secret data is always accessed via the `data/` sub-path and metadata via `metadata/`. This applies to both CLI and API operations. See [Enable KV Secrets Engine](./enable-kv-secrets-engine.md) for more information.
:::

### Create `czertainly-kv2` policy

Create a new policy named `czertainly-kv2` with the permissions defined in [`czertainly-kv2-policy.hcl`](#kv-version-2-secrets-engine-acl-policy):

```shell
$ vault policy write czertainly-kv2 czertainly-kv2-policy.hcl
Success! Uploaded policy: czertainly-kv2
```
