---
sidebar_position: 16
---

# Cryptographic Asset Inventory

The `Cryptographic Asset Inventory` holds every cryptographic asset declared by the [CBOM](../core-components/cbom.md) documents the platform has synchronized — the algorithms, certificates, protocols and related cryptographic material an estate uses. An asset declared by several documents is one entry of the inventory, which records every document that declares it.

In the UI it is the **Crypto Assets** list. The inventory is filled by the CBOM [synchronization](../core-components/cbom.md#synchronization) and follows it: an asset appears when a document declaring it is onboarded, and disappears when no document declares it any longer. Assets cannot be created, edited or deleted directly. Each asset carries a [post-quantum readiness](post-quantum-readiness.md) verdict.

## Cryptographic asset

A CBOM document lists its cryptographic assets as components. The platform reads the document's `components`, including nested ones, and turns into an asset every component of type `cryptographic-asset` and every component carrying `cryptoProperties`. The component the document describes (`metadata.component`) and the document's `services` are not turned into assets, although their `bom-ref` values count toward the uniqueness check that can [refuse a document](../core-components/cbom.md#refused-documents).

The asset type comes from the component's `cryptoProperties.assetType`:

| Asset type                | CycloneDX `assetType`     | What the platform stores                                                                                               |
|---------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------------|
| `Algorithm`               | `algorithm`               | Name and OID, and the normalized fields: algorithm family, primitive, parameter set, elliptic curve, mode, padding, variant |
| `Certificate`             | `certificate`             | Name and OID                                                                                                           |
| `Protocol`                | `protocol`                | Name and OID                                                                                                           |
| `Related crypto material` | `related-crypto-material` | Name and OID                                                                                                           |
| `Unroutable`              | anything else, or missing | Name and OID; a component typed `cryptographic-asset` or carrying `cryptoProperties` whose `assetType` is missing or none of the four above, case and separators ignored |

Only algorithms carry normalized fields; for the other types the full detail is in the asset's payload. Names and normalized values are stored in lower case, so `AES-256` is shown as `aes-256`. An asset's fields come from the first document that supplied them; a later document only fills a field that is still empty.

Besides its fields, each asset keeps the `cryptoProperties` of the documents that declare it, as recorded by each of them. The most detailed of these is served as the asset's **elected payload**.

A component that cannot be turned into an asset — for example because its name is longer than 1024 characters — is left out, and the rest of the document is onboarded. An OID longer than 255 characters fails the onboarding of the whole document instead, and the catch-up tries it again at every retry window; the fix is a corrected document, published as a new version. A document the platform cannot read safely as a whole is refused; see [Refused documents](../core-components/cbom.md#refused-documents).

## Recognizing one asset across CBOMs

Two documents that declare the same algorithm, certificate, protocol or key declare one asset. The platform recognizes it by an identity key computed from the component's cryptographic properties and, where those are too sparse, from its name and where it occurs — never from references internal to a document, such as its `bom-ref`. The identity key is internal and never shown.

What identifies an asset depends on its type. The platform uses the strongest identifying properties the component carries, in this order:

| Asset type                | Recognized by                                                                                                                                                                                    |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Algorithm`               | Its algorithm family together with parameter set, elliptic curve, mode, padding and variant; without a family, its normalized name with the same fields; otherwise a digest of its properties |
| `Certificate`             | Its fingerprint (v1.7) or a component hash, preferring SHA-256, then SHA-384, SHA-512 and SHA-1; otherwise its serial number and issuer; otherwise its subject, issuer, validity and the public key it certifies; otherwise its subject, validity, name and where it occurs; otherwise its name and a digest of its properties |
| `Protocol`                | Its type, version and cipher suites, together with any posture marker (CNSA, PQC, FIPS, Suite B) or port in its name; with less recorded, its type and version, its name, or where it occurs; without a type, a digest of its properties and its name |
| `Related crypto material` | Its fingerprint; otherwise a digest of its value; otherwise its identifier; otherwise its type, name and where it occurs; otherwise a digest of its properties                                 |
| `Unroutable`              | Its declared asset type, a digest of its properties and its name                                                                                                                                 |

Before the key is computed the properties are normalized, which is what lets documents written by different producers, and in either CycloneDX version, meet on one asset:

- **Algorithm families and elliptic curves** are normalized onto the [CycloneDX 1.7 cryptography registry](../core-components/cbom.md#specification-versions); the names of one curve — `P-256`, `secp256r1`, `prime256v1` — are one curve.
- **Protocol versions and cipher suites** are normalized — `TLSv1.3` is version `1.3`, and a cipher suite is compared by its IANA code, or by its name when the code cannot be read or the document contradicts it.
- **OIDs** are normalized to their dotted form. The OID itself is not part of the identity, but what a trusted OID resolves to — family, parameter set, curve, mode — can be. For an algorithm, the platform checks a declared OID against the registry; an OID that contradicts the algorithm's family is marked **Refuted**, contributes nothing to the asset, and is left out of searches unless the **OID Refuted** filter asks for it.

Components with the same identity within one document are one asset with one source, their occurrences combined.

A few rules keep apart what a looser reading would merge. A certificate digest — fingerprint or component hash — that the document itself contradicts, because certificates claiming it disagree on subject, issuer, serial number or validity, is not used; the certificate is recognized by its other properties and marked **Quarantined**. Related cryptographic material that declares neither a fingerprint, a value nor an identifier is recognized by where it occurs, so the same key reported at two locations is two assets.

Each asset records the version of the identity rules it was recognized under. It is not displayed, but the **Identity Rule Set Version** filter matches on it. A release that changes the rules does not recognize existing assets anew; that filter finds the assets recognized under earlier rules.

:::info[Key material is never stored]
Every value of related cryptographic material — a private key, a secret key, a public key — is replaced by its length before anything is stored. A digest of the value is used to recognize the asset and is itself neither stored nor served. Of the related material's properties, only the members the CycloneDX schema defines, in the shape it defines, are kept, and a fingerprint is also dropped for material whose type is not known to be high-entropy.
:::

## Sources and occurrence evidence

Each document that declares an asset is one of its sources. A source is one version of one CBOM, so the asset's **Source CBOMs** count is the number of CBOM versions that currently declare it; after [supersede](../core-components/cbom.md#supersede-of-earlier-versions) that is the newest onboarded version of each serial number.

For each source the platform keeps:

- the serial number and version of the CBOM, and its source (`metadata.component.name`);
- how many times the document reports the asset occurring — the true total, shown as the asset's **Occurrences** summed over its sources;
- a sample of the occurrence evidence, from the component's `evidence.occurrences`: the first 50 occurrences, trimmed further if they exceed 64 KiB, each with its location, line, offset and symbol. From each location user information, query and fragment are removed and the location is cut to 1024 characters; `additionalContext` is never kept;
- the component's `cryptoProperties` as that document recorded them, with key material redacted.

The asset detail lists up to 100 sources, oldest first, and only sources from CBOMs the viewer is allowed to list; a source can be opened to show its evidence and compared with the elected payload. The **Source CBOMs** and **Occurrences** counts on the list and the detail count every source, whether or not the viewer can list its CBOM.

## Supersede and deletion

An asset changes when the documents that declare it change:

- When a newer version of a CBOM is onboarded, the earlier version stops being a source of its assets — see [Supersede of earlier versions](../core-components/cbom.md#supersede-of-earlier-versions).
- When a CBOM is deleted in the platform, it stops being a source of its assets — see [Deletion and tombstones](../core-components/cbom.md#deletion-and-tombstones).
- An asset left with no source is removed from the inventory. If a later document declares it again, it returns as a new entry with a new UUID.
- An asset that other documents still declare stays, and its elected payload is chosen again from the remaining sources.

## Asset sync states

An asset has no sync state of its own; the state belongs to the CBOM record whose assets are being onboarded — `Pending`, `In progress`, `Synced` or `Failed`, described in [Asset sync states](../core-components/cbom.md#asset-sync-states). The inventory is complete for a document once its state is `Synced`, unless the version has been superseded since. While a document is being onboarded, part of its assets may already be listed.

The [cryptographic asset dashboard](dashboards.md#cryptographic-asset-dashboard) shows how many CBOM documents are in each state, and the latest **Assets Synced At** among them.

## Searching and filtering

The inventory list can be filtered by the following fields. Filters combine. The value lists offered for the normalized fields are the values the inventory holds; **Asset Type** and **PQC Readiness** offer every value.

| Filter                    | Matches                                                                                                                  |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Text Search               | Text contained in the name or the OID, ignoring case                                                                     |
| Asset Type                | The asset type                                                                                                           |
| Name                      | The asset name                                                                                                           |
| OID                       | The OID; a refuted OID matches only together with **OID Refuted**                                                       |
| OID Refuted               | Whether the OID is refuted                                                                                               |
| Algorithm Family          | The normalized algorithm family                                                                                          |
| Primitive                 | The normalized primitive                                                                                                 |
| Parameter Set             | The normalized parameter set, for example a key size                                                                     |
| Elliptic Curve            | The normalized elliptic curve; an asset combining several curves matches each of them                                    |
| Mode                      | The normalized mode of operation                                                                                         |
| Padding                   | The normalized padding scheme                                                                                            |
| Variant                   | The normalized variant                                                                                                   |
| PQC Readiness             | The [post-quantum readiness](post-quantum-readiness.md#verdicts) verdict; an asset not evaluated yet is shown as `unknown` but has no stored verdict, so `unknown` does not match it |
| PQC Rule Set Version      | The version of the PQC rule set that produced the verdict                                                                |
| Identity Rule Set Version | The version of the identity rules the asset was recognized under                                                         |
| Source CBOMs              | The number of sources                                                                                                    |
| Source CBOM               | The serial number of a CBOM that is a source; the values offered are the serial numbers of the CBOMs the viewer can list |

The list is ordered by name — the OID for an asset without a name — then by UUID; a request for any other order is rejected. A page holds at most 1000 assets.

## Asset detail

The detail of an asset shows:

| Section        | Content                                                                                                                                                   |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Summary        | Asset type, PQC readiness, the **Quarantined** mark when it applies, and how many CBOMs and occurrences declare the asset                                |
| Identity       | The normalized fields and the OIDs, a refuted OID struck through                                                                                          |
| PQC verdict    | The verdict and its provenance — rule set, deciding rule, reason, the fields the rule read, when it was decided and last evaluated; see [Provenance](post-quantum-readiness.md#provenance) |
| Source CBOMs   | The sources with serial number, version, producer (the CBOM's **Source**), occurrences and evidence, each linking to its CBOM                            |
| Payloads       | The elected payload, and the payload a chosen source recorded, with the paths where they differ. The elected payload is shown only when the viewer can list the CBOM it was taken from |

## Permissions

Listing, searching and the dashboard require the `list` action, and the asset detail the `detail` action, on the `Cryptographic Asset` resource. Permissions on individual assets narrow the list, the detail and the dashboard counts. What the detail shows of an asset's sources also depends on the `CBOM` resource. See [CBOM and cryptographic asset permissions](../architecture/access-control/roles-permissions.md#cbom-and-cryptographic-asset-permissions).

## Inventory API

The inventory is read through the [Cryptographic Asset Inventory API](/api/core-cbom#tag/cryptographic-asset-inventory): [List cryptographic assets](/api/core-cbom#tag/cryptographic-asset-inventory/POST/v1/cryptoAssets), [Cryptographic asset detail](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/{uuid}) and [the searchable fields](/api/core-cbom#tag/cryptographic-asset-inventory/GET/v1/cryptoAssets/search).
