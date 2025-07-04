---
sidebar_position: 1
---

# From 1.17.0 To 1.18.0

In release version `1.18.0` the following changes were made:

## Full support for Entrust SAM version 1.1.1

With the announcement of QSCD certification of Entrust SAM version 1.1.1, integration was updated to support its new features, such as:
- Support for the 3072 bit RSA key pairs
- Support for the RSASSA-PSS signature algorithm

## Improved AdES Signer

The AdES Signer has been improved to support specific signature providers and includes new configuration property `ENCRYPTIONALGORITHM` to specify the encryption algorithm used for the signature. For more information, refer to the [AdES Signer Basic Properties](../ades-formats/common-properties/basic-properties.mdx).

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements:
- Working with pre-generated dummy certificates in Entrust SAM Crypto Token
- Updated dependencies to the latest versions
- Checking the critical vulnerabilities during the build process
