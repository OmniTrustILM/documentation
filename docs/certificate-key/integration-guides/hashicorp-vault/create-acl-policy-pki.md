---
sidebar_position: 5
---

# Create PKI ACL Policy

Vault policies define a set of permissions for paths in the secrets engine. Policies are written in HashiCorp Configuration Language (HCL) and specify capabilities allowed on a given path.

For more information about Vault policies, refer to the [Vault policies documentation](https://www.vaultproject.io/docs/concepts/policies) and the [Vault policies tutorial](https://developer.hashicorp.com/vault/tutorials/policies/policies).

## PKI secrets engine ACL policy

The following policy assumes the PKI secrets engine is enabled at the `pki` path. Adjust the path prefix to match your mount path:

```hcl title="ilm-pki-policy.hcl"
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

This policy assumes access to all roles configured in the PKI secrets engine. If you want to restrict access to specific roles, adjust the policy accordingly.

## Create `ilm-pki` policy

Create a new policy named `ilm-pki` with the permissions defined in [`ilm-pki-policy.hcl`](#pki-secrets-engine-acl-policy):

```shell
$ vault policy write ilm-pki ilm-pki-policy.hcl
Success! Uploaded policy: ilm-pki
```
