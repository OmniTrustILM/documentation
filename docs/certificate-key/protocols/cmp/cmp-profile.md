---
sidebar_position: 3
---

# CMP Profile

`CMP Profile` specifies the configurations of the CMP server behaviour. It holds the configuration listed below:

| Configuration                  | Purpose                                                                                         | Default Value | Mandatory                                     |
|--------------------------------|-------------------------------------------------------------------------------------------------|---------------|-----------------------------------------------|
| **Name**                       | `CMP Profile` Name                                                                              |               | <span class="badge badge--success">Yes</span> |
| **Description**                | Description of the `CMP Profile`                                                                |               | <span class="badge badge--danger">No</span>   |
| **Challenge Source**           | How requests are authenticated: with the protection configured on the profile, or with the challenge of a certificate registration. See [Challenge source](#challenge-source) | `Protocol Default` | <span class="badge badge--danger">No</span> |
| **Variant**                    | Variant of the CMP protocol defining the behaviour                                              |               | <span class="badge badge--success">Yes</span> |
| **Request Protection Method**  | One of available protection methods for the CMP requests                                        |               | <span class="badge badge--success">Yes</span> |
| **Shared Secret**              | Shared secret for the protection of CMP message when request protection method is shared secret |               | <span class="badge badge--danger">No</span>   |
| **Response Protection Method** | One of available protection methods for the CMP responses                                       |               | <span class="badge badge--success">Yes</span> |
| **Signing Certificate**        | Certificate used for signing CMP responses whn the response protection method is signature      |               | <span class="badge badge--success">Yes</span> |


## Supported CMP variants

The platform supports the following CMP variants:
- `CMPv2` - CMP version 2 as defined by [RFC 4210](https://datatracker.ietf.org/doc/html/rfc4210)
- `CMPv2 3GPP` - CMP version 2 with 3GPP extensions as defined by [3GPP Specification](https://www.3gpp.org/specifications-technologies)

:::info
The CMP variant `CMPv3` is prepared for future use case according to the [RFC 9483 - Lightweight Certificate Management Protocol (CMP) Profile](https://datatracker.ietf.org/doc/html/rfc9483), however, not yet fully implemented.
:::

## Request and response protection methods

The platform supports the following protection methods for CMP requests and responses:
- `Shared Secret` - Shared secret for the protection of CMP message according to the [RFC 4210, section 5.1.3.1](https://datatracker.ietf.org/doc/html/rfc4210#section-5.1.3.1)
- `Signature` - Signing of CMP message according to the [RFC 4210, section 5.1.3.3](https://datatracker.ietf.org/doc/html/rfc4210#section-5.1.3.3)

The following restrictions apply for the protection methods configuration:
- If the `Response Protection Method` is set to `Shared Secret`, the `Shared Secret` protection method must be configured also for the `Request Protection Method`
- If the `Request Protection Method` is set to `Signature`, the `Signature` protection method must be used also for the `Response Protection Method`

## Challenge source

With the challenge source `Protocol Default`, requests are authenticated by the `Request Protection Method` of the profile: with its **Shared Secret**, or by a signature.

With `Certificate Registration`, a request names a [registered certificate](../../quick-start/certificate-management/register-certificate.mdx) by its UUID in the `senderKID`, and the challenge of that registration is the shared secret of the message protection. Initialization (`ir`), certification (`cr`) and key update (`kur`) requests, and their `pollReq` and `certConf` messages, are authenticated this way. Once the protection is verified, the subject and SANs of the request must equal the registered identity. See [Challenge source](../common-properties.md#challenge-source) for how a failed request is refused.

The following restrictions apply to a profile with the challenge source `Certificate Registration`:
- The variant must be `CMPv2`
- The `Request Protection Method` must be `Shared Secret`, and no shared secret is configured on the profile
- The `Response Protection Method` can be either `Shared Secret` or `Signature`
- Revocation requests (`rr`) are refused
- The `senderKID` of a key update must be the UUID of the certificate being updated. After a successful key update the registration follows the new certificate, so the next key update names the UUID of the new certificate

## Request signing certificate

When the `Request Protection Method` is set to `Signature`, the request must contain signing certificate in the `PKIMessage` `extraCerts` field. The first certificate in the `extraCerts` field is used for the signature verification.

## Response signing certificate requirements

The certificate with associated private key should be available in the inventory in case `Response Protection Method` is set to `Signature`. The certificate should meet the following criteria:
- The certificate should be valid
- The certificate should have associated private key managed by the platform
- The private key should be valid and active
- The private key should have the `Key Usage` set to `Sign`

## Operations on `CMP Profile`

The following operations can be performed on the `CMP Profile`:

| Operation   | Description                                                                            |
|-------------|----------------------------------------------------------------------------------------|
| **Create**  | Create a new `CMP Profile`. New `CMP Profile` is disabled by default                   |
| **Update**  | Update configuration of already existing `CMP Profile`                                 |
| **Delete**  | Delete existing `CMP Profile`                                                          |
| **Disable** | Disable existing `CMP Profile`. All request to disabled `CMP Profile` will be rejected |
| **Enable**  | Enable existing `CMP Profile`                                                          |
