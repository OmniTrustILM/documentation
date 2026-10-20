---
sidebar_position: 17
---

# Cryptographic Asset Inventory

`Cryptographic Asset Inventory` consists of all cryptographic assets declared by the [`CBOMs`](../core-components/cbom.md) synchronized into the platform: the algorithms, certificates, protocols and keys that the scanned systems use. Each asset carries a [post-quantum readiness](../architecture/post-quantum-readiness.md) verdict.

An asset comes and goes with the `CBOMs` that declare it and cannot be created or deleted directly. Its type and properties are read from the `CBOMs` and cannot be edited, but custom attributes assigned to the `Cryptographic Asset` resource can be set on it, see [Custom Attributes](../../settings/custom-attributes.md). Access to the inventory is granted through the **Crypto Assets** resource of a role, see [Roles and Permissions](../architecture/access-control/roles-permissions.md).

## Inventory operations

The platform offers the following list of operations from the Cryptographic Asset Inventory:

| Operation                  | Description                                                                                                                              |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| List `Crypto Assets`       | List, search and filter the assets, see [Searching and filtering](#searching-and-filtering)                                              |
| View `Crypto Asset` detail | Show an asset with its verdict and the `CBOMs` that declare it, see [Asset details](#asset-details)                                      |
| Explain the verdict        | Show how the rules decided the verdict, see [Reading the explanation](../architecture/post-quantum-readiness.md#reading-the-explanation) |
| Edit custom attributes     | Set the custom attributes of an asset                                                                                                    |

The inventory is also available through the [Cryptographic Asset Inventory API](/api/core-cbom#tag/cryptographic-asset-inventory).

## Cryptographic asset

Each asset has one of the following types:

| Type                      | Description                                                                 | Properties                                                                                         |
|---------------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `Algorithm`               | A cryptographic algorithm, such as `aes-256-gcm`, `sha-256` or `ml-kem-768` | Algorithm family, primitive, parameter set, elliptic curve, mode, padding and variant              |
| `Certificate`             | A certificate, such as a server or CA certificate                           | Algorithm family, primitive, parameter set and elliptic curve of the key it certifies              |
| `Protocol`                | A protocol at an endpoint, such as TLS 1.3 on a server port                 | None; a protocol is known by its name and OIDs, and its cipher suites are in its crypto properties |
| `Related crypto material` | A key, or other material such as a password, a salt or a token              | Its size as parameter set, and the algorithm family, primitive and elliptic curve of its algorithm |

A component that declares no asset type is not added to the inventory.

The same asset declared by several `CBOMs` is one entry of the inventory, for example a CA certificate found by three scans, or `sha-256` used by ten applications, and the entry counts the `CBOMs` that declare it. Asset names and the properties above are stored in lower case, so `AES-256` is listed as `aes-256`. An asset whose sources make contradicting claims about it is quarantined, and an OID that the platform determined does not describe the asset is marked as refuted.

## Asset details

The detail of an asset shows its type, properties and OIDs, its verdict with the rule and the reason that decided it, and its custom attributes. It lists the `CBOMs` that declare the asset, with the locations where each of them found it, and shows the crypto properties in use, taken from the source `CBOM` with the most detail, beside those that another source recorded. A source `CBOM` the viewer has no access to is counted but not shown.

## Searching and filtering

The inventory can be searched by name or OID, and filtered by the properties above, the verdict, the number of source `CBOMs`, a source `CBOM` and custom attributes.

## Columns and views

The columns, sorting and saved views of the list are described in [Columns and Views](../architecture/columns-and-views.md).

## Post-quantum readiness

Each asset carries one of the verdicts `PQC ready`, `Not PQC ready`, `Not applicable` or `Unknown`. [Post-Quantum Readiness](../architecture/post-quantum-readiness.md) describes what each verdict means and how it is decided, and the [cryptographic asset dashboard](dashboards.md#cryptographic-asset-dashboard) shows how the verdicts are spread across the inventory.

When the verdict of an asset becomes `Not PQC ready`, the platform raises the **Cryptographic asset not PQC ready** event, which triggers and notifications can act on, see [Events](../core-components/workflow/event.md). The event is raised when an asset first receives the verdict, and again only when the verdict returns to `Not PQC ready` from another decided verdict. An `Unknown` verdict in between does not count, and a repeated `Not PQC ready` raises no new event.

## Asset synchronization

An asset enters the inventory when a sync run adds the assets of a `CBOM` that declares it. It leaves the inventory when no `CBOM` declares it any longer, for example after its `CBOM` is deleted or replaced by a newer version, see [Versions and deletion](../core-components/cbom.md#versions-and-deletion). How far the assets of a `CBOM` have come is its [asset sync state](../core-components/cbom.md#asset-sync-states).
