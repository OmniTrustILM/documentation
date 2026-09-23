---
sidebar_position: 17
---

# Post-Quantum Readiness

Every asset of the [cryptographic asset inventory](cryptographic-asset-inventory.md) carries a post-quantum readiness verdict: whether the cryptography it stands for withstands a cryptographically relevant quantum computer. The verdict is decided by a rule set the platform ships. The rule set is not configurable, so the verdicts of two deployments on the same release are comparable, and every evaluated verdict records the rule set version and the rule that produced it.

This page describes rule set version **5**.

## Verdicts

| Verdict          | Label            | Meaning                                                                                                                   |
|------------------|------------------|---------------------------------------------------------------------------------------------------------------------------|
| `ready`          | `PQC ready`      | The asset withstands a cryptographically relevant quantum computer.                                                       |
| `notReady`       | `Not PQC ready`  | The asset is not a migration target: its cryptography is broken by a quantum computer or already broken classically, it is a post-quantum scheme not yet standardized or one broken by cryptanalysis, or it is a symmetric key of 64 to 127 bits. |
| `notApplicable`  | `Not applicable` | Post-quantum migration does not apply to the asset, for example because it is not an algorithm.                          |
| `unknown`        | `Unknown`        | The rule set cannot classify the asset from the recorded properties, or the asset has not been evaluated yet.             |

The verdict is decided from what the platform recorded for the asset — its type, name, algorithm family, variant and curve and, for key material, the material type and size its elected payload declares. Evaluation is first match wins: the first rule that applies decides the verdict.

## The NIST IR 8547 framing

The rule set follows the framing of [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd), *Transition to Post-Quantum Cryptography Standards*, which separates the cryptography a quantum computer breaks from the cryptography it only weakens:

- **Quantum-vulnerable** — schemes whose security rests on factoring or a discrete logarithm, such as RSA, DSA, ECDSA, EdDSA, ECDH and finite-field Diffie-Hellman. Shor's algorithm breaks them outright, so they are `notReady` at any key size.
- **Symmetric and hash-based** — block and stream ciphers, hash functions, MACs, key derivation and random bit generators. Grover's algorithm halves their strength but breaks none of them, so they are `ready`.
- **Standardized post-quantum** — ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205), and LMS and XMSS (SP 800-208). They are `ready`.

The rule set decides readiness, not the transition timeline. It does not encode the dates NIST IR 8547 proposes for deprecating and disallowing quantum-vulnerable algorithms, and it does not grade strength: RSA-4096 is as `notReady` as RSA-2048, and AES-128 is as `ready` as AES-256. The one size it checks is that of symmetric key material, which has to be at least 128 bits.

The rule set departs from a strict reading of the framing in one place, described next.

## Classically broken families

A literal reading of the framing would call DES post-quantum ready — which is true, and useless. The rule set therefore treats families that are already broken or deprecated on classical grounds as a class of their own. They are `notReady`, like quantum-vulnerable families, but under a different rule — `CLASSICAL-LEGACY` rather than `CLASSICAL-SHOR` — because the migration they need is a different one: they are not a migration target regardless of any quantum threat.

