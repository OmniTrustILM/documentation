---
sidebar_position: 5
---

# Platform

Platform settings represent general configuration of the platform.

Currently there are following platform settings categories:
- [Util](#util-settings)
- [Certificates](#certificates-settings)
- [Request Attributes](request-attributes.md) — stored in the certificates category

## Util settings


| Name                  | Description                            | Required                                             |
|-----------------------|----------------------------------------|------------------------------------------------------|
| **Utils Service URL** | URL of the Utils Service, if available | <span class="badge badge--danger" size="s">NO</span> |
| **CBOM repository URL** | URL of the CBOM repository | <span class="badge badge--danger" size="s">NO</span> |

### CBOM sync policy

The three values below are the part of the CBOM sync configuration an operator owns; the rest is set at deployment time. Leave a field empty to use the platform default; the platform reports that default back, so the settings page shows what the sync uses. Clear a field to return it to the default. A sync run uses the values it had at its start: on the node that saved the change it applies from the next run, and other nodes pick it up when their settings cache refreshes, every 30 seconds by default.

| Name                                | Description                                                                                                                                                                                                                   | Range      | Default |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| **CBOM Sync Overlap (seconds)**     | How far before the start of the last successful sync run each run re-lists the CBOM repository; it should cover the clock skew between the platform and the repository's object store plus the longest upload. `0` re-lists only from the start of the last run | 0 to 86400 | `60`    |
| **CBOM Sync Retries (runs)**        | How many later sync runs retry a repository entry that could not be stored before it is given up on as permanently skipped; `0` gives an entry up at its first failure                                                        | 0 to 1000  | `3`     |
| **CBOM Sync Catch-up (documents)**  | How many CBOMs one sync run ingests cryptographic assets from beyond the entries it has just stored (earlier failures, interrupted ingests, CBOMs uploaded through the platform API); `0` turns the catch-up off              | 0 to 10000 | `50`    |

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
