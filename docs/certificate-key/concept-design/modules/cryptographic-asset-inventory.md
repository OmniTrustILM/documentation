---
sidebar_position: 17
---

# Cryptographic Asset Inventory

`Cryptographic Asset Inventory` consists of all cryptographic assets declared by the [`CBOMs`](../core-components/cbom.md) synchronized into the platform: the algorithms, certificates, protocols and keys that the scanned systems use. Each asset carries a [post-quantum readiness](../architecture/post-quantum-readiness.md) verdict. In the menu it is **Crypto Assets**.

The inventory is read-only and follows the `CBOMs`: an asset cannot be created, edited or deleted directly, and it comes and goes with the `CBOMs` that declare it. A role needs the **Crypto Assets** resource to see the inventory. See [Roles and Permissions](../architecture/access-control/roles-permissions.md).

## Inventory operations

The platform offers the following list of operations from the Cryptographic Asset Inventory:

| Operation                  | Description                                                                                                           |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| List `Crypto Assets`       | List, search and filter the assets, see [Searching and filtering](#searching-and-filtering).                          |
| View `Crypto Asset` detail | The name of an asset opens its detail, with the tabs **Details** and **PQC readiness**.                               |
| Show locations             | **Show** next to a source `CBOM` lists where that `CBOM` found the asset.                                             |
| Compare sources            | **Compare with source** shows where a `CBOM` recorded the asset differently from the properties in use.               |
| Explain the verdict        | The **PQC readiness** tab shows how the rules decided the post-quantum readiness verdict, rule by rule.               |
| Open a source `CBOM`       | The serial number of a source opens the `CBOM` that declares the asset.                                               |

The inventory is also available through the [Cryptographic Asset Inventory API](/api/core-cbom#tag/cryptographic-asset-inventory).

## Cryptographic asset

Each asset has one of the following types, shown in the **Type** column:

| Type                      | Description                                                                 | Properties shown                                                                                    |
|---------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| `Algorithm`               | A cryptographic algorithm, such as `aes-256-gcm`, `sha-256` or `ml-kem-768` | Algorithm family, primitive, parameter set, elliptic curve, mode, padding and variant               |
| `Certificate`             | A certificate, such as a server or CA certificate                           | Algorithm family, primitive, parameter set and elliptic curve of the key it certifies               |
| `Protocol`                | A protocol at an endpoint, such as TLS 1.3 on a server port                 | Its name and OIDs; its cipher suites are in its crypto properties                                   |
| `Related crypto material` | A key, or other material such as a password, a salt or a token             | Its size as parameter set, and the algorithm family, primitive and elliptic curve of its algorithm |

A component the document declares as a cryptographic asset without naming its type is shown as `Untyped`.

The same asset declared by several `CBOMs` is one entry of the inventory, for example a CA certificate found by three scans, or `sha-256` used by ten applications. The **Source CBOMs** column counts the `CBOMs` that declare the asset, and **Occurrences** how many times they report it in all. A newer version of a `CBOM` takes the place of the earlier one, see [Versions and deletion](../core-components/cbom.md#versions-and-deletion). Asset names and the properties listed above are shown in lower case, as the platform stores them, so `AES-256` reads `aes-256`.

## Asset details

The detail of an asset shows the following widgets:

| Widget                   | Tab               | Content                                                                                                                                                                                                                       |
|--------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity                 | **Details**       | The asset type, the properties listed above and the OIDs. A **Quarantined** badge marks an asset whose sources make contradicting claims about it, and a struck-through **Refuted** OID one that does not describe the asset. |
| PQC readiness            | **Details**       | The **Verdict**, the **Rule** that decided it and the **Reason**, and when it was **Decided**. For a certificate or protocol, **Decided by** links the asset its verdict was taken from.                                      |
| Source CBOMs             | **Details**       | Every `CBOM` that declares the asset, with its **Serial number**, **Version**, **Producer** and the number of **Locations** it recorded, under a line counting the `CBOMs` and occurrences.                                  |
| Crypto properties        | **Details**       | The **Properties in use**, taken whole from the source `CBOM` with the most detail and marked **In use** under **Source CBOMs**, side by side with the properties another source recorded.                                  |
| PQC readiness evaluation | **PQC readiness** | Every rule the asset was tested against, with its outcome, see [Reading the explanation](../architecture/post-quantum-readiness.md#reading-the-explanation).                                                                |
| Evaluated properties     | **PQC readiness** | The properties the rules read for the asset.                                                                                                                                                                                  |

A source `CBOM` the viewer may not list is not shown; the line above the sources counts it as a document outside the viewer's access.

## Searching and filtering

The **Crypto Assets Filter** offers the following filter fields, which can be combined:

| Filter                                                                                       | Matches                                                                                                                                               |
|----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Text Search                                                                                  | Text in the name or the OID, ignoring case                                                                                                            |
| Name                                                                                         | The name of the asset                                                                                                                                 |
| Asset Type                                                                                   | The type of the asset                                                                                                                                 |
| OID                                                                                          | The OID of the asset; a refuted OID is matched only together with **OID Refuted**                                                                     |
| OID Refuted                                                                                  | Whether the OID of the asset is refuted                                                                                                               |
| Algorithm Family, Primitive, Parameter Set, Elliptic Curve, Mode, Padding, Variant           | The property of that name, chosen from the values the inventory holds                                                                                 |
| PQC Readiness                                                                                | The post-quantum readiness verdict                                                                                                                    |
| Source CBOMs                                                                                 | The number of `CBOMs` that declare the asset                                                                                                          |
| Source CBOM                                                                                  | A `CBOM` that declares the asset, by serial number; **View the assets of this CBOM in the crypto asset inventory** on the `CBOM` detail opens the list with this filter |
| Identity Rule Set Version                                                                    | The version of the rules by which the platform recognized the asset as one entry                                                                      |

## Columns and views

The list shows the columns **Name**, **Type**, **PQC readiness**, **Source CBOMs** and **Occurrences**, and can be sorted by each of them except **Occurrences**. **Add column** shows or hides these columns; the other properties are filters only. Saved views work as on the other lists of the platform.

## Post-quantum readiness

Each asset carries one of the following verdicts, shown in the **PQC readiness** column:

| Verdict          | Description                                                                                          |
|------------------|------------------------------------------------------------------------------------------------------|
| `PQC ready`      | The asset withstands a cryptographically relevant quantum computer.                                  |
| `Not PQC ready`  | The asset needs migration: a quantum computer breaks it, or it is broken, undersized or not standardized. |
| `Not applicable` | Post-quantum migration does not apply to the asset, for example a password or a salt.               |
| `Unknown`        | The rules cannot decide from what the `CBOMs` record, or the asset has not been evaluated yet.       |

The verdict is decided by rules shipped with the platform, described in [Post-Quantum Readiness](../architecture/post-quantum-readiness.md). The **PQC readiness** widget of the asset detail shows which rule decided and why, and the **PQC readiness** tab walks through every rule the asset was tested against. The [cryptographic asset dashboard](dashboards.md#cryptographic-asset-dashboard) shows how the verdicts are spread across the inventory.

## Asset synchronization

An asset enters the inventory when a sync run adds the assets of a `CBOM` that declares it, and leaves it when no `CBOM` declares it any longer, for example after its `CBOM` is deleted or replaced by a newer version. How far the assets of a `CBOM` have come is its asset sync state, shown on the CBOM list, see [Asset sync states](../core-components/cbom.md#asset-sync-states). The detail of an asset that has left the inventory reads *This cryptographic asset is not in the inventory.*
