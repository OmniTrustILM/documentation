---
sidebar_position: 18
---

# Post-Quantum Readiness

Every asset of the [cryptographic asset inventory](cryptographic-asset-inventory.md) carries a post-quantum readiness verdict: whether the cryptography it stands for withstands a cryptographically relevant quantum computer. A rule set the platform ships decides the verdict. The rule set is not configurable, so the verdicts of two deployments on the same release are comparable, and every evaluated verdict records the rule that decided it, its reason, the fields it read, when it was decided and last evaluated, and — for a certificate or protocol — the asset whose verdict was carried over.

This page describes the rules shipped with release 2.20.0.

## Verdicts

| Verdict          | Label            | Meaning                                                                                                                   |
|------------------|------------------|---------------------------------------------------------------------------------------------------------------------------|
| `ready`          | `PQC ready`      | The asset withstands a cryptographically relevant quantum computer.                                                       |
| `notReady`       | `Not PQC ready`  | The asset is not a migration target: its cryptography is broken by a quantum computer or already broken classically; it is a post-quantum scheme not yet standardized or one broken by cryptanalysis; it is a symmetric or hash-based algorithm or key whose recorded size is 64 to 127 bits; or it is a certificate or protocol whose certified key, signature algorithm or cipher suite algorithm is `notReady`. |
| `notApplicable`  | `Not applicable` | Post-quantum migration does not apply to the asset: it has no asset type the platform routes, it is related cryptographic material that is not a key, or it is an algorithm whose name denotes a cipher suite or something other than an algorithm. Certificates and protocols are never `notApplicable`. |
| `unknown`        | `Unknown`        | The rule set cannot classify the asset from the recorded properties — for a certificate or protocol, a reference resolves to no evaluated asset, or what is recorded cannot affirm it — or the asset has not been evaluated yet. |

The verdict is decided from what the platform recorded for the asset: its type, name, algorithm family, parameter set, curve and variant; for key material, the material type and size its elected payload declares, and the family and size its name spells; and for a certificate or protocol, the stored verdicts of the assets its references resolve to. Mode and padding are recorded as inputs too, but no rule reads them. Certificates and protocols are judged by their [reference rules](#certificates-and-protocols) alone. Every other asset goes through the rule table, where the first rule that applies decides, and an asset no table rule claims is judged by what its name and family say. The [rule catalog](#rule-catalog) lists every rule in the order it is consulted.

## The NIST IR 8547 framing

The rule set follows the framing of [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd), *Transition to Post-Quantum Cryptography Standards*, which separates the cryptography a quantum computer breaks from the cryptography it only weakens:

- **Quantum-vulnerable** — schemes whose security rests on factoring or a discrete logarithm, such as RSA, DSA, ECDSA, EdDSA, ECDH and finite-field Diffie-Hellman. Shor's algorithm breaks them outright, so they are `notReady` at any key size.
- **Symmetric and hash-based** — block and stream ciphers, hash functions, MACs, key derivation and random bit generators. Grover's algorithm halves their strength but breaks none of them, so they are `ready`.
- **Standardized post-quantum** — ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205), and LMS and XMSS (SP 800-208). They are `ready`.

