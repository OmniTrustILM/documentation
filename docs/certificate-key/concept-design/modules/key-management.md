---
sidebar_position: 10
---

# Key Management

Platform offers cryptographic key management and cryptographic operations.

:::info
Every cryptographic key management and operation in the platform are achieved through the `Token Profile`. To perform any action on `Key`, the `Key` must be bound to `Token Profile`. See [`Token Profile`](../core-components/token-profile.md) for more information.
:::

Operations on `Key` includes:

- **Create / Destroy**
- **Encrypt / Decrypt**
- **Sign / Verify**
- **Generate random data**

## Support for PQC algorithms

The platform implements support for post-quantum cryptography algorithms. The following PQC algorithms are supported:
- **ML-DSA** - based on CRYSTALS-Dilithium, lattice-based and the primary signature algorithm standardised by NIST - [FIPS 204](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf)
- **SLH-DSA** - based on SPHINCS+, a stateless hash-based signature algorithm standardised by NIST - [FIPS 205](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf)
- **ML-KEM** - based CRYSTALS-Kyber, a lattice-based and the primary key encapsulation mechanism standardised by NIST - [FIPS 203](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf)
- **FALCON (FN-DSA)** - a lattice-based signature scheme, selected by NIST for standardisation
