---
sidebar_position: 3
---

# CMTS Security World

**CMTS Security World** is a Security World supporting Common Criteria PP 419 221-5.
It was introduced and is available from Security World `v12.50` in the mode called `common-criteria-cmts`.

Using the CMTS mode enforces the following constraints and facilities:

**Constraints**:
- The minimum quorum (the `k` value) for the ACS is 2
- You cannot import or export private or symmetric keys in plain text
- Remote Operator feature is disabled
- Passphrase recovery is disabled
- SEE debugging is disabled
- Foreign Token Open delegation is disabled
- Internal signed audit logging is enabled by default and cannot be disabled
- It is not possible to migrate keys from or to a Common Criteria CMTS World 
  
**Facilities**:
- `generatekey` and `mkaclx` utilities support generating EN 419 221-5 assigned keys
- `nfkmverify` supports the verification of EN 419 221-5 assigned keys

:::warning
In order to meet the requirements of the 419 221-5 Protection Profile the nShield must be operated in accordance
with the nShield Solo XC Common Criteria Evaluated Configuration Guide.
:::

## Assigned Keys

Common Criteria CMTS mode includes the concepts of Assigned Keys and General Keys, as defined in EN 419 221-5.

Assigned Keys provide for more restrictive controls which are enforced with ACLs. An Assigned Key is a secret key with a Key Generation Certificate and with the ACL configuration, specifically:
- The **Reauthorization conditions** and **Key Usage** attributes cannot be changed
- The **Authorisation Data** attribute can only be changed by presentation of the current **Authorisation Data**, it cannot be changed or reset by an Administrator
- The key cannot be exported by wrapping with anotherkey
- The key must be generated. It cannot be imported

These properties of an Assigned Key enable the sole control that's required for a secret key used to create a digital signature.
A General Key is one that does not meet the criteria for an Assigned Key.

:::warning
For both Assigned and General Keys in a Common Criteria CMTS Security World it is not possible to export or import as plain text. This is enforced by the nShield.
:::
