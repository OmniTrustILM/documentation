---
sidebar_position: 7.5
---

# Post-Quantum Readiness

Every `Crypto Asset` in the [Cryptographic Asset Inventory](../modules/cryptographic-asset-inventory.md) carries a post-quantum readiness verdict: whether the cryptography it stands for withstands a cryptographically relevant quantum computer. The verdict is decided by a fixed set of rules that is shipped with the platform and cannot be configured. The rules follow [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd), *Transition to Post-Quantum Cryptography Standards*. Every evaluated asset shows which rule decided its verdict and why.

## Verdicts

| Verdict          | Description                                                                                                                                                                                                                     |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PQC ready`      | The asset withstands a cryptographically relevant quantum computer: an unbroken symmetric or hash-based algorithm of at least 128 bits or with no recorded size, a standardized post-quantum scheme, or a hybrid built on one. |
| `Not PQC ready`  | The asset needs migration: a quantum computer breaks it, it is broken classically already, it is a post-quantum scheme without a finished standard or broken by cryptanalysis, or it is a symmetric algorithm or key below 128 bits. |
| `Not applicable` | Post-quantum migration does not apply to the asset, for example material that is not a key, such as a password or a salt, or a name that denotes a library or a cipher suite rather than an algorithm.                       |
| `Unknown`        | The rules cannot decide from what the `CBOMs` record, or the asset has not been evaluated yet, see [When a verdict is Unknown](#when-a-verdict-is-unknown).                                                                    |

## How a verdict is decided

The rules read the properties the `CBOMs` record for the asset: its type, name, algorithm family, parameter set, elliptic curve and variant, and for key material its type and size. The first rule that applies decides; the [Rules](#rules) table lists them in order. A certificate or a protocol takes its verdict from the assets it refers to.

### Algorithm families

| Families                                                                                                                                                                                                                                                                                          | Verdict         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| Symmetric and hash-based: AES, ARIA, CAMELLIA, SEED, SM4, Serpent, Twofish, CAST6, RC6, Ascon, ChaCha, ChaCha20, Salsa20, RABBIT, HC, SNOW3G, ZUC, MILENAGE, TUAK, Fernet, SHA-2, SHA-3, BLAKE2, BLAKE3, SM3, Whirlpool, SipHash, Poly1305, HMAC, CMAC, UMAC, HKDF, ANSI-KDF, SP800-108, SP800-56C, SSH-KDF, TLS-PRF, IKE-PRF, PBKDF2, PBES2, PBMAC1, Argon2, bcrypt, scrypt, yescrypt, CTR_DRBG, HMAC_DRBG, Hash_DRBG, Fortuna | `PQC ready`     |
| Standardized post-quantum: ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205), LMS and XMSS (SP 800-208), and the hybrid X-Wing, built on ML-KEM                                                                                                                                             | `PQC ready`     |
| Broken by a quantum computer, because they rest on factoring or a discrete logarithm: RSA, RSA-X931, RSAES-OAEP, RSAES-PKCS1, RSASSA-PKCS1, RSASSA-PSS, DSA, EC, ECDH, ECDSA, ECIES, EdDSA, ElGamal, FFDH, MQV, SM2, SM9, BLS, J-PAKE, SPAKE2, SPAKE2PLUS, SRP, OPAQUE, X3DH, HPKE               | `Not PQC ready` |
| Broken or deprecated classically: DES, 3DES, RC2, RC4, RC5, Blowfish, CAST5, Skipjack, A5/1, A5/2, CMEA, 3GPP-XOR, MD2, MD4, MD5, SHA-1, PBKDF1, PBES1, IDEA, Yarrow                                                                                                                            | `Not PQC ready` |
| Post-quantum without a finished standard: Kyber, Dilithium, Falcon, SPHINCS+, NTRU, NTRU-Prime, FrodoKEM, BIKE, HQC, Classic McEliece, Picnic, SQIsign, LESS, PERK, RYDE, MIRATH, QR-UOV, HAWK, Raccoon, AIMer, MAYO, UOV, SNOVA, CROSS, MQOM                                                    | `Not PQC ready` |
| Post-quantum broken by cryptanalysis: SIKE, Rainbow, GeMSS                                                                                                                                                                                                                                        | `Not PQC ready` |
| Families with both broken and unbroken members: GOST, unless an elliptic curve makes it a quantum-vulnerable signature, and RIPEMD                                                                                                                                                                | `Unknown`       |

A classically broken family is `Not PQC ready` under a rule of its own, because it needs replacing whatever the quantum threat. A scheme without a finished standard, such as Kyber or Dilithium, is not a migration target yet. It is a draft of a scheme standardized under another name, or a candidate of an unfinished NIST round. An algorithm that names a weak component inherits it: `HMAC-MD5` and `SHA1withRSA` are `Not PQC ready`, while `AES-CMAC` is `PQC ready`. A construction such as HMAC, CMAC, HKDF or PBKDF2 is as strong as the primitive it is built on. It is `PQC ready` only when its name says which, as `HMAC-SHA256` does, and a bare `HMAC` is `Unknown`.

### Key sizes

A quantum computer halves the strength of symmetric and hash-based cryptography but does not break it, so the rules require at least 128 bits. An unbroken symmetric or hash-based algorithm recorded at 64 to 127 bits is `Not PQC ready`: `AES-64` is not ready, while `AES-128` and `AES-256` are. An algorithm with no recorded size is judged by its family alone, so `AES` is `PQC ready`. A secret key, symmetric key or shared secret of 64 to 127 bits is `Not PQC ready` too, but one whose `CBOM` records no usable size is `Unknown`. A key named after a `Not PQC ready` family is judged by that family whatever its size, so a 112-bit 3DES key is `Not PQC ready` as classically broken. A key whose name leaves its strength open, such as one named after HMAC alone, is `Unknown` unless it is below 128 bits. Sizes above the floor are not graded, and no size helps a family a quantum computer breaks: RSA-4096 is as `Not PQC ready` as RSA-2048.

### Hybrid schemes

A hybrid combines a classical scheme with a post-quantum one, such as X25519 with ML-KEM-768, and stays secure while either part does. Its verdict is that of its post-quantum part: `X25519-ML-KEM-768` is `PQC ready`, while `X25519-Kyber768` is `Not PQC ready`, because Kyber is a pre-standard draft. A classically broken component still makes it `Not PQC ready`, as MD5 does in `X25519-ML-KEM-768-MD5`. A name that offers schemes as alternatives is not a hybrid. `RSA-2048 or ML-DSA-65` and `ML-KEM-768 with RSA-2048 fallback` are `Not PQC ready`, because the RSA part may still be used alone.

### Certificates and protocols

A certificate or a protocol has no algorithm of its own, so its verdict is taken from the assets it refers to in the inventory:

- A certificate is as ready as the weaker of the key it certifies and the algorithm it is signed with. A certificate that records no signature algorithm is `Unknown` even with a ready key, because the signature may be the weaker.
- A protocol is as ready as the weakest algorithm its cipher suites name. It is `PQC ready` only when one of them establishes a key, as a key agreement or a KEM does. A TLS 1.3 cipher suite names only its cipher and hash, so a TLS 1.3 protocol whose suites name nothing else is `Unknown`.

Weaker means `Not PQC ready`, then `Unknown`, then `PQC ready`. A referenced asset that is not in the inventory or not evaluated counts as `Unknown`. The asset the verdict was taken from is shown as **Decided by**, a link to that asset. It appears on the **PQC readiness** widget of the **Details** tab and on the deciding step of the explanation. When that asset has left the inventory, or the viewer's role does not grant access to it, only its identifier is shown. The text beside it reads *This asset has been removed from the inventory, or your role does not grant access to it.*

### What is not evaluated

- The transition dates NIST IR 8547 proposes for deprecating quantum-vulnerable algorithms: the rules decide readiness, not a timeline.
- Key sizes above the 128-bit floor, see [Key sizes](#key-sizes).
- The mode of operation and the padding of an algorithm.
- The NIST quantum security level a `CBOM` declares: it is shown among the evaluated properties, but it never decides.

:::note
FN-DSA is not among the families the rules know. An asset named after it is read as DSA and is `Not PQC ready`.
:::

## When a verdict is Unknown

An asset reads `Unknown` when it has not been evaluated yet, or when the rules could not decide its verdict. Its detail tells the two apart:

| Situation                                                                          | **PQC readiness** widget on the **Details** tab                                                     | **PQC readiness** tab                                                                                       |
|------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Not evaluated yet: the rules have not reached the asset since it was synchronized | *Not evaluated yet. The rule set has not reached this asset since it was synced.*                   | *This asset has not been evaluated yet. The next re-evaluation will store this result.*, above that result |
| Evaluated, but undecided: usually the `CBOMs` do not record what the rules need, or, for `EVALUATION-FAILED`, the platform could not evaluate the asset | **Verdict** `Unknown`, with the **Rule** and the **Reason** that decided, such as `PROTOCOL-NO-KEY-EXCHANGE` | The deciding step, with the **Properties read** by its rule                                                 |

An asset that has not been evaluated yet is listed as `Unknown`, but the **PQC Readiness** filter finds it under `Unknown` only once it has been evaluated. If assets stay not evaluated, check in the [Scheduler](scheduler.md) that the job `CryptoAssetPqcSweepTask` is enabled. For an evaluated `Unknown`, the **Reason** says why the rules could not decide. Often a property is missing, such as the key exchange of a protocol, the signature algorithm of a certificate or the size of a key. A `CBOM` that records it leads to a decided verdict.

## Re-evaluation

An asset gets its verdict when the assets of its `CBOM` are added to the inventory. The scheduled job `CryptoAssetPqcSweepTask`, a system job of the [Scheduler](scheduler.md#supported-task-types), runs every hour at half past. It evaluates every asset not evaluated yet and every verdict that is out of date. A verdict is out of date when something it was decided from has changed. That is a new `CBOM`, a change to the asset or to an asset it refers to, or new rules after an upgrade. A verdict can therefore change without a new `CBOM` of its own, for example when the key a certificate certifies changes its verdict. The job can be disabled and enabled; while it is disabled, no verdict is re-evaluated. There is no re-evaluation of a single asset on demand.

## Reading the explanation

The **PQC readiness** tab of the asset detail shows the widget **PQC readiness evaluation**. It evaluates the asset again from what is stored now, rule by rule, and changes nothing. The list and the **Details** tab keep showing the stored verdict until the next re-evaluation. **Refresh** evaluates again. A line at the top compares the result with the stored verdict:

- *Evaluation is up-to-date with stored evaluation result*, followed by when the asset was last evaluated.
- *This asset has not been evaluated yet. The next re-evaluation will store this result.*
- *The stored evaluation result is out of date.*, followed by the **Stored** and the **Recomputed** verdict and rule; the next re-evaluation stores the recomputed one.

The table lists the rules for the asset's type in the order they are tried. Each row shows the title of the rule, its identifier, its **Outcome**, its **Verdict** and a **Message**:

| Outcome       | Meaning                                                                                                                         |
|---------------|---------------------------------------------------------------------------------------------------------------------------------|
| `Not matched` | The rule's condition did not hold for the asset.                                                                                |
| `Decided`     | The rule's condition held and its verdict is the asset's.                                                                       |
| `Resolved`    | The rule's condition held and the verdict is the one stored on another inventory asset the asset refers to, shown as **Decided by**. |
| `Not reached` | An earlier rule decided, so this rule was not evaluated.                                                                        |
| `Failed`      | The rule set could not be evaluated against the asset's recorded properties, so no rule decided.                                |

The title of the deciding rule is in bold, and the last row, **PQC readiness result**, repeats the verdict and its reason. The info button of a step lists the **Properties read** by its rule, and the **Evaluated properties** widget lists every property the rules read. A property taken from a `CBOM` the viewer may not read is not shown, although the rules still read it.

## Rules

The rules in the order the explanation lists them. A certificate is tested only against the certificate rules, and a protocol only against the protocol rules. Any other asset is tested against the rules for its type, and the first that applies decides.

| Rule                                                         | Verdict                    | When it applies                                                                                                                   |
|--------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `CERT-SUBJECT-KEY` (Certified key)                           | The key's                  | A certificate whose certified key is no stronger than its signature algorithm                                                     |
| `CERT-SIGNATURE-ALGORITHM` (Signature algorithm)             | The signature algorithm's  | A certificate signed with an algorithm weaker than the key it certifies                                                           |
| `CERT-REFERENCE-UNRESOLVED` (Unresolved certificate reference) | `Unknown`                | A certificate whose key or signature algorithm is not an evaluated asset of the inventory                                         |
| `CERT-NO-SIGNATURE-RECORDED` (No signature algorithm recorded) | `Unknown`                | A certificate with a `PQC ready` key and no signature algorithm recorded                                                          |
| `CERT-NO-KEY-RECORDED` (No certified key recorded)           | `Unknown`                  | Any other certificate: no certified key is recorded                                                                               |
| `PROTOCOL-CIPHER-SUITE` (Cipher suite algorithms)            | The weakest algorithm's    | A protocol whose suite algorithms include a `Not PQC ready` or `Unknown` one, or are all `PQC ready` and one establishes a key     |
| `PROTOCOL-SUITE-UNRESOLVED` (Unresolved cipher suite algorithm) | `Unknown`               | A protocol whose suites name an algorithm that is not an evaluated asset of the inventory                                         |
| `PROTOCOL-NO-KEY-EXCHANGE` (No key exchange named)           | `Unknown`                  | A protocol whose suite algorithms are all `PQC ready`, but none establishes a key                                                 |
| `PROTOCOL-NO-SUITES` (No cipher suites recorded)             | `Unknown`                  | Any other protocol: no cipher suite names an algorithm                                                                            |
| `ASSET-TYPE-UNROUTABLE` (Asset type)                         | `Not applicable`           | An asset with no asset type                                                                                                       |
| `MATERIAL-NOT-KEY` (Material that is not a key)              | `Not applicable`           | Ciphertext, signature, digest, initialization vector, nonce, seed, salt, tag, additional data, password, credential or token      |
| `NAME-CIPHER-SUITE` (Cipher suite name)                      | `Not applicable`           | An algorithm without a known family whose name is a cipher suite                                                                  |
| `NAME-NOT-AN-ALGORITHM` (Non-algorithm name)                 | `Not applicable`           | An algorithm without a known family whose name is a library, an API, a container format or a category, such as `OpenSSL`         |
| `MATERIAL-SYMMETRIC-READY` (Symmetric key size)              | `PQC ready`                | A secret key, symmetric key or shared secret of at least 128 bits whose name reads `PQC ready` on its own or names no family       |
| `MATERIAL-SYMMETRIC-WEAK` (Undersized symmetric key)         | `Not PQC ready`            | Such a key below 128 bits, unless its name already makes it `Not PQC ready`                                                       |
| `MATERIAL-SYMMETRIC-UNSIZED` (Unsized symmetric key)         | `Unknown`                  | Such a key with no usable size whose name reads `PQC ready` on its own or names no family                                         |
| `CLASSICAL-LEGACY-COMPONENT` (Classically broken component)  | `Not PQC ready`            | A name with a classically broken component, such as `HMAC-MD5` or `SHA1withRSA`                                                   |
| `PQC-HYBRID` (Hybrid construction)                           | The post-quantum part's    | A [hybrid](#hybrid-schemes); the deciding step shows the part, as in `PQC-HYBRID-PQC-STANDARDIZED`                                |
| `PQC-HYBRID-UNRESOLVED` (Hybrid without a ratified post-quantum component) | `Unknown`    | A hybrid whose post-quantum part is not a known family                                                                            |
| `CLASSICAL-SHOR-COMPONENT` (Quantum-vulnerable component)    | `Not PQC ready`            | A name with a component a quantum computer breaks, such as `RSA-2048 or ML-DSA-65`                                                |
| `FAMILY-UNRESOLVED` (Unresolved algorithm family)            | `Unknown`                  | No known algorithm family                                                                                                         |
| `CLASSICAL-SHOR` (Quantum-vulnerable family)                 | `Not PQC ready`            | A family a quantum computer breaks, or GOST with an elliptic curve                                                                |
| `FAMILY-AMBIGUOUS-COMPONENT` (Ambiguous primitive)           | `Unknown`                  | A construction built on GOST or RIPEMD, such as `HMAC-RIPEMD`                                                                     |
| `CONSTRUCTION-UNINSTANTIATED` (Construction without a primitive) | `Unknown`               | A construction that does not name its primitive, such as bare `HMAC` or `PBKDF2`                                                  |
| `SYMMETRIC-UNDERSIZED` (Undersized symmetric primitive)      | `Not PQC ready`            | An unbroken symmetric or hash-based algorithm of 64 to 127 bits, such as `AES-64`                                                 |
| `SYMMETRIC-READY` (Symmetric or hash-based family)           | `PQC ready`                | Any other unbroken symmetric or hash-based family                                                                                 |
| `PQC-ONE-TIME-SIGNATURE` (One-time signature)                | `Unknown`                  | A one-time signature of LMS or XMSS on its own, which SP 800-208 approves only within LMS or XMSS                                 |
| `PQC-STANDARDIZED` (Standardised post-quantum scheme)        | `PQC ready`                | A standardized post-quantum family                                                                                                |
| `PQC-PRESTANDARD` (Pre-standard post-quantum scheme)         | `Not PQC ready`            | A post-quantum family without a finished standard                                                                                 |
| `PQC-BROKEN` (Broken post-quantum candidate)                 | `Not PQC ready`            | A post-quantum family broken by cryptanalysis                                                                                     |
| `PQC-HYBRID-FAMILY` (Named hybrid family)                    | `PQC ready`                | X-Wing, when its name does not name its parts                                                                                     |
| `CLASSICAL-LEGACY` (Classically broken family)               | `Not PQC ready`            | A classically broken family                                                                                                       |
| `FAMILY-AMBIGUOUS` (Ambiguous family)                        | `Unknown`                  | GOST without an elliptic curve, or RIPEMD                                                                                         |
| `EVALUATION-FAILED` (Evaluation)                             | `Unknown`                  | The rules could not be evaluated for the asset; the explanation shows only this `Failed` step                                     |
