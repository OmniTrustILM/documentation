---
sidebar_position: 11
---

# From 1.16.5 To 1.17.0

In release version `1.17.0` the following changes were made:

## Update of dependencies

The release includes an update of the following major dependencies:
- DSS library to version 6.2
- SignServer new technology stack

## XAdES support for `ValidationDataEncapsulationStrategy`

The XAdES Signer now supports configuration of the unsigned signature property elements, to be used for validation data (certificate and revocation values) encapsulation, when required, using the property `VALIDATION_DATA_ENCAPSULATION_STRATEGY`. For more information, see the [XAdES Signer Properties](../ades-formats/xades-signer/xades.mdx) documentation.

## `MAX_POST_SIZE` variable

You can set the upper limit for the request body size that can be sent using the `MAX_POST_SIZE` environment variable of the related container.

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements to the SignServer:
- Optimize container builds
