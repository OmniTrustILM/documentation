---
sidebar_position: 1
---

# Certificate Management

Platform offers the certificate management operations.

:::info
All the certificate management operations in the platform are achieved through the `RA Profile`. To perform any action on a `Certificate`, the `Certificate` must be bound to an `RA Profile`. See [`RA Profile`](../core-components/ra-profile.md) for more information.
:::

Operations on `Certificate` includes:

- [Issuing](#issueCert)
- [Revocation](#revokeCert)
- [Renewal](#renewCert)
- [Rekey](#rekeyCert)

### Issuing \{#issueCert}

Any new `Certificate` can be issued through the `RA Profile`. Since `RA Profile` binds the `Certificate` with `Authority`, it has the information on which `Connector` to use. In addition to that, `RA Profile` also holds the `Attributes` required by the CA technology to issue `Certificate`.

With defined `RA Profile`, the `Client` will need only the following data to request `Certificate`:

- `RA Profile` Name
- based on key source
  - *external* - CSR (Certificate Signing Request)
  - *existing key pair* - token profile, its key and signature attributes
  - *existing alternative key pair* - optionally, to be used as alternative key pair, along with token profile and signature attributes
  - `Request Attributes` - attributes for the request, if request is created from existing key(s)

- `Connector Attributes` for issuing, if needed by the `Connector` implementation

In case of RA profile has associated `Compliance Profile`, compliance check will be first run on certificate request. If certificate request compliance check fails, certificate is `Rejected`, otherwise certificate issuance will proceed.

Upon successful issuing of the `Certificate`, it will be parsed, validated, and stored in the `Certificate Inventory`.

### Revocation \{#revokeCert}

The `Certificate` can be revoked through its binding with `RA Profile`. The following information is needed to revoke the `Certificate`:

- Revocation reason

Once the reason for the revocation is specified, the platform communicates with the CA through `RA Profile` and revokes the `Certificate`. Information is update in the `Certificate Inventory`.

### Renewal \{#renewCert}

To renew `Certificate`, information currently available in the `Certificate Inventory` is used. Therefore, the `Client` need to provide only new certification signing request or otherwise information about key pair (and alternative key pair for hybrid certificates) belonging to certificate will be used.

:::note
Only the `Certificate` that is bound to `RA Profile` can be renewed.
:::

### Rekey \{#rekeyCert}

This operation is used in case it is necessary to change key that was used for issuance of original certificate because of various reasons.

Data that need to be provided are same as for issuing certificate with a condition that different key pair needs to be used. If certificate was already hybrid, different alternative key pair must be used as well. If certificate was not hybrid, and request contains alternative key pair, the alternative public key will be added to the certificate (if CA that issued the certificate supports alternative extensions).
