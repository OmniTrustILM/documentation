---
sidebar_position: 5
---

# Platform

Platform settings represent general configuration of the platform.

Currently there are following platform settings categories:
- [Util](#util-settings)
- [Certificates](#certificates-settings)
- [Request Attributes](request-attributes.md) — stored in the certificates category
- [Appearance](appearance.md) — logos, brand colors and the default theme, stored in the branding category

## Util settings


| Name                  | Description                            | Required                                             |
|-----------------------|----------------------------------------|------------------------------------------------------|
| **Utils Service URL** | URL of the Utils Service, if available | <span class="badge badge--danger" size="s">NO</span> |
| **CBOM Repository URL** | Base URL of the CBOM Repository, without `/api`, for example `http://cbom-repository:8080`; required for the [CBOM synchronization](../concept-design/core-components/cbom.md#synchronization) | <span class="badge badge--danger" size="s">NO</span> |

### CBOM synchronization

The **Utils** tab also holds the settings of the [CBOM synchronization](../concept-design/core-components/cbom.md#synchronization). Clearing a field returns it to its default value.

| Name                                                                | Description                                                                                                                                                                                                                                                                            | Default Value |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| **CBOM Sync Overlap (seconds)**<br/>`cbomSyncOverlapSeconds`        | How far before the start of the last successful sync run each run lists the CBOM Repository again, from 0 to 86400 seconds                                                                                                                                                             | 60 seconds    |
| **CBOM Sync Retries (runs)**<br/>`cbomSyncSkippedRetryRuns`         | How many later sync runs retry a document that could not be stored before it is permanently skipped, from 0 to 1000; `0` gives it up at the first failure                                                                                                                              | 3 runs        |
| **CBOM Sync Catch-up (documents)**<br/>`cbomSyncMaxIngestDocuments` | The number of `CBOMs` whose assets one sync run adds to the inventory in addition to those of the documents it has just stored, from 0 to 10000. These are `CBOMs` still waiting for their assets, such as uploaded ones. `0` turns this off, and uploaded `CBOMs` then stay `Pending` | 50 documents  |
| **CBOM Sync Skip Retention (days)**<br/>`cbomSyncSkipRetentionDays` | How many days after its last attempt a permanently skipped document stays among the [skipped documents](../concept-design/core-components/cbom.md#skipped-documents), from 1 to 3650; a document still retrying is never removed                                                       | 90 days       |

:::warning
Saving the **Utils** tab returns the values that can be set only through the API, listed below, to their defaults, except `cbomSyncAssetIngestEnabled`. If you have changed them, set them again through the API afterwards.
:::

:::note
The `utils` settings are stored as sent. An [Update platform settings](/api/core-other#tag/settings/PUT/v1/settings/platform) request that leaves a value out returns it to its default, and one that leaves out the **Utils Service URL** or the **CBOM Repository URL** clears that URL; without the CBOM Repository URL, the CBOM synchronization stops. Only `cbomSyncAssetIngestEnabled` keeps its stored value when it is left out. Send the whole `utils` section, as [Get platform settings](/api/core-other#tag/settings/GET/v1/settings/platform) returns it, together with your change.

The following values of the `utils` settings are set through the API:

| API key                           | Description                                                                                                                  | Default Value |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------|---------------|
| `cbomSyncAssetIngestEnabled`      | Turns asset synchronization on or off; while it is off, sync runs still store new `CBOMs` but add no assets to the inventory | `true`        |
| `cbomSyncIngestRetryAfterSeconds` | How long a `CBOM` whose asset synchronization is running or has failed is left alone before it is tried again                | 1800 seconds  |
| `cbomSyncAssetBatchSize`          | How many cryptographic assets are added to or removed from the inventory in one step                                         | 100           |
| `cbomSyncPageSize`                | How many entries the platform reads from the CBOM Repository in one request                                                  | 1000          |
:::

## Certificates Settings

Certificate settings contains configuration of certificate validation behaviour that is applied to all certificates that does not have assigned any RA Profile or does not override these settings. The following options are available:

| Name                     | Description                                                                                   | Default Value |
|--------------------------|-----------------------------------------------------------------------------------------------|---------------|
| **Validation Enabled**   | Enable or disable validation of certificates                                                  | `enabled`     |
| **Validation Frequency** | Validation frequency of certificates specified in days                                        | Everyday      |
| **Expiring Threshold**   | How many days before expiration should validation status of certificates change to `Expiring` | 30 days       |

### Registration

The **Registration** section of the Certificates tab holds the platform defaults for [certificate pre-registration](../quick-start/certificate-management/register-certificate.mdx):

| Name                                | Description                                                                                     | Default Value |
|-------------------------------------|-------------------------------------------------------------------------------------------------|---------------|
| **Default Issuance Window (days)**  | Default issuance window in days, applied to a challenge-protected pre-registration that omits an explicit expiry | 7 days        |
| **Max Failed Attempts**             | Maximum failed challenge-verification attempts before the registration authorization locks     | 5             |

### Upload

The **Upload** section of the Certificates tab holds the setting for certificates that are added by hand, through an upload or a [file import](../quick-start/certificate-management/import-certificates-and-keys.mdx):

| Name                    | Description                                                                          | Default Value |
|-------------------------|--------------------------------------------------------------------------------------|---------------|
| **Automatic Ownership** | Makes the user who uploads a certificate, or imports it from a file, its owner       | `disabled`    |

While it is disabled, an uploaded or imported certificate has no owner until someone assigns one. With **Automatic Ownership** enabled:

- The uploading user becomes the owner of each certificate added by an upload, in the web interface or through the API, and of each certificate a file import creates. A file import also creates the issuer certificates of a chain, and the importing user owns those too. A certificate that an administrator uploads for a user in the user management is owned by that administrator.
- A certificate that is already in the inventory keeps its owner.
- An owner that a trigger of the [Certificate Uploaded event](../concept-design/core-components/workflow/event.md#certificate-uploaded-event) sets takes precedence. A trigger that sets the owner, to a user or to nobody, decides the owner, and automatic ownership leaves the certificate as the trigger left it. Use such a trigger to exclude certain certificates.

:::warning[Owner rights]
An owner has full rights over the certificate, such as updating, archiving and deleting it and switching its RA profile, and can open it without the permission to see other certificates. Enable the setting only when everyone who may upload certificates should have these rights over what they upload.
:::

A change applies to the uploads the platform processes after it. With several `Core` replicas, a replica other than the one that saved the change applies it after its next settings cache refresh, which runs every 30 seconds by default and is set in seconds by the `Core` environment variable `SETTINGS_CACHE_REFRESH_INTERVAL`.