An algorithm that names a weak component inherits it, whatever its own family. HMAC-MD5, PBKDF2-HMAC-SHA1 or 3DES-CMAC are `notReady` under `CLASSICAL-LEGACY-COMPONENT`, while AES-CMAC stays `ready`. An algorithm that names a quantum-vulnerable component — RSA-OAEP wrapping an AES key, as in `CKM_RSA_AES_KEY_WRAP`, or `ECIES-X25519-XSalsa20-Poly1305` — is `notReady` under `CLASSICAL-SHOR-COMPONENT`. When an algorithm names both kinds, the classically broken one decides, so SHA1withRSA reads `CLASSICAL-LEGACY-COMPONENT` rather than `CLASSICAL-SHOR`. A [hybrid](#hybrid-schemes) is decided by its post-quantum component instead, and [key material](#key-material) by its family or size.

## Algorithm families

Every algorithm family the platform recognizes has one disposition:

| Class                         | Verdict   | Rule id            | Families                                                                                                                                                                                                                                                                                         |
|-------------------------------|-----------|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Quantum-vulnerable            | `notReady`| `CLASSICAL-SHOR`   | RSA, RSA-X931, RSAES-OAEP, RSAES-PKCS1, RSASSA-PKCS1, RSASSA-PSS, DSA, EC, ECDH, ECDSA, ECIES, EdDSA, ElGamal, FFDH, MQV, SM2, SM9, BLS, J-PAKE, SPAKE2, SPAKE2PLUS, SRP, OPAQUE, X3DH, HPKE                                                                                                |
| Classically broken            | `notReady`| `CLASSICAL-LEGACY` | DES, 3DES, RC2, RC4, RC5, Blowfish, CAST5, Skipjack, A5/1, A5/2, CMEA, 3GPP-XOR, MD2, MD4, MD5, SHA-1, PBKDF1, PBES1, IDEA, Yarrow                                                                                                                                                              |
| Symmetric and hash-based      | `ready`   | `SYMMETRIC-READY`  | AES, ARIA, CAMELLIA, SEED, SM4, Serpent, Twofish, CAST6, RC6, Ascon, ChaCha, ChaCha20, Salsa20, RABBIT, HC, SNOW3G, ZUC, MILENAGE, TUAK, Fernet, SHA-2, SHA-3, BLAKE2, BLAKE3, SM3, Whirlpool, SipHash, Poly1305, HMAC, CMAC, UMAC, HKDF, ANSI-KDF, SP800-108, SP800-56C, SSH-KDF, TLS-PRF, IKE-PRF, PBKDF2, PBES2, PBMAC1, Argon2, bcrypt, scrypt, yescrypt, CTR_DRBG, HMAC_DRBG, Hash_DRBG, Fortuna |
| Standardized post-quantum     | `ready`   | `PQC-STANDARDIZED` | ML-KEM, ML-DSA, SLH-DSA, XMSS, LMS                                                                                                                                                                                                                                                               |
| Pre-standard post-quantum     | `notReady`| `PQC-PRESTANDARD`  | Kyber, Dilithium, Falcon, SPHINCS+, NTRU, NTRU-Prime, FrodoKEM, BIKE, HQC, Classic McEliece, Picnic, SQIsign, LESS, PERK, RYDE, MIRATH, QR-UOV, HAWK, Raccoon, AIMer, MAYO, UOV, SNOVA, CROSS, MQOM                                                                                           |
| Broken post-quantum           | `notReady`| `PQC-BROKEN`       | SIKE, Rainbow, GeMSS                                                                                                                                                                                                                                                                             |
| Hybrid                        | `ready`   | `PQC-HYBRID-FAMILY`| X-Wing                                                                                                                                                                                                                                                                                           |
| Ambiguous                     | `unknown` | `FAMILY-AMBIGUOUS` | GOST, RIPEMD — the family covers both a classically broken and an unbroken primitive, and the recorded properties do not say which. GOST with an elliptic curve is quantum-vulnerable.                                                                                                     |

A pre-standard candidate is a superseded draft of a standardized scheme, such as Kyber or Dilithium, or a candidate in an unfinished NIST round. It is not a migration target yet, even though it may be quantum-resistant.

:::note
FN-DSA is not in the family vocabulary of this rule set. An asset naming it is read as the classical DSA family and reads `notReady`.
:::

## Hybrid schemes

A hybrid combines a classical scheme with a post-quantum one, so that the combination stays secure while either half does. Its readiness is that of its post-quantum component; the classical half never decides. The platform recognizes a hybrid when the asset names a quantum-vulnerable component together with a post-quantum one:

| Example                  | Verdict    | Rule id                        |
|--------------------------|------------|--------------------------------|
| X25519-ML-KEM-768        | `ready`    | `PQC-HYBRID-PQC-STANDARDIZED`  |
| X25519-Kyber768          | `notReady` | `PQC-HYBRID-PQC-PRESTANDARD`   |
| X25519-Kyber768-SIKEp434 | `notReady` | `PQC-HYBRID-PQC-BROKEN`        |
| X-Wing                   | `ready`    | `PQC-HYBRID-FAMILY`            |

When a hybrid names several post-quantum components, a standardized one decides outright, and otherwise a broken one is not masked by a pre-standard one.

A hybrid decided by its components (a `PQC-HYBRID-PQC-…` rule) discloses it: the reason reads *A hybrid construction; its readiness is that of its post-quantum component*, or, when that component is not standardized, *A hybrid construction whose post-quantum component is not standardised:* followed by the component's own reason; and the fields the rule read include `hybridComponents`, the components the name yields, classical ones included. X-Wing, a hybrid family of its own, carries the reason of its family instead.

## Assets outside the question

Some assets have no post-quantum readiness of their own and are `notApplicable`:

| Rule id                  | Asset                                                                                                                                        |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `CERT-DEFERRED-V1`       | Every certificate. A certificate's readiness is that of the key it certifies, which this rule set generation does not resolve.              |
| `PROTOCOL-NOT-ALGORITHM` | Every protocol. Readiness belongs to the algorithms it negotiates, which are assets of their own.                                           |
| `ASSET-TYPE-UNROUTABLE`  | An asset of type `Unroutable`, which names no algorithm to assess.                                                                           |
| `MATERIAL-NOT-KEY`       | Related cryptographic material that is not a key: ciphertext, signature, digest, initialization vector, nonce, seed, salt, tag, additional data, password, credential, token. |
| `NAME-CIPHER-SUITE`      | An algorithm whose family is not resolved and whose name denotes a cipher suite; readiness belongs to its component algorithms.             |
| `NAME-NOT-AN-ALGORITHM`  | An algorithm whose family is not resolved and whose name denotes a library, an API, a container format or a construction category.         |

## Key material

Related cryptographic material that is not symmetric — a private or public key, a key pair, or material typed `key` or `other` — is judged by the algorithm family its name resolves to, so a private key named after RSA is `notReady` under `CLASSICAL-SHOR`. Symmetric key material — a secret key, a symmetric key or a shared secret — is judged by its declared size instead:

| Rule id                      | Verdict    | Material                                                                                   |
|------------------------------|------------|--------------------------------------------------------------------------------------------|
| `MATERIAL-SYMMETRIC-READY`   | `ready`    | A symmetric key of at least 128 bits                                                       |
| `MATERIAL-SYMMETRIC-WEAK`    | `notReady` | A symmetric key whose declared size is 64 to 127 bits                                      |
| `MATERIAL-SYMMETRIC-UNSIZED` | `unknown`  | A symmetric key whose declared size is absent or implausible (outside 64 to 16384 bits)    |

A symmetric key named after a classically broken or quantum-vulnerable family is judged by that family, whatever its size — unless its name records a hybrid construction, in which case it is judged by its declared size.

## When a verdict is unknown

| Rule id                  | Cause                                                                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `FAMILY-UNRESOLVED`      | The recorded properties resolve to no algorithm family the platform recognizes.                                                   |
| `FAMILY-AMBIGUOUS`       | The family covers both a broken and an unbroken primitive — GOST without an elliptic curve, RIPEMD.                               |
| `PQC-ONE-TIME-SIGNATURE` | A one-time signature scheme of LMS or XMSS on its own, which SP 800-208 approves only as a component within LMS or XMSS.         |
| `PQC-HYBRID-UNRESOLVED`  | A hybrid whose post-quantum component resolves to no recognized family.                                                           |
| `MATERIAL-SYMMETRIC-UNSIZED` | Symmetric key material without a usable size.                                                                                 |
| `EVALUATION-FAILED`      | The re-evaluation sweep could not evaluate the rule set against the asset.                                                        |

An asset that has not been evaluated at all is also listed as `unknown`, but carries no rule id; see [Provenance](#provenance).

## Rule set versioning

Every evaluated verdict records the version of the rule set that produced it. The version is raised whenever a change to the rules, or to the identity tables they read, changes any asset's verdict, rule id or recorded fields, so a verdict is always attributable to the rules that made it. The **PQC Rule Set Version** filter of the inventory finds the assets by that version.

A release that ships a new rule set does not change any verdict by itself. The existing verdicts keep their old version until the re-evaluation sweep reaches them, or a CBOM that declares the asset is onboarded, and are then re-evaluated under the new rules.

## Re-evaluation sweep

A verdict is decided each time a CBOM that declares the asset is onboarded. The re-evaluation sweep keeps the verdicts current in between: it evaluates every asset that has never been evaluated, and re-evaluates every asset whose verdict is stale, meaning it was produced by an earlier rule set version, or it is older than the asset it describes. An asset changes, for example, when one of its CBOMs is superseded or deleted and its payload is elected again from the remaining sources. A verdict can therefore change without a new CBOM.

The sweep is the scheduled job `CryptoAssetPqcSweepTask`, which runs every hour at half past (cron `0 30 * ? * *`). It is a system job of the [Scheduler](../architecture/scheduler.md): it can be [disabled](/api/core-scheduler#tag/scheduled-jobs-management/PATCH/v1/scheduler/jobs/{uuid}/disable) and [enabled](/api/core-scheduler#tag/scheduled-jobs-management/PATCH/v1/scheduler/jobs/{uuid}/enable) again, but its schedule cannot be edited. How much one run does is set at deployment time:

| Environment variable                            | Default | Meaning                                                                                                       |
|-------------------------------------------------|---------|---------------------------------------------------------------------------------------------------------------|
| `CRYPTO_ASSET_PQC_SWEEP_BATCH_SIZE`             | `500`   | How many assets one batch of the sweep re-evaluates and writes                                                |
| `CRYPTO_ASSET_PQC_SWEEP_MAX_BATCHES_PER_SWEEP`  | `20`    | How many batches one run of the sweep writes; the rest waits for the next run. `0` disables the sweep        |

With the defaults a run re-evaluates up to 10 000 assets. An asset the rule set cannot be evaluated against is recorded as `unknown` with the rule id `EVALUATION-FAILED`, and the run is marked failed in the job history.

## Provenance

The asset detail shows the verdict's provenance next to the verdict:

| Field              | Meaning                                                                                                   |
|--------------------|-----------------------------------------------------------------------------------------------------------|
| Rule set           | Version of the rule set of the last evaluation                                                            |
| Rule               | The rule that decided the verdict at the last evaluation                                                  |
| Reason             | The deciding rule's finding                                                                               |
| Fields the rule read | The values of the asset's fields the deciding rule evaluated, recorded at the last evaluation; the producer's `nistQuantumSecurityLevel`, when declared, is included for corroboration but never decides |
| Decided            | When the current verdict value was decided                                                                |
| Last evaluated     | When the verdict was last evaluated; a re-evaluation that confirms the verdict advances this and not **Decided** |

An asset can show the verdict `unknown` with no provenance yet. That is an asset that has never been evaluated: no verdict was recorded when its CBOM was onboarded, and the re-evaluation sweep has not reached it since. The list, the detail and the dashboard show it as `unknown`, but it has no stored verdict, so the **PQC Readiness** filter `unknown` does not match it; its detail reads *Not evaluated yet. The rule set has not reached this asset since it was synced.* If such assets persist, check that the job `CryptoAssetPqcSweepTask` is enabled and that `CRYPTO_ASSET_PQC_SWEEP_MAX_BATCHES_PER_SWEEP` is not `0`. It is different from an asset that was evaluated and found `unknown`, which does carry a provenance with the rule that decided it.

The verdict is also available through the API, in the [Cryptographic asset detail](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/{uuid}).
