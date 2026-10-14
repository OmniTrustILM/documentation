---
sidebar_position: 6
---

# From 1.20.3 To 1.21.0

In release version `1.21.0` the following changes were made:

## Optional in-memory CRL caching for AdES Signer

Added optional in-memory caching of CRLs to the AdES Signer module through the `CRL_CACHE_ENABLED` property. A cached CRL is reused until its next update instead of being downloaded for every signing request, and the `CRL_CACHE_NEXT_UPDATE_OFFSET` and `CRL_CACHE_MAX_NEXT_UPDATE_DELAY` properties limit how long it is reused. Caching is disabled by default, so existing configurations work without changes. For more information, refer to the [AdES Signer Basic Properties](../ades-formats/common-properties/basic-properties.mdx).

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements:
- Fix TLS handshake failures with the Entrust SAM when the client authentication key is held in a P11NG Crypto Token
