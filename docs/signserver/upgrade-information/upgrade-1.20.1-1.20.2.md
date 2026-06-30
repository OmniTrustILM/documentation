---
sidebar_position: 8
---

# From 1.20.1 To 1.20.2

In release version `1.20.2` the following changes were made:

## AdES support for CRL and OCSP timeout configuration

Added support for configuring timeout settings for Certificate Revocation List (CRL) and Online Certificate Status Protocol (OCSP) in the AdES Signer module. This enhancement allows users to specify timeout values for CRL and OCSP checks, improving the reliability and performance of the signing process. For more information, refer to the [AdES Signer Basic Properties](../ades-formats/common-properties/basic-properties.mdx).

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements:
- Fix RSA signatures when batch signing on Entrust SAM Crypto Token
