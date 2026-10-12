---
sidebar_position: 17
---

# Cryptographic Asset Inventory

`Cryptographic Asset Inventory` consists of all cryptographic assets declared by the [`CBOMs`](../core-components/cbom.md) synchronized into the platform: the algorithms, certificates, protocols and keys that the scanned systems use. Each asset carries a [post-quantum readiness](../architecture/post-quantum-readiness.md) verdict. In the main menu it is **Crypto Assets**, below **CBOMs**; the item of the same name under **Dashboard** opens the [cryptographic asset dashboard](dashboards.md#cryptographic-asset-dashboard).

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

| Type                      | Description                                                                 | Properties filled                                                                                  |
|---------------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `Algorithm`               | A cryptographic algorithm, such as `aes-256-gcm`, `sha-256` or `ml-kem-768` | Algorithm family, primitive, parameter set, elliptic curve, mode, padding and variant              |
| `Certificate`             | A certificate, such as a server or CA certificate                           | Algorithm family, primitive, parameter set and elliptic curve of the key it certifies              |
| `Protocol`                | A protocol at an endpoint, such as TLS 1.3 on a server port                 | None; a protocol is known by its name and OIDs, and its cipher suites are in its crypto properties |
| `Related crypto material` | A key, or other material such as a password, a salt or a token              | Its size as parameter set, and the algorithm family, primitive and elliptic curve of its algorithm |

A component of type `cryptographic-asset` without `cryptoProperties`, which CycloneDX allows, has no asset type and is shown as `Untyped`, with the verdict `Not applicable`. Some views name its type `Unroutable` or `cryptographic-asset`, and the **Asset Type** filter and the dashboard leave it out; the **PQC Readiness** filter `Not applicable` finds it.

The same asset declared by several `CBOMs` is one entry of the inventory, for example a CA certificate found by three scans, or `sha-256` used by ten applications. The **Source CBOMs** column counts the `CBOMs` that declare the asset, and **Occurrences** how many times they report it in all. Asset names and the properties listed above are stored in lower case, so `AES-256` reads `aes-256` in the list and in the **Identity** widget; the crypto properties and the **PQC readiness** tab keep the spelling of the `CBOM`.

## Asset details

The detail of an asset shows the following widgets:

| Widget                   | Tab               | Content                                                                                                                                                                                                                                                                   |
|--------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity                 | **Details**       | The asset type, the seven properties listed for `Algorithm` above, each `-` when empty, and the OIDs. A **Quarantined** badge marks an asset whose sources make contradicting claims about it, and a struck-through **Refuted** OID one that does not describe the asset. |
| PQC readiness            | **Details**       | The **Verdict**, the **Rule** that decided it and the **Reason**, and when it was **Decided**. For a certificate or protocol, **Decided by** links the asset its verdict was taken from.                                                                                  |
| Source CBOMs             | **Details**       | Every `CBOM` that declares the asset, with its **Serial number**, **Version**, **Producer**, which is the **Source** of the `CBOM`, and the number of **Locations** it recorded, under a line counting the `CBOMs` and occurrences.                                       |
| Crypto properties        | **Details**       | The **Properties in use**, taken whole from the source `CBOM` with the most detail, side by side with the properties another source recorded. When there are several sources, the one in use is marked **In use** under **Source CBOMs**.                                 |
| PQC readiness evaluation | **PQC readiness** | Every rule the asset was tested against, with its outcome, see [Reading the explanation](../architecture/post-quantum-readiness.md#reading-the-explanation).                                                                                                              |
| Evaluated properties     | **PQC readiness** | The properties the rules read for the asset.                                                                                                                                                                                                                              |

A source `CBOM` the viewer may not list is not shown; the line above the sources counts it as a document outside the viewer's access.

## Searching and filtering

The **Crypto Assets Filter** offers **Text Search**, which matches the name or the OID ignoring case, and a filter for **Name**, **Asset Type**, **OID**, **PQC Readiness** and each property listed above, such as **Algorithm Family**; filters can be combined. The following filters are less obvious:

| Filter                    | Matches                                                                                                                                                                 |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| OID Refuted               | Whether the OID of the asset is refuted; the **OID** filter matches a refuted OID only together with this one                                                           |
| Source CBOMs              | The number of `CBOMs` that declare the asset                                                                                                                            |
| Source CBOM               | A `CBOM` that declares the asset, by serial number; **View the assets of this CBOM in the crypto asset inventory** on the `CBOM` detail opens the list with this filter |
| Identity Rule Set Version | Which generation of the platform's rules for recognizing the same asset across `CBOMs` produced the entry                                                               |

## Columns and views

The list shows the columns **Name**, **Type**, **PQC readiness**, **Source CBOMs** and **Occurrences**, and can be sorted by each of them except **Occurrences**. **Add column** shows or hides these columns; the other properties are filters only. After a change, **Save as view…** keeps the filters, sorting and columns as a named view.

## Post-quantum readiness

Each asset carries one of the verdicts `PQC ready`, `Not PQC ready`, `Not applicable` or `Unknown`, shown in the **PQC readiness** column. The verdict is decided by rules shipped with the platform; [Post-Quantum Readiness](../architecture/post-quantum-readiness.md) describes what each verdict means and how it is decided. The [cryptographic asset dashboard](dashboards.md#cryptographic-asset-dashboard) shows how the verdicts are spread across the inventory.

## Asset synchronization

An asset enters the inventory when a sync run adds the assets of a `CBOM` that declares it. It leaves the inventory when no `CBOM` declares it any longer, for example after its `CBOM` is deleted or replaced by a newer version, see [Versions and deletion](../core-components/cbom.md#versions-and-deletion). How far the assets of a `CBOM` have come is its asset sync state, shown on the CBOM list, see [Asset sync states](../core-components/cbom.md#asset-sync-states). The detail of an asset that has left the inventory reads *This cryptographic asset is not in the inventory.*
