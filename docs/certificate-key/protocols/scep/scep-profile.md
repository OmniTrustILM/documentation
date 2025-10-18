---
sidebar_position: 3
---

# SCEP Profile

`SCEP Profile` specifies the configurations of the SCEP server behaviour. It holds the configuration listed below:

| Configuration                    | Purpose                                                                        | Default Value                                         | Mandatory                                     |
|----------------------------------|--------------------------------------------------------------------------------|-------------------------------------------------------|-----------------------------------------------|
| **Name**                         | `SCEP Profile` Name                                                            |                                                       | <span class="badge badge--success">Yes</span> |
| **Description**                  | Description of the `SCEP Profile`                                              |                                                       | <span class="badge badge--danger">No</span>   |
| **Challenge Password**           | Challenge Password to authorize certificate request                            |                                                       | <span class="badge badge--danger">No</span>   |
| **Renewal Threshold**            | Number of days before the certificate expiration date to allow renewal request | `Half-time of the validity period of the Certificate` | <span class="badge badge--danger">No</span>   |
| **Include CA Certificate**       | Include certificate of the issuer in the certificate response                  | `false`                                               | <span class="badge badge--danger">No</span>   |
| **Include CA Certificate Chain** | Include complete chain in the certificate response                             | `false`                                               | <span class="badge badge--danger">No</span>   |
| **Enable Intune**                | Enable Microsoft Intune integration for certificate request validation         | `false`                                               | <span class="badge badge--danger">No</span>   |
| **Intune Tenant**                | Microsoft Intune Tenant to be used for request Validation                      |                                                       | <span class="badge badge--danger">No</span>   |
| **Intune Application ID**        | ID of the Microsoft Intune Application                                         |                                                       | <span class="badge badge--danger">No</span>   |
| **Intune Application Key**       | Secret to authenticate with the Intune application                             |                                                       | <span class="badge badge--danger">No</span>   |
| **CA Certificate**               | Certificate to be used as SCEP CA certificate (for decryption and signing)     |                                                       | <span class="badge badge--success">Yes</span> |

## `SCEP Profile` certificate requirements

The certificate to be used for the `SCEP Profile` should meet the following criteria

1. Certificate should have associated private key managed by the platform
2. The key algorithm should be one of the supported `RSA` or `ECDSA`
3. The key pair should have appropriate key set enabled (for encryption and signing)

:::warning[Microsoft Intune certificate requirements]
For Microsoft Intune validation, there may be additional requirements for the certificate. See the [Intune Integration Guide](../../integration-guides/intune/overview.md) for more information.
:::

## Operations on `SCEP Profile`

The following operations can be performed on the `SCEP Profile`:

| Operation   | Description                                                                              |
|-------------|------------------------------------------------------------------------------------------|
| **Create**  | Create a new `SCEP Profile`. New `SCEP Profile` is disabled by default                   |
| **Update**  | Update configuration of already existing `SCEP Profile`                                  |
| **Delete**  | Delete existing `SCEP Profile`                                                           |
| **Disable** | Disable existing `SCEP Profile`. All request to disabled `SCEP Profile` will be rejected |
| **Enable**  | Enable existing `SCEP Profile`                                                           |
