---
sidebar_position: 10
---

# Key Management

Platform offers cryptographic key management and cryptographic operations.

:::info
Creating, importing and exporting a `Key`, and every cryptographic operation with it, run through its `Token Profile`. See [`Token Profile`](../core-components/token-profile.md) for more information. A `Key` found by a discovery has no `Token Profile`; see [Discovered keys](key-inventory.md#discovered-keys) for what can be done with it.
:::

Operations on `Key` includes:

- **Create / Destroy**
- **Import / Export**
- **Encrypt / Decrypt**
- **Sign / Verify**
- **Generate random data**

Key material is imported and exported without the platform keeping it; see [Import and export](../core-components/key.md#import-and-export).

## Support for PQC algorithms

The platform implements support for post-quantum cryptography algorithms. The following PQC algorithms are supported:
- **ML-DSA** - based on CRYSTALS-Dilithium, lattice-based and the primary signature algorithm standardised by NIST - [FIPS 204](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf)
- **SLH-DSA** - based on SPHINCS+, a stateless hash-based signature algorithm standardised by NIST - [FIPS 205](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf)
- **ML-KEM** - based CRYSTALS-Kyber, a lattice-based and the primary key encapsulation mechanism standardised by NIST - [FIPS 203](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf)
- **FALCON (FN-DSA)** - a lattice-based signature scheme, selected by NIST for standardization. [Post-quantum readiness](../architecture/post-quantum-readiness.md) rates it `Not PQC ready`, as a scheme without a finished standard

## Cryptography providers

Creating, importing, exporting and destroying a key held in a token, and every cryptographic operation with it, run through the `Cryptography Provider` of that token. That provider decides what the platform offers. A [Cryptography Provider v1](../../connectors/provider-interfaces/cryptography-provider.md) connector creates and destroys keys and runs cryptographic operations with them. A [Cryptography Provider v2](../../connectors/provider-interfaces/cryptography-provider-v2.md) connector also imports and exports keys when it declares those capabilities.
