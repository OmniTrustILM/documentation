---
sidebar_position: 2
---

# From 1.16.1 To 1.16.2

In release version `1.16.2` the following changes were made:

## PAdES Signer Properties Override

The PAdES Signer properties can now be overridden by the request metadata. Consult the [AdES Common Properties](../ades-formats/common-properties/basic-properties.mdx) and [PAdES Signer Properties](../ades-formats/pades-signer/pades.mdx) for more information.

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements to the SignServer:
- Add support for certificate chain in Entrust SAM Crypto Token
- Fix logic that decides to run signing in transaction
