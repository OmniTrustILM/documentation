---
sidebar_position: 8
---

# Compliance Profile

## What is `Compliance Profile`?

`Compliance Profile` is a representation of `Rules` and `Groups` that collectively provides a way to check if some object follows the organizational standards.
They describe if an object is compliant with the organizational standards.

Supported resources

### Characteristics

Characteristics of `Compliance Profile` are:

- Contains the list of `Rules` and `Groups` that are used to check the compliance of the resource objects
- A `Group` consists of multiple rules that can be also used individually
- Contains internal rules and `Rules` and `Groups` from multiple `Compliance Providers`
- Stores the attributes for the provider rules, if some attributes are required to evaluate the rule
- `Compliance Profiles` can be associated with profiles like `RA Profile` and `Token profile` to determine the compliance of the resource objects managed by these profiles
- Compliance check can be initiated manually or automatically when object is added to inventory

### Related objects

Objects that are associated with the `Compliance Profile` are:

| Object  | Purpose                                                                                                                                                                                                                                                        |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Rule`  | The `rule` that is used to check the compliance of the object. `Rules` contain specific logic that will apply to the resource object. If the rule is satisfied, then the object is marked as `Compliant`. Otherwise, the object is marked as `Non Compliant`.  |
| `Group` | The `group` of `rules` that are used to check the compliance of the resource object. The groups are the logical grouping of the `rules` provided by the `Compliance Provider`. A `rule` may or may not be a part of the `Group`.                               |

### Compliance rules

Each rule needs to specify resource for which is applicable (e.g. `Certificate`) and optionally type of resource object (e.g. Certificate type `X.509`).
Since compliance profile can combine rules for different resources, based on rule resource, only applicable rules are evaluated during compliance check of the object based on context.

Available rules that can be assigned to compliance profile could come from 2 sources:
- `Internal Rules` that are defined and managed by the platform
- `Provider Rules` that are defined by specific `Compliance Provider`

Internal rules can be managed by user with appropriate permissions, while provider rules are managed by the respective `Compliance Provider`.
In case of internal rules, when resource is selected, rules itself is defined as list of condition items based on resource object properties and attributes.
With help of internal rules, user can define compliance checks even on custom attributes that are managed by user.

### Compliance supporting resources

Currently, compliance check can be run for the following resource objects:

| Resource object          | Type enum                                                                                                                                                                                           | Associated profile | Note                                                                  |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------------------------------------------|
| `Certificate`            | [`CertificateType`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/6efc5d66cb27a55a6e9c64ce6d82673be8025703/src/main/java/com/czertainly/api/model/core/certificate/CertificateType.java) | `RA Profile`       | In case certificate is not issued, compliance will run on its request | 
| `Certificate Request`    | [`CertificateType`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/6efc5d66cb27a55a6e9c64ce6d82673be8025703/src/main/java/com/czertainly/api/model/core/certificate/CertificateType.java) | `RA Profile`       |                                                                       |
| `Cryptographic Key`      | [`KeyType`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/6efc5d66cb27a55a6e9c64ce6d82673be8025703/src/main/java/com/czertainly/api/model/common/enums/cryptography/KeyType.java)        | `Token Profile`    | Compliance check will run on all its items                            |
| `Cryptographic Key item` | [`KeyType`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/6efc5d66cb27a55a6e9c64ce6d82673be8025703/src/main/java/com/czertainly/api/model/common/enums/cryptography/KeyType.java)        | `Token Profile`    | Compliance check on specific key item                                 |
| `RA Profile`             | N/A                                                                                                                                                                                                 | N/A                | Compliance check run on all managed certificates                      |
| `Token Profile`          | N/A                                                                                                                                                                                                 | N/A                | Compliance check run on all managed cryptographic keys                |