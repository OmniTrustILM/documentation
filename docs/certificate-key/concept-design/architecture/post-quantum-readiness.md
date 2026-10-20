---
sidebar_position: 11
---

# Post-Quantum Readiness

Every asset in the [Cryptographic Asset Inventory](../modules/cryptographic-asset-inventory.md) carries a post-quantum readiness verdict: whether the cryptography it stands for withstands a cryptographically relevant quantum computer. The verdict is decided by a fixed set of rules that ships with the platform and cannot be configured, and each verdict records the rule that decided it and the reason.

## Verdicts

| Verdict          | Description                                                                                                                                               | Examples                                                                                               |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `PQC ready`      | The asset withstands a cryptographically relevant quantum computer                                                                                        | `AES-256`, `SHA-384`, `ML-KEM-768`, `ML-DSA-65`, `X25519-ML-KEM-768`                                   |
| `Not PQC ready`  | The asset needs replacing: a quantum computer breaks it, it is broken already, its size is too small, or its post-quantum scheme has no finished standard | `RSA-4096`, `ECDSA-P-256`, `AES-128`, `MD5`, `Kyber768`                                                |
| `Not applicable` | Post-quantum migration does not apply to the asset                                                                                                        | A salt, a password or a token; a name that is not an algorithm, such as `OpenSSL`; a cipher-suite name |
| `Unknown`        | The rules cannot decide from what the `CBOMs` record                                                                                                      | `AES` without a size, `HMAC` without its hash, a certificate that records no signature algorithm       |

## How a verdict is decided

The rules read what the `CBOMs` record for the asset: its type and name, its algorithm family, primitive, parameter set, elliptic curve and variant, and for key material its type and size. Every rule for the asset's type is evaluated, and of the rules that apply, one decides:

1. A rule that puts the asset outside the question decides first: material that is not a key, or a name that is a cipher suite or not an algorithm at all. A salt named after DES is therefore `Not applicable`.
2. Otherwise the weakest finding decides, `Not PQC ready` before `Unknown` before `PQC ready`. `X25519-ML-KEM-768-MD5` is `Not PQC ready` because of MD5, although its ML-KEM part is ready.

The rules follow these principles:

- **Factoring and discrete logarithms.** RSA, DSA, ECDSA, EdDSA, ECDH and the other schemes a quantum computer breaks are `Not PQC ready` at any size: `RSA-4096` is as `Not PQC ready` as `RSA-2048`.
- **Classically broken algorithms.** DES, 3DES, RC4, MD5 and SHA-1 are `Not PQC ready`, also as a component of another name, such as `HMAC-MD5` or `HMAC-SHA1`.
- **Symmetric and hash-based algorithms.** A quantum computer weakens AES, ChaCha20, SHA-2 or SHA-3 but does not break them. They are `PQC ready` when their recorded key or digest size reaches 256 bits, the AES key size CNSA 2.0 requires: `AES-256`, `SHA-256` and `SHA-384` are ready, while `AES-128`, `AES-192` and `SHA-224` are `Not PQC ready`. Without a size, a family that also defines smaller sizes is `Unknown`, as `AES` is, and so is a size the family does not define, such as `AES-64`.
- **Constructions.** HMAC, CMAC, HKDF, PBKDF2 and similar constructions are as strong as the primitive they are built on: `HMAC-SHA256` is ready, a bare `HMAC` is `Unknown`.
- **Keys.** A secret key, symmetric key or shared secret is held to 256 bits as well, and is `Unknown` without a usable size, unless its name decides it: a DES key is `Not PQC ready` whatever its size. Other keys take the verdict of the family their name carries, so an `RSA-2048` private key is `Not PQC ready`.
- **Post-quantum schemes.** The standardized schemes ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205), LMS and XMSS (SP 800-208) are `PQC ready`, and a parameter set they do not define, such as `ML-KEM-1000`, is `Unknown`. Drafts and candidates without a finished standard, such as Kyber, Dilithium or Falcon, are `Not PQC ready`, and so are schemes broken by cryptanalysis, such as SIKE.
- **Hybrids.** A hybrid takes the verdict of its post-quantum part: `X25519-ML-KEM-768` is ready, `X25519-Kyber768` is not. A name that offers schemes as alternatives, such as `RSA-2048 or ML-DSA-65`, is not a hybrid and is `Not PQC ready`, because the RSA part may be used alone.
- **Certificates.** A certificate is as ready as the weaker of the key it certifies and the algorithm it is signed with. A certificate that records no signature algorithm is `Unknown`, even with a ready key.
- **Protocols.** A protocol is as ready as the weakest algorithm its cipher suites name, and it is `PQC ready` only when one of them establishes a key, as a key agreement or a KEM does. A TLS 1.3 cipher suite names only its cipher and hash, so a TLS 1.3 protocol whose suites name nothing else is `Unknown`.

A certificate or a protocol takes its verdict from the assets it refers to in the inventory, and its verdict names the asset it was taken from. A referenced asset that is not in the inventory, never evaluated or `Not applicable` makes the verdict `Unknown`, unless another reference is `Not PQC ready`. The mode, the padding and a NIST quantum security level the `CBOM` declares are shown among the evaluated properties, but they never decide a verdict.

## When a verdict is Unknown

An `Unknown` verdict usually means that the `CBOMs` do not record what the rules need, such as the size of a key or a symmetric algorithm, the primitive of a construction, the signature algorithm of a certificate or the key exchange of a protocol. The reason of the verdict says what is missing, so that the producer of the `CBOM` can record it.

An asset that has never been evaluated is listed as `Unknown` too, and so is an asset the rules could not be evaluated for at all, with the rule `EVALUATION-FAILED`. The asset detail tells these cases apart.

## Re-evaluation

Synchronization evaluates the assets that a `CBOM` adds to the inventory or changes. The scheduled job `CryptoAssetPqcSweepTask`, a system job of the [Scheduler](scheduler.md#supported-task-types), runs every hour at half past and re-evaluates the verdicts that are out of date. A verdict is out of date when it was never taken, or when something it was decided from has changed since: the recorded properties of the asset, the verdict of an asset it refers to, or the rules, after an upgrade that changes them. A verdict can therefore change without a new `CBOM` of its own, for example when the key a certificate certifies changes its verdict. Each run re-evaluates a limited number of assets, so a large backlog, such as the one after an upgrade that changes the rules, is worked off over several runs.

While the job is disabled, synchronization still evaluates the assets it adds or changes, but no other verdict is brought up to date. If verdicts stay out of date, check in the [Scheduler](scheduler.md#task-execution-history) that the job is enabled and why it last skipped a run. A single asset cannot be re-evaluated on demand.

## Reading the explanation

The explanation of a verdict, on the asset detail or through the [API](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/{uuid}/pqcExplanation), evaluates the asset again from what is stored and changes nothing. It says whether the result matches the stored verdict, or whether the stored verdict is out of date or missing, in which case the next re-evaluation stores the result. It lists every rule for the asset's type with its outcome:

| Outcome       | Description                                                                                         |
|---------------|-----------------------------------------------------------------------------------------------------|
| `Decided`     | The rule's condition held and its verdict is the asset's                                            |
| `Resolved`    | The rule's condition held and the verdict is taken from another inventory asset the asset refers to |
| `Matched`     | The rule's condition held, but a rule ranked ahead of it decided                                    |
| `Not matched` | The rule's condition did not hold for the asset                                                     |
| `Failed`      | The rules could not be evaluated for the asset, so no rule decided; this is then the only step      |

Each step shows the properties its rule read. A property taken from a `CBOM` the viewer may not read is not shown, although the rules still read it.
