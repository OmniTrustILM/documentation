---
sidebar_position: 5
---

# Platform

Platform settings represent general configuration of the platform.

Currently there are following platform settings categories:
- [Util](#util-settings)
- [Certificates](#certificates-settinngs)

## Util settings


| Name                  | Description                            | Required                                             |
|-----------------------|----------------------------------------|------------------------------------------------------|
| **Utils Service URL**    | URL of the Utils Service, if available | <span class="badge badge--danger" size="s">NO</span> |

## Certificates Settings

Certificate setitings configure default behaviour for some certificate operations and properties. Following options can be configured
| Name                  | Description                            | Default Value                                             |
|-----------------------|----------------------------------------|------------------------------------------------------|
| **Validation Enabled** |Indicator whether validation of certificates should be enabled| TRUE |
| **Validation Frequency** |Frequency of validation of certificates in days| Everyday|
| **Expiring Threshold** |How many days before expiration should certificate validation status change to Expiring| 30 days|
