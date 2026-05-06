---
sidebar_position: 5
---

# CMP 3GPP Extension

The platform supports the CMP protocol with the 3GPP extension. The CMP protocol is used for certificate management in telecommunications according to the [3GPP Specification](https://www.3gpp.org/specifications-technologies).

3GPP extension is enabled by using the `CMPv2 3GPP` variant in the CMP Profile configuration. In this case the following applies:
- Request protection method should be set to `Signature`
- Response protection method should be set to `Signature`
- Certificate request message should contain exactly one certificate request
- The publicKey field of the CertTemplate is mandatory
- Response contains `extraCerts` field with the certificate chain
