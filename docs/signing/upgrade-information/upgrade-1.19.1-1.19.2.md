---
sidebar_position: 1
---

# From 1.19.1 To 1.19.2

In release version `1.19.2` the following changes were made:

## Added support for http connection configuration for Entrust SAM

Added support for configuring HTTP connection properties for [Entrust SAM Crypto Token](../sam-integration/entrust-sam/properties.mdx). This allows users to customize connection settings such as timeouts to enhance connectivity and performance when interacting with the Entrust SAM. The following properties were added:
```
ENTRUST_MAX_CONNECTIONS_PER_ROUTE
ENTRUST_CONNECTION_REQUEST_TIMEOUT
ENTRUST_CONNECT_TIMEOUT
ENTRUST_SOCKET_TIMEOUT
ENTRUST_RESPONSE_TIMEOUT
```

## Added support for http connection configuration for Entrust REST SAD Provider

Added support for configuring HTTP connection properties for [Entrust REST SAD Provider](../sam-integration/entrust-sam/sad-providers/rest.mdx). This allows users to customize connection settings such as timeouts to enhance connectivity and performance when interacting with the REST SAD Provider. The following properties were added:
```
SAD_PROVIDER_MAX_PARALLEL_CONNECTIONS
SAD_PROVIDER_MAX_CONNECTIONS_PER_ROUTE
SAD_PROVIDER_CONNECTION_REQUEST_TIMEOUT
SAD_PROVIDER_CONNECT_TIMEOUT
SAD_PROVIDER_SOCKET_TIMEOUT
```

## Optimized SAM key data loading

Optimized the loading of SAM key data from database to improve performance during signing and key generation operations. This enhancement reduces the time taken to retrieve key information, resulting in memory footprint reduction, faster signing processes and improved overall efficiency when using the SAM for cryptographic operations.

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements:
- Remove deprecated SIGNATURE_FIELD_ID from PAdES
- Fix EC algorithm name for Entrust private key
- Propagate signature and augmentation failures
