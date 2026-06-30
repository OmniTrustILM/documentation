---
sidebar_position: 7
---

# From 1.20.2 To 1.20.3

In release version `1.20.3` the following changes were made:

## Support for configuration of revocation data skip certificate extensions

Added support for configuring revocation data skip certificate extensions OIDs to exclude in the AdES Signer module through the `EXCLUDE_SKIP_REVOCATION_EXTENSIONS` property. This property allows you to exclude specific extensions from the default list of extensions that are used to skip revocation data check. This is useful when you want to enforce revocation data check for certificates that contain these extensions. For more information, refer to the [AdES Signer Basic Properties](../ades-formats/common-properties/basic-properties.mdx).

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements:
- Switch from the legacy Keycloak theme to the ILM default theme
- Ensure proper handling of digest algorithm parameters as per RFC 3279 requirements
