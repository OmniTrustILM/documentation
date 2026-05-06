---
sidebar_position: 1
---

# Overview

The CMP prootocol is comprehensive and flexible protocol for certificate management supporting any type of cryptography and use case. CMP messages are self-contained and can be used in any environment, which makes the CMP independent of the transport mechanism and provides a high level of security.

The platform implements CMP (Certificate Management Protocol) protocol for comprehensive and future-proof certificate management for any use case, including mobile networks and telecommunications, IoT, and more.

Implementation of CMP server provides a flexibility for the clients and administrators to choose between running CMP endpoint that are bound to a specific [RA Profile](../../concept-design/core-components/ra-profile.md).

:::info
CMP implementation follows [RFC 4210 - Internet X.509 Public Key Infrastructure Certificate Management Protocol (CMP)](https://datatracker.ietf.org/doc/html/rfc4210) with enrollment request format according to the [RFC 4211 - Internet X.509 Public Key Infrastructure Certificate Request Message Format (CRMF)](https://datatracker.ietf.org/doc/html/rfc4211).

The implementation is compatible with the [3GPP Specification](https://www.3gpp.org/specifications-technologies) for certificate management in telecommunications.
:::

## Supported PKI message types

The CMP implementation supports the following PKI message types and their associated response according to the [RFC 4210, section 5.3](https://datatracker.ietf.org/doc/html/rfc4210#section-5.3):

| PKIBody type | Name                   | Reference                                                                                |
|--------------|------------------------|------------------------------------------------------------------------------------------|
| `ir`         | Initialization Request | [RFC 4210, section 5.3.1](https://datatracker.ietf.org/doc/html/rfc4210#section-5.3.1)   |
| `cr`         | Certification Request  | [RFC 4210, section 5.3.3](https://datatracker.ietf.org/doc/html/rfc4210#section-5.3.3)   |
| `kur`        | Key Update Request     | [RFC 4210, section 5.3.5](https://datatracker.ietf.org/doc/html/rfc4210#section-5.3.5)   |
| `rr`         | Revocation Request     | [RFC 4210, section 5.3.9](https://datatracker.ietf.org/doc/html/rfc4210#section-5.3.9)   |
| `certConf`   | Certificate Confirm    | [RFC 4210, section 5.3.18](https://datatracker.ietf.org/doc/html/rfc4210#section-5.3.18) |

## Supported request formats

The CMP implementation supports the following request formats according to the [RFC 4211 - Internet X.509 Public Key Infrastructure Certificate Request Message Format (CRMF)](https://datatracker.ietf.org/doc/html/rfc4211) that can be used in the CMP messages. Only the first request from the CRMF will be processed. If the CRMF contains multiple requests, only the first one will be processed and the rest will be ignored.

The PKCS#10 request format according to the [RFC 2986 - PKCS #10: Certification Request Syntax Specification](https://datatracker.ietf.org/doc/html/rfc2986) is not supported and the `p10cr` PKIBody type is not implemented.

:::warning[CRMF support in connectors and CA technologies]
In order to use CMP protocol with the CRMF request format, the authority provider connector must support the CRMF request format for certificate management either. The proof of possession (POP) of the private key cannot be altered by the platform and must be supported by the CA technology.

The CRMF request format is supported by the following connectors:
- PyADCS Connector
- EJBCA NG Connector
:::

## Platform CMP server management

In order to start with the CMP protocol, the platform must be configured and act as the CMP server.

For this purpose we define the [`CMP Profile`](./cmp-profile.md) that contains configuration of the CMP server.

You can manage `CMP Profile` through the web interface or through the [`Core CMP API`](/api/core-cmp/).

## CMP Profile vs RA Profile CMP API

The `CMP Profile` can be configured with or without default `RA Profile`. On the other hand, you can enable CMP protocol (with the reference to already configured `CMP Profile`) for any particular `RA Profile`.

There are the following options for CMP service available:

| CMP service using                                                                           | Description                                                                                                                                                                                                                                                                                                                          |
|---------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `CMP Profile`<br/>`https://<hostname>:<port>/api/v1/protocols/cmp/{cmpProfileName}`         | To use `CMP Profile` directly from the client. In this case, the `CMP Profile` must have configured a default `RA Profile`, otherwise the CMP service won't be working. This option provides flexibility to change the underlying `RA Profile` without changing the configuration of CMP client                                      |
| `RA Profile`<br/>`https://<hostname>:<port>/api/v1/protocols/cmp/raProfile/{raProfileName}` | `RA Profile` can enable CMP protocol by using specific and already configured `CMP Profile`. The CMP service is in this case managed by the `RA Profile` and you do not have to configure it as a default for `CMP Profile`. This option provides a way, how to assign multiple `RA Profiles` with general CMP service configuration |

**When to use `CMP Profile` and when `RA Profile` CMP service?**

Depends on what you would like to achieve:
- if you would like to allow CMP clients to work only with one specific `RA Profile` then enable CMP protocol for the `RA Profile` using pre-configured `CMP Profile`
- if you would like to have the flexibility in changing the `RA Profile` which is used by the CMP client, then use `CMP Profile` service and configure the default `RA Profile` for it (that can be changed when needed)

:::tip
One `CMP Profile` can be used with multiple `RA Profiles`.
:::

:::warning
The platform performs various validations on the backend including the following:
- Availability of the `CMP Profile` or `RA Profile`
- Status of the `CMP Profile` or `RA Profile`
- If both `CMP Profile` and `RA Profile` are available and enabled
- If the `CMP Profile` has configured default `RA Profile`
:::