The rule set decides readiness, not the transition timeline. It does not encode the dates NIST IR 8547 proposes for deprecating and disallowing quantum-vulnerable algorithms. It grades strength only against a floor of 128 bits: a symmetric or hash-based algorithm or key whose recorded size is below the floor is `notReady`, and above the floor nothing is graded — AES-128 is as `ready` as AES-256, and RSA-4096 as `notReady` as RSA-2048. A size counts only inside 64 to 16384 bits: below that a bit count cannot be told from a byte count, and above it a number is a cost or round count. A parameter set is read as a size only for a family that is not a [construction](#constructions); see [Sizes](#sizes) and [Key material](#key-material).

The rule set departs from a strict reading of the framing in one place, described next.

## Classically broken families

A literal reading of the framing would call DES post-quantum ready — which is true, and useless. The rule set therefore treats families that are already broken or deprecated on classical grounds as a class of their own. They are `notReady`, like quantum-vulnerable families, but under a different rule — `CLASSICAL-LEGACY` rather than `CLASSICAL-SHOR` — because the migration they need is a different one: they are not a migration target regardless of any quantum threat.

An algorithm that names a weak component inherits it, whatever its own family. HMAC-MD5, PBKDF2-HMAC-SHA1 or 3DES-CMAC are `notReady` under `CLASSICAL-LEGACY-COMPONENT`, while AES-CMAC stays `ready`. An algorithm that names a quantum-vulnerable component — RSA-OAEP wrapping an AES key, as in `CKM_RSA_AES_KEY_WRAP`, or `ECIES-X25519-XSalsa20-Poly1305` — is `notReady` under `CLASSICAL-SHOR-COMPONENT`. When an algorithm names both kinds, the classically broken one decides, so SHA1withRSA reads `CLASSICAL-LEGACY-COMPONENT` rather than `CLASSICAL-SHOR`. A [hybrid](#hybrid-schemes) takes the verdict of its post-quantum component — unless it names a classically broken component, which decides (`CLASSICAL-LEGACY-COMPONENT`). [Key material](#key-material) takes the finding its name carries, and otherwise is judged by its size.

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

### Constructions

Sixteen of the symmetric and hash-based families are constructions, whose strength is that of the primitive they are built on: HMAC, CMAC, UMAC, HKDF, ANSI-KDF, SP800-108, SP800-56C, SSH-KDF, TLS-PRF, IKE-PRF, PBKDF2, PBES2, PBMAC1, CTR_DRBG, HMAC_DRBG and Hash_DRBG. A construction is `ready` under `SYMMETRIC-READY` only when the record names the unbroken primitive it is built on, as `HMAC-SHA256`, `AES-CMAC` and `PBKDF2-HMAC-SHA256` do. Otherwise:

- A construction that names no primitive is `unknown` under `CONSTRUCTION-UNINSTANTIATED`, as bare `HMAC`, `CMAC`, `HKDF` or `PBKDF2` are. Another construction does not count as its primitive, so `PBKDF2-HMAC` names none, and neither does an OID.
- A construction built on RIPEMD or GOST is `unknown` under `FAMILY-AMBIGUOUS-COMPONENT`, as `HMAC-RIPEMD`, `HMAC-GOST` and `PBKDF2-HMAC-RIPEMD160` are.
- A construction built on a classically broken primitive is `notReady` under `CLASSICAL-LEGACY-COMPONENT`, as `HMAC-MD5` and `PBKDF2-HMAC-SHA1` are.

A number in a construction's name is a tag or digest length, never a key size, so `CMAC-AES-64`, `AES-CMAC-96` and `HMAC-SHA-512/256` stay `ready`. The declared size of a key for a construction still counts against the floor.

### Sizes

An unbroken symmetric or hash-based primitive whose recorded size is 64 to 127 bits is `notReady` under `SYMMETRIC-UNDERSIZED`: *A symmetric or hash-based primitive whose recorded size is below 128 bits, so Grover's algorithm leaves it with no adequate strength*. `AES-64` and `RC6-64` are undersized, while `AES`, `AES-128`, `AES-256` and `aes128-gcm` are `ready`. For an algorithm the recorded size is its parameter set; for key material it is the declared size, or the size its name spells when that is smaller (see [Key material](#key-material)).

## Hybrid schemes

A hybrid combines a classical scheme with a post-quantum one, so that the combination stays secure while either half does. Its readiness is that of its post-quantum component: the quantum-vulnerable half never decides, but a classically broken component does. The platform recognizes a hybrid when the asset's name yields a post-quantum component together with a quantum-vulnerable one. For a quantum-vulnerable family, a post-quantum family the name carries beside it counts too, so `X25519-HAWK-512` is a hybrid:

| Example                  | Verdict    | Rule id                        |
|--------------------------|------------|--------------------------------|
| X25519-ML-KEM-768        | `ready`    | `PQC-HYBRID-PQC-STANDARDIZED`  |
| X25519-Kyber768          | `notReady` | `PQC-HYBRID-PQC-PRESTANDARD`   |
| X25519-HAWK-512          | `notReady` | `PQC-HYBRID-PQC-PRESTANDARD`   |
| X25519-Kyber768-SIKEp434 | `notReady` | `PQC-HYBRID-PQC-BROKEN`        |
| X-Wing                   | `ready`    | `PQC-HYBRID-FAMILY`            |
| X25519-ML-KEM-768-MD5    | `notReady` | `CLASSICAL-LEGACY-COMPONENT`   |
| RSA-2048 or ML-DSA-65    | `notReady` | `CLASSICAL-SHOR-COMPONENT`     |

When a hybrid names several post-quantum components, the most decisive one decides: a standardized component outright, then X-Wing named as a component, then a broken one, then a pre-standard one. So a broken component is not masked by a pre-standard one.

A verdict taken from a hybrid's components (a `PQC-HYBRID-PQC-…` rule) discloses it: the reason reads *A hybrid construction; its readiness is that of its post-quantum component*, or, when that component is broken or pre-standard, *A hybrid construction whose post-quantum component is not standardised:* followed by the component's own reason; and the fields the rule read include `hybridComponents`, the components the name yields, classical ones included. X-Wing, a hybrid family of its own, carries the reason of its family instead. A hybrid whose post-quantum component resolves to no recognized family is `unknown` under `PQC-HYBRID-UNRESOLVED`: *A hybrid construction whose post-quantum component resolves to no ratified family*.

A hybrid that names a classically broken component is `notReady` under `CLASSICAL-LEGACY-COMPONENT`, whatever its post-quantum component — whether the broken component is a digest inside the construction, as in `X25519-ML-KEM-768-MD5`, or the family the name elects, as in `PBKDF1-X25519-ML-KEM-768`. The fields the rule read still include `hybridComponents`.

A name that alternates between schemes, or lists them, is not a hybrid. A name alternates when it contains, as a whole word in any case, `or`, `either`, `vs`, `versus`, `instead`, a word beginning with `replac` or `migrat`, `fallback` (also spelled `fall back` or `fall-back`) or `dual stack` (also `dual-stack` or `dualstack`); or when it contains a comma or semicolon outside parentheses, or a `/` spaced on both sides where one of the spaces is a tab or line break. Its post-quantum part cannot vouch for it, so a quantum-vulnerable part makes it `notReady` under `CLASSICAL-SHOR-COMPONENT` — or `CLASSICAL-SHOR`, when that part is the family the name elects. `RSA-2048 or ML-DSA-65` and `ML-KEM-768 with RSA-2048 fallback` are alternations. `and` and `with` do not alternate, so `X25519 with ML-KEM-768`, `X25519 and ML-KEM-768`, `X25519 / ML-KEM-768` with plain spaces and `X-Wing (X25519, ML-KEM-768)` are hybrids, and `SHA-512/224` and `A5/1` are single families.

## Certificates and protocols

A certificate or protocol carries no algorithm of its own, so its verdict is read from the assets it refers to. A certificate is as ready as the weaker of the key it certifies and the algorithm it is signed with; a protocol is as ready as the weakest algorithm its cipher suites name. Weaker means `notReady`, then `unknown`, then `ready`. A reference that is recorded but unresolved counts as `unknown`, because it may be the weak one: a resolved `notReady` or `unknown` still decides beside it, while a resolved `ready` does not. Every certificate is signed, so a signature algorithm that is not recorded counts as `unknown` too, as does a certified key that is not recorded; when the key and the signature algorithm are equally weak, the key decides. A protocol is `ready` only when one of the algorithms its suites name establishes a key — its CycloneDX primitive is `key-agree` or `kem` — because a TLS 1.3 suite names only its AEAD cipher and hash, and the key exchange is negotiated apart from it. Among equally weak suite algorithms, the first in suite order decides.

A certificate refers to its key and signature algorithm through `certificateProperties.subjectPublicKeyRef` and `signatureAlgorithmRef`, or through the CycloneDX 1.7 `relatedCryptographicAssets` entries of those kinds, which take precedence; a protocol refers to the algorithms of `protocolProperties.cipherSuites[].algorithms[]`. A bom-ref names a component only within its document, so each reference is resolved to an inventory asset when the document is onboarded, and recorded for that document. Only the references of the source whose payload the asset elected count. The rules read the referenced asset's stored verdict; they do not evaluate it again.

The rules look one step only. A reference is *unresolved* when it names no inventory asset, or an asset that is itself a certificate or protocol, has not been evaluated yet, or is `notApplicable`. Two references of one kind on a certificate — two keys, or two signature algorithms — are ambiguous and count as unresolved.

| Rule id                      | Verdict                     | Applies when                                                                                                         | Reason |
|------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------|--------|
| `CERT-SUBJECT-KEY`           | The certified key's         | The certified key resolved and is no stronger than the signature algorithm                                           | *The certificate is as ready as the key it certifies, which is no stronger than its signature algorithm* |
| `CERT-SIGNATURE-ALGORITHM`   | The signature algorithm's   | The signature algorithm resolved and is weaker than the certified key                                                | *The certificate is signed with an algorithm weaker than the key it certifies, so the signature decides* |
| `CERT-REFERENCE-UNRESOLVED`  | `unknown`                   | A recorded key or signature algorithm is unresolved, and neither rule above decided                                  | *The certificate names a key or signature algorithm that resolved to no evaluated inventory asset, so its readiness cannot be affirmed* |
| `CERT-NO-SIGNATURE-RECORDED` | `unknown`                   | The certified key is `ready`, and no signature algorithm is recorded                                                 | *The certificate records no signature algorithm, which may be weaker than the key it certifies, so its readiness cannot be affirmed* |
| `CERT-NO-KEY-RECORDED`       | `unknown`                   | Any other certificate: no certified key is recorded                                                                  | *The certificate records no key it certifies, so its readiness cannot be affirmed* |
| `PROTOCOL-CIPHER-SUITE`      | The weakest algorithm's     | A resolved suite algorithm is `notReady` or `unknown`, or every suite algorithm resolved `ready` and one of them establishes a key | *A protocol is as ready as the weakest algorithm its cipher suites name* |
| `PROTOCOL-SUITE-UNRESOLVED`  | `unknown`                   | A suite algorithm is unresolved, and none that resolved is weaker than `ready`                                       | *A cipher suite names an algorithm that resolved to no evaluated inventory asset, so the protocol's readiness cannot be affirmed* |
| `PROTOCOL-NO-KEY-EXCHANGE`   | `unknown`                   | Every suite algorithm resolved `ready`, and none of them establishes a key                                           | *Every algorithm the cipher suites name is ready, but none of them establishes a key, which the protocol negotiates separately and may be vulnerable* |
| `PROTOCOL-NO-SUITES`         | `unknown`                   | Any other protocol: no cipher suite names an algorithm                                                               | *The protocol records no cipher suite that names an algorithm, so its readiness cannot be affirmed* |

Many protocols read `unknown` under one of the last two rules: a protocol whose suites name only `ready` AEAD ciphers and hashes, as TLS 1.3 suites do, is `PROTOCOL-NO-KEY-EXCHANGE`, and a protocol recorded without cipher suites, or with suites that name no algorithm, is `PROTOCOL-NO-SUITES`. Such a verdict carries its rule id, which tells it apart from an asset not evaluated yet, which has no provenance, and from one the rules cannot classify, which reads `FAMILY-UNRESOLVED`.

When `CERT-SUBJECT-KEY`, `CERT-SIGNATURE-ALGORITHM` or `PROTOCOL-CIPHER-SUITE` decides, the verdict is carried over from the referenced asset. The fields the rule read then name the reference that decided — for a protocol, together with its suite — and, as `referencedRuleId`, the rule behind the referenced asset's own verdict. The API serves that asset on the verdict as `referencedAsset`: its `uuid`, as recorded when the verdict was decided, and `visible`, which is `false` when the asset has been removed from the inventory or the caller's role does not grant `detail` on it. Its `name` and `type` are served only when it is visible, and `type` only when the asset has one, `name` only when it has a name to serve. `referencedAsset` is absent when the asset's own properties decided, or when the reference could not be resolved. The UI on this release does not show it.

The references and suite labels in these fields are copied from the CBOM document: `subjectPublicKeyRef`, `signatureAlgorithmRef`, `cipherSuites`, `cipherSuiteAlgorithmRefs`, `unresolvedRefs`, `cipherSuite` and `cipherSuiteAlgorithmRef`. They are left out of the asset detail and of the [explanation](#explanation) unless the caller may list the CBOM the elected payload was taken from (see [CBOM and cryptographic asset permissions](../architecture/access-control/roles-permissions.md#cbom-and-cryptographic-asset-permissions)), and out of the asset detail while the asset's revision has moved since the verdict was evaluated, because such a verdict may carry the values of a source withdrawn since. A suite is labeled by its IANA code (`0x…`), else by its name, else by its position (`#1`, `#2`, …).

A certificate's or protocol's verdict is also stale, and re-evaluated by the [sweep](#re-evaluation-sweep), when the verdict, deciding rule or primitive of an asset it refers to changes, or when that asset leaves the inventory.

## Assets outside the question

Some assets have no post-quantum readiness of their own and are `notApplicable`:

| Rule id                  | Asset                                                                                                                                        |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `ASSET-TYPE-UNROUTABLE`  | An asset whose producer named no asset type the platform routes. It is served without a type, and the UI shows it as **Untyped**.            |
| `MATERIAL-NOT-KEY`       | Related cryptographic material that is not a key: ciphertext, signature, digest, initialization vector, nonce, seed, salt, tag, additional data, password, credential, token. |
| `NAME-CIPHER-SUITE`      | An algorithm whose family is not resolved and whose name denotes a cipher suite; readiness belongs to its component algorithms.             |
| `NAME-NOT-AN-ALGORITHM`  | An algorithm whose family is not resolved and whose name denotes a library, an API, a container format or a construction category.         |

Certificates and protocols are not among them: their readiness is read from the assets they refer to; see [Certificates and protocols](#certificates-and-protocols).

## Key material

Related cryptographic material that is not symmetric — a private or public key, a key pair, material typed `key`, `other` or a type outside the CycloneDX vocabulary, or material with no type recorded (`unknown` reads as none) — takes the path of an algorithm: it is judged by the family its name resolves to and the findings its name carries, and, for a symmetric or hash-based family, by its size against the floor. A private key named after RSA is `notReady` under `CLASSICAL-SHOR`, while an AES key typed `key` is `notReady` under `SYMMETRIC-UNDERSIZED` at 64 bits and `ready` under `SYMMETRIC-READY` at 256 bits.

Symmetric key material — a secret key, a symmetric key or a shared secret — is judged by its declared size only when its name leaves the strength open: the name clears as `ready`, or resolves to no family at all. A name that carries a finding decides instead, under the rule id the algorithm of that name takes:

| Rule id                      | Verdict    | Material                                                                                   |
|------------------------------|------------|--------------------------------------------------------------------------------------------|
| `MATERIAL-SYMMETRIC-READY`   | `ready`    | A symmetric key of at least 128 bits whose name clears or resolves to no family            |
| `MATERIAL-SYMMETRIC-WEAK`    | `notReady` | A symmetric key of 64 to 127 bits whose name carries no `notReady` finding                 |
| `MATERIAL-SYMMETRIC-UNSIZED` | `unknown`  | A symmetric key whose declared size is absent or implausible (outside 64 to 16384 bits), and whose name clears or resolves to no family |

A key of 127 bits is weak and one of 128 bits ready. A declared size below 64 bits, such as 56, 32 or 0, is read as absent, so a key with such a size and a name that resolves to no family is `MATERIAL-SYMMETRIC-UNSIZED`. A key whose name leaves the question open — an ambiguous family such as `HMAC-RIPEMD` or `GOST`, or a bare construction such as `HMAC` — is `unknown` under the rule the algorithm of that name takes, unless it is 64 to 127 bits long, which is weak whichever member it is.

When the name spells a size too, the smaller of the declared size and the size the name spells decides, so a key cannot clear what the algorithm of its name fails: `myAESKey-AES-64` declared at 256 bits is `notReady` under `SYMMETRIC-UNDERSIZED`. The size a name spells is the run of digits right after the family token, as in `AES-64`, `AES64`, `AES_64` or `AES/64` — not a number elsewhere in the name, such as the 96 of `AES-GCM-96`.

A key named after a classically broken or quantum-vulnerable family is judged by that family, whatever its size: a key named `DES` or `RC4` is `CLASSICAL-LEGACY`, and an `RSA-2048` shared secret is `CLASSICAL-SHOR`. A key named after a hybrid takes the hybrid's verdict: a 256-bit shared secret named `X25519-Kyber768` is `notReady` under `PQC-HYBRID-PQC-PRESTANDARD`, and one named `X25519-SIKEp434` under `PQC-HYBRID-PQC-BROKEN`. Only a hybrid that clears, such as `X25519-ML-KEM-768`, leaves the size to decide: the same 256-bit secret under that name is `ready` under `MATERIAL-SYMMETRIC-READY`.

## When a verdict is unknown

| Rule id                       | Cause                                                                                                                             |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `FAMILY-UNRESOLVED`           | The recorded properties resolve to no algorithm family the platform recognizes.                                                   |
| `FAMILY-AMBIGUOUS`            | The family covers both a broken and an unbroken primitive — GOST without an elliptic curve, RIPEMD.                               |
| `FAMILY-AMBIGUOUS-COMPONENT`  | A [construction](#constructions) built on such a primitive, such as `HMAC-RIPEMD` or `HMAC-GOST`.                                 |
| `CONSTRUCTION-UNINSTANTIATED` | A [construction](#constructions) whose record names no primitive, such as bare `HMAC` or `PBKDF2`.                                |
| `PQC-ONE-TIME-SIGNATURE`      | A one-time signature scheme of LMS or XMSS on its own, which SP 800-208 approves only as a component within LMS or XMSS.         |
| `PQC-HYBRID-UNRESOLVED`       | A hybrid whose post-quantum component resolves to no recognized family.                                                           |
| `MATERIAL-SYMMETRIC-UNSIZED`  | Symmetric key material without a usable size.                                                                                     |
| `CERT-REFERENCE-UNRESOLVED`   | A certificate whose recorded key or signature algorithm resolves to no evaluated asset, where no resolved reference decides.      |
| `CERT-NO-SIGNATURE-RECORDED`  | A certificate whose certified key is `ready` but which records no signature algorithm.                                            |
| `CERT-NO-KEY-RECORDED`        | A certificate that records no key it certifies.                                                                                   |
| `PROTOCOL-SUITE-UNRESOLVED`   | A protocol whose suites name an algorithm that resolves to no evaluated asset, where no resolved algorithm is weaker than `ready`. |
| `PROTOCOL-NO-KEY-EXCHANGE`    | A protocol whose suites name only `ready` algorithms, none of which establishes a key.                                            |
| `PROTOCOL-NO-SUITES`          | A protocol that records no cipher suite naming an algorithm.                                                                      |
| `EVALUATION-FAILED`           | The rules could not be evaluated against the asset's recorded properties. The sweep records this verdict, and the [explanation](#explanation) reports the same as a single failed step. |

An asset that has not been evaluated at all is also listed as `unknown`, but carries no rule id; see [Provenance](#provenance).

## Rule changes

The rule set carries no version. Instead, every asset carries a revision that each write to what the rules read advances, and its verdict records the revision it was evaluated at. A verdict whose revision has moved is stale, and the [re-evaluation sweep](#re-evaluation-sweep) evaluates it again.

A release that changes the rules ships a migration that advances the revision of every asset, so after the upgrade the sweep re-evaluates the whole inventory — up to 10 000 assets per run with the defaults, so a large inventory takes several runs. A rule change changes no verdict by itself: an asset keeps the verdict the earlier rules decided until the sweep, or the onboarding of a CBOM that declares it, reaches it. Until then its [explanation](#explanation) already shows the new verdict, with `matchesStored` false.

The inventory is new in 2.20.0, so the 2.20.0 upgrade has no earlier verdicts to re-evaluate: every existing CBOM record starts `Pending` (see [Asset sync states](../core-components/cbom.md#asset-sync-states)), and its assets arrive as the catch-up onboards it, each evaluated under these rules.

## Re-evaluation sweep

Onboarding a CBOM evaluates every asset it touches, certificates and protocols with their references; an evaluation that fails there is logged and left to the sweep. The re-evaluation sweep keeps the verdicts current in between. It evaluates every asset that has never been evaluated, and re-evaluates every asset whose verdict is stale: its revision moved since the verdict was evaluated — for example because the asset's payload was elected again after one of its CBOMs was superseded or deleted, or because a [rule change](#rule-changes) advanced it — or, for a certificate or protocol, the verdict, deciding rule or primitive of an asset it refers to changed. A verdict can therefore change without a new CBOM.

The sweep is the scheduled job `CryptoAssetPqcSweepTask`, which runs every hour at half past (cron `0 30 * ? * *`). It is a system job of the [Scheduler](../architecture/scheduler.md): it can be [disabled](/api/core-scheduler#tag/scheduled-jobs-management/PATCH/v1/scheduler/jobs/{uuid}/disable) and [enabled](/api/core-scheduler#tag/scheduled-jobs-management/PATCH/v1/scheduler/jobs/{uuid}/enable) again, but its schedule cannot be edited. How much one run does is set at deployment time:

| Environment variable                            | Default | Meaning                                                                                                       |
|-------------------------------------------------|---------|---------------------------------------------------------------------------------------------------------------|
| `CRYPTO_ASSET_PQC_SWEEP_BATCH_SIZE`             | `500`   | How many assets one batch of the sweep re-evaluates and writes                                                |
| `CRYPTO_ASSET_PQC_SWEEP_MAX_BATCHES_PER_SWEEP`  | `20`    | How many batches one run of the sweep writes; the rest waits for the next run. `0` disables the sweep        |

With the defaults a run re-evaluates up to 10 000 assets. A run takes the stale assets in the order of their UUIDs. It evaluates each batch and writes it in one transaction; if that transaction rolls back, it writes the batch's assets one at a time. A write is refused when the asset changed after it was read, or is no longer stale, and the asset is left to the next run. An asset the rules cannot be evaluated against is recorded as `unknown` with the rule id `EVALUATION-FAILED`. That verdict counts as current, so the sweep moves past the asset, and the asset keeps it until something the rules read for it changes.

A run is marked failed in the job history when it stopped before completing, when it recorded any asset as `EVALUATION-FAILED`, or when the write of any asset failed; otherwise it succeeds. Its message counts the assets read and the batches, the verdicts written and how many of them were recorded as `unknown` because the rules could not be evaluated, the writes refused and left for the next run, and those that could not be written. A run the job declines is *skipped*: it leaves no row in the job history and is recorded on the job with the time and reason of the skip — *The sweep is turned off* when `CRYPTO_ASSET_PQC_SWEEP_MAX_BATCHES_PER_SWEEP` is `0`, *Another sweep is already running* when another instance of the platform holds the sweep, and *No stale cryptographic asset to re-evaluate* when there is nothing to do. See [Scheduler](../architecture/scheduler.md).

## Provenance

The **PQC verdict** widget of the asset detail shows the verdict's provenance next to the verdict:

| Field                | API field         | Meaning                                                                                                   |
|----------------------|-------------------|-----------------------------------------------------------------------------------------------------------|
| Rule                 | `ruleId`          | The rule that decided the verdict at the last evaluation; when no rule did, the detail reads *No rule matched, so the rule set default applies* |
| Reason               | `reason`          | The deciding rule's finding                                                                               |
| Decided              | `decidedAt`       | When the current verdict value was decided                                                                |
| Last evaluated       | `evaluatedAt`     | When the verdict was last evaluated; a re-evaluation that confirms the verdict advances this and not **Decided** |
| Fields the rule read | `evaluatedFields` | The values of the asset's fields the deciding rule evaluated, recorded at the last evaluation; for an asset served without a type, `assetType` reads `unroutable`, the internal name of that tier. The producer's `nistQuantumSecurityLevel`, when declared, is included for corroboration but never decides |

For a certificate or protocol whose verdict was carried over from an asset it refers to, the API also serves that asset as `referencedAsset`; see [Certificates and protocols](#certificates-and-protocols). The UI on this release does not show it.

An asset can show the verdict `unknown` with no provenance yet. That is an asset no verdict has landed for yet: the onboarding evaluates every asset it touches, but an evaluation that fails there, like a sweep write that is refused or fails, leaves the asset to a later sweep, and the sweep has not reached it since. The list, the detail and the dashboard show it as `unknown`, but it has no stored verdict, so the **PQC Readiness** filter `unknown` does not match it; its detail reads *Not evaluated yet. The rule set has not reached this asset since it was synced.* If such assets persist, check that the job `CryptoAssetPqcSweepTask` is enabled and that `CRYPTO_ASSET_PQC_SWEEP_MAX_BATCHES_PER_SWEEP` is not `0`. It is different from an asset that was evaluated and found `unknown`, which does carry a provenance with the rule that decided it.

The verdict is also available through the API, in the [Cryptographic asset detail](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/{uuid}), and the on-demand [explanation](#explanation) of a PQC verdict recomputes it rule by rule ([Explain a cryptographic asset's PQC verdict](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/{uuid}/pqcExplanation)).

## Explanation

The on-demand explanation of a PQC verdict, [`GET /v1/cryptoAssets/{uuid}/pqcExplanation`](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/{uuid}/pqcExplanation), recomputes the asset's verdict from what is stored now, rule by rule, and writes nothing back: the asset detail keeps serving the stored verdict. It needs `detail` on `Cryptographic Asset`, and answers 404 for an asset that does not exist. The UI on this release does not show it.

| Field                                                | Meaning                                                                                                    |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `verdict`, `ruleId`, `reason`                        | The recomputed verdict, the rule that decided it and that rule's finding                                   |
| `inputs`                                             | What the rules read, in the order `assetType`, `algorithmFamily`, `parameterSet`, `curve`, `mode`, `padding`, `variant`, `name`, `hybridComponents`, `materialType`, `materialSize`, `nistQuantumSecurityLevel`, `subjectPublicKeyRef`, `signatureAlgorithmRef`, `cipherSuites`, `cipherSuiteAlgorithmRefs`, `unresolvedRefs`. A value the asset does not have is left out, references are served as the bom-refs the document recorded, and no key value or internal deduplication key is ever served |
| `steps`                                              | Every rule the evaluation consults for an asset of this type, in the order of the [rule catalog](#rule-catalog): 5 for a certificate, 4 for a protocol, 19 for an algorithm, 21 for related cryptographic material and 1 for an untyped asset |
| `matchesStored`                                      | Whether the verdict and rule stored on the asset equal the recomputed ones, and are still current          |
| `storedVerdict`, `storedRuleId`, `storedEvaluatedAt` | The stored verdict, its rule and when it was last evaluated; absent when the asset has not been evaluated yet, and `storedRuleId` also when no rule decided the stored verdict |
| `explainedAt`                                        | When the explanation was computed                                                                          |

Each step carries the rule id, its title, its outcome, a message saying why, the verdict on a `decided`, `resolved` or `failed` step, the fields the rule read on every step but a `notReached` one, and `referencedAsset` on a `resolved` step. The rules before the deciding one are `notMatched`, the deciding one is `decided` or `resolved`, and the rules after it are `notReached`. The hybrid rule is listed as `PQC-HYBRID` on a step it does not decide, and under its composed id, such as `PQC-HYBRID-PQC-STANDARDIZED`, on the step it decides.

| Outcome      | Label       | Meaning                                                                                                     |
|--------------|-------------|-------------------------------------------------------------------------------------------------------------|
| `notMatched` | Not matched | The rule's condition did not hold for the asset                                                             |
| `decided`    | Decided     | The rule's condition held and its verdict is the asset's                                                    |
| `notReached` | Not reached | An earlier rule decided, so this rule was not evaluated                                                     |
| `resolved`   | Resolved    | The rule's condition held and the verdict is the one stored on another inventory asset the asset refers to  |
| `failed`     | Failed      | The rule set could not be evaluated against the asset's recorded properties, so no rule decided             |

`matchesStored` is false when the asset has not been evaluated yet, or when something its stored verdict was decided from has changed since: the asset itself, the verdict of an asset it refers to, or the rules after an upgrade. An explanation that disagrees with the stored verdict is therefore not a fault: it shows what the next re-evaluation will store, and the stored verdict is served until then. There is no re-run of the stored verdict for a single asset.

For an asset the rules cannot be evaluated against, the explanation reports what the sweep records: the verdict `unknown` under `EVALUATION-FAILED`, no inputs, and a single `failed` step titled "Evaluation". The values copied from the CBOM document are left out of the inputs and the steps on the same terms as in the asset detail; see [Certificates and protocols](#certificates-and-protocols).

## Rule catalog

The rules in the order an explanation lists them, with the title each step carries. A certificate or protocol is tested only against its own rules; any other asset is tested against the rules served for its type, and the first that applies decides.

| #  | Rule id                       | Title                                             | Verdict                        | Served for                          | Applies when                                                              |
|----|-------------------------------|---------------------------------------------------|--------------------------------|-------------------------------------|---------------------------------------------------------------------------|
| 1  | `CERT-SUBJECT-KEY`            | Certified key                                     | The certified key's            | Certificate                         | The certified key resolved and is no stronger than the signature algorithm |
| 2  | `CERT-SIGNATURE-ALGORITHM`    | Signature algorithm                               | The signature algorithm's      | Certificate                         | The signature algorithm resolved and is weaker than the certified key     |
| 3  | `CERT-REFERENCE-UNRESOLVED`   | Unresolved certificate reference                  | `unknown`                      | Certificate                         | A recorded key or signature algorithm is unresolved                       |
| 4  | `CERT-NO-SIGNATURE-RECORDED`  | No signature algorithm recorded                   | `unknown`                      | Certificate                         | A `ready` key is recorded, but no signature algorithm                     |
| 5  | `CERT-NO-KEY-RECORDED`        | No certified key recorded                         | `unknown`                      | Certificate                         | Any other certificate                                                     |
| 6  | `PROTOCOL-CIPHER-SUITE`       | Cipher suite algorithms                           | The weakest algorithm's        | Protocol                            | The weakest resolved suite algorithm decides                              |
| 7  | `PROTOCOL-SUITE-UNRESOLVED`   | Unresolved cipher suite algorithm                 | `unknown`                      | Protocol                            | A suite algorithm is unresolved                                           |
| 8  | `PROTOCOL-NO-KEY-EXCHANGE`    | No key exchange named                             | `unknown`                      | Protocol                            | Every suite algorithm is `ready`, and none establishes a key              |
| 9  | `PROTOCOL-NO-SUITES`          | No cipher suites recorded                         | `unknown`                      | Protocol                            | Any other protocol                                                        |
| 10 | `ASSET-TYPE-UNROUTABLE`       | Asset type                                        | `notApplicable`                | Untyped                             | The asset has no asset type the platform routes                           |
| 11 | `MATERIAL-NOT-KEY`            | Material that is not a key                        | `notApplicable`                | Related crypto material             | The material is not a key                                                 |
| 12 | `NAME-CIPHER-SUITE`           | Cipher suite name                                 | `notApplicable`                | Algorithm                           | No family resolved, and the name denotes a cipher suite                   |
| 13 | `NAME-NOT-AN-ALGORITHM`       | Non-algorithm name                                | `notApplicable`                | Algorithm                           | No family resolved, and the name denotes something other than an algorithm |
| 14 | `MATERIAL-SYMMETRIC-READY`    | Symmetric key size                                | `ready`                        | Related crypto material             | A symmetric key of at least 128 bits whose name leaves the strength open  |
| 15 | `MATERIAL-SYMMETRIC-WEAK`     | Undersized symmetric key                          | `notReady`                     | Related crypto material             | A symmetric key of 64 to 127 bits whose name carries no `notReady` finding |
| 16 | `MATERIAL-SYMMETRIC-UNSIZED`  | Unsized symmetric key                             | `unknown`                      | Related crypto material             | A symmetric key without a usable size whose name leaves the strength open |
| 17 | `CLASSICAL-LEGACY-COMPONENT`  | Classically broken component                      | `notReady`                     | Algorithm, Related crypto material  | The asset names a classically broken component                            |
| 18 | `PQC-HYBRID`                  | Hybrid construction                               | The post-quantum component's   | Algorithm, Related crypto material  | A [hybrid](#hybrid-schemes); decided under `PQC-HYBRID-PQC-STANDARDIZED`, `PQC-HYBRID-PQC-PRESTANDARD`, `PQC-HYBRID-PQC-BROKEN` or `PQC-HYBRID-PQC-HYBRID-FAMILY` |
| 19 | `PQC-HYBRID-UNRESOLVED`       | Hybrid without a ratified post-quantum component  | `unknown`                      | Algorithm, Related crypto material  | A hybrid whose post-quantum component resolves to no recognized family    |
| 20 | `CLASSICAL-SHOR-COMPONENT`    | Quantum-vulnerable component                      | `notReady`                     | Algorithm, Related crypto material  | The asset names a quantum-vulnerable component                            |
| 21 | `FAMILY-UNRESOLVED`           | Unresolved algorithm family                       | `unknown`                      | Algorithm, Related crypto material  | No recognized family                                                      |
| 22 | `CLASSICAL-SHOR`              | Quantum-vulnerable family                         | `notReady`                     | Algorithm, Related crypto material  | A quantum-vulnerable family, or GOST with an elliptic curve               |
| 23 | `FAMILY-AMBIGUOUS-COMPONENT`  | Ambiguous primitive                               | `unknown`                      | Algorithm, Related crypto material  | A construction built on GOST or RIPEMD                                    |
| 24 | `CONSTRUCTION-UNINSTANTIATED` | Construction without a primitive                  | `unknown`                      | Algorithm, Related crypto material  | A construction that names no primitive                                    |
| 25 | `SYMMETRIC-UNDERSIZED`        | Undersized symmetric primitive                    | `notReady`                     | Algorithm, Related crypto material  | An unbroken symmetric or hash-based primitive of 64 to 127 bits           |
| 26 | `SYMMETRIC-READY`             | Symmetric or hash-based family                    | `ready`                        | Algorithm, Related crypto material  | Any other unbroken symmetric or hash-based family                         |
| 27 | `PQC-ONE-TIME-SIGNATURE`      | One-time signature                                | `unknown`                      | Algorithm, Related crypto material  | A one-time signature of LMS or XMSS on its own                            |
| 28 | `PQC-STANDARDIZED`            | Standardised post-quantum scheme                  | `ready`                        | Algorithm, Related crypto material  | A standardized post-quantum family                                        |
| 29 | `PQC-PRESTANDARD`             | Pre-standard post-quantum scheme                  | `notReady`                     | Algorithm, Related crypto material  | A pre-standard post-quantum family                                        |
| 30 | `PQC-BROKEN`                  | Broken post-quantum candidate                     | `notReady`                     | Algorithm, Related crypto material  | A broken post-quantum family                                              |
| 31 | `PQC-HYBRID-FAMILY`           | Named hybrid family                               | `ready`                        | Algorithm, Related crypto material  | X-Wing, when its name yields no components                                |
| 32 | `CLASSICAL-LEGACY`            | Classically broken family                         | `notReady`                     | Algorithm, Related crypto material  | A classically broken family                                               |
| 33 | `FAMILY-AMBIGUOUS`            | Ambiguous family                                  | `unknown`                      | Algorithm, Related crypto material  | GOST without an elliptic curve, or RIPEMD                                 |
| —  | `EVALUATION-FAILED`           | Evaluation                                        | `unknown`                      | Any type                            | The rules could not be evaluated against the asset; not a rule, so an explanation lists it only as its single failed step |
