---
sidebar_position: 7
---

# Dashboards

The `Dashboard` displays the summary of resources managed by the platform. It provides a comprehensive visual dashboard providing quick information about the current inventory state.

## Certificate dashboard

Certificate dashboard offers the following visualizations:

| Chart                         | Description                                                        |
|-------------------------------|--------------------------------------------------------------------|
| Number of `Certificates`      | The total number of `Certificates` managed by the platform.        |
| Number of `Groups`            | The total number of `Groups` managed by the platform.              |
| Number of `Discoveries`       | The total number of `Discoveries` managed by the platform.         |
| Number of `RA Profiles`       | The total number of `RA Profiles` managed by the platform.         |
| `Certificate` By Status       | Distribution of certificates by validation status.                 |
| `Certificate` By `Group`      | Distribution of certificates Group.                                |
| `Certificate` By `RA Profile` | Distribution of certificates by RA Profile.                        |
| `Certificate` Types           | Distribution of certificates by the certificate type (i.e. X.509). |
| `Certificate` Expiry In Days  | Distribution of certificates by expiration days.                   |
| Key Size                      | Distribution of the certificates by its public key size.           |
| Constraints                   | Distribution of certificates by constraint attribute.              |

## Secret dashboard

Secret dashboard offers the following visualizations:

| Chart                                    | Description                                                             |
|------------------------------------------|-------------------------------------------------------------------------|
| Number of `Secrets`                      | The total number of `Secrets` managed by the platform.                  |
| Number of `Vault Instances`              | The total number of `Vault Instances` managed by the platform.          |
| Number of `Vault Profiles`               | The total number of `Vault Profiles` managed by the platform.           |
| `Secret` By Type                         | Distribution of secrets by secret type.                                 |
| `Secret` By State                        | Distribution of secrets by state.                                       |
| `Secret` By Compliance Status            | Distribution of secrets by compliance status.                           |
| `Secret` By `Vault Profile`              | Distribution of secrets by Vault Profile.                               |
| `Secret` By `Group`                      | Distribution of secrets by Group.                                       |

## Cryptographic asset dashboard

Cryptographic asset dashboard shows the cryptographic posture of the estate, drawn from the [cryptographic asset inventory](cryptographic-asset-inventory.md). It is under **Dashboard** → **Crypto Assets** in the menu, offered to a viewer who has the `list` action on the `Cryptographic Asset` resource. It offers the following visualizations, in the order it shows them:

| Chart                             | Description                                                                                                                                                                                                |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Source CBOMs                      | The number of CBOM versions that currently contribute at least one asset to the inventory, captioned *contributing at least one asset*. Its title opens the CBOM list filtered on **Has Contributed Assets** set to true. |
| Crypto Assets                     | The total number of cryptographic assets in the inventory, deduplicated across the CBOMs that declare them, captioned with the number of source CBOMs, for example *deduplicated across 37 CBOMs*. Its title opens the inventory without a filter, on the view it normally opens on: the viewer's pinned view, or **Standard** when none is pinned. |
| Not PQC ready                     | The number of assets whose [post-quantum readiness](post-quantum-readiness.md) verdict is `Not PQC ready`, captioned with their share of the estate, for example *47.5% of the estate*; the caption is left out while the count is 0. Its title opens the inventory filtered on that verdict. |
| Algorithm families                | The number of distinct algorithm families in the inventory, captioned with how many assets carry none, for example *3,010 assets carry none*. While any asset carries none, the caption is a link that opens the inventory filtered on assets with no **Algorithm Family**. |
| Inventory coverage                | How many CBOM documents have their assets synced into the inventory, out of all, for example *Synced 12 of 37 CBOM documents*, followed by the number in each [asset sync state](../core-components/cbom.md#asset-sync-states) — `Pending`, `In progress`, `Synced` and `Failed` — each a link that opens the CBOM list filtered on that **Asset Sync State**. The caption *Latest successful asset sync* gives the latest **Assets Synced At** among them. While not every document is synced, the counts are partial and the panel warns *Coverage is incomplete; asset counts may change as remaining CBOMs sync.*; a document [refused](../core-components/cbom.md#refused-documents) for its content stays `Failed` until its record is deleted. With no CBOM document at all, the panel reads *The asset counts are empty until a CBOM document has been synced into the inventory.* |
| Assets by Type                    | Distribution of assets by asset type. Its legend opens the inventory filtered on a type. An untyped asset, one whose CBOM declares no CycloneDX asset type, is counted in **Crypto Assets** but is not in this chart; the API serves the number of untyped assets as `untypedAssetCount`, which the dashboard does not show. |
| Assets by PQC Readiness           | Distribution of assets by post-quantum readiness verdict; an asset not evaluated yet counts as `Unknown`, but is not in the list the `Unknown` legend opens until it has been evaluated. Its legend opens the inventory filtered on a verdict. |
| Assets by Algorithm Family        | The ten algorithm families with the most assets; an asset with no algorithm family is not in it. A bar or its label opens the inventory filtered on its family. The number of further families is shown below the chart, for example *+4 more*. |

A click-through that filters a list opens that list on its **Standard** tab with the dashboard's filter applied, even when the viewer has pinned another view. The filter is not stored in any view: the list reads *Filtered from the Dashboard — Standard cannot hold these filters* and offers **Revert**, which drops the filter, and **Save as view…**, which keeps it as a new view. A drill-down never changes a saved or pinned view. The filter stays while the viewer opens items of that list and comes back, and is dropped once they leave the list; a link opened in a new tab carries no filter.

Every asset count is of deduplicated assets, and every count covers only what the viewer is allowed to list: the assets need the `list` action on the `Cryptographic Asset` resource, and the inventory coverage and the number of source CBOMs the `list` action on the `CBOM` resource. Without that action the platform does not report them: the **Source CBOMs** tile shows a lock reading *Count is not available* and *You do not have permission to view the Source CBOM count.*, the inventory coverage reads *CBOM inventory coverage is not available with your permissions.*, and **Crypto Assets** loses its *deduplicated across …* caption; the asset counts and charts are unaffected. The statistics are also available through the API, as [Get Cryptographic Asset Inventory dashboard statistics](/api/core-other#tag/statisticsdashboard/GET/v1/statistics/cryptoAssets).
