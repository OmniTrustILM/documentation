---
sidebar_position: 1
---

# Introduction

Signature Activation Data (SAD) Providers are handling the activation of the signing operation by transmitting information about the Signature Activation Data (SAD) between the Signature Integration Component (SIC) and Signature Activation Module (SAM) using the Signature Activation Protocol (SAP).

`SAD_PROVIDER_IMPLEMENTATION_CLASS` property must be configured with proper implementation of the SAD Provider.

The following implementations are available:

- [REST SAD Provider](./rest.mdx)
- [Metadata SAD Provider](./metadata.md)
- [Internal SAD Provider](./internal.mdx)

## SAD Metadata

Signing requests support the SAD metadata that can be provided as part of the request metadata starting with the `SAD_` prefix.
Each SAD metadata is included in the SAD request through the SAD provider. This allows to identify additional properties required for the proper SAD processing.

An example of such metadata can be:
```
REQUEST_METADATA.SAD_PROVIDED = ...
REQUEST_METADATA.SAD_ID = 58ac6ef459bb945ab88def9963
REQUEST_METADATA.SAD_ADDITIONAL_INFO = only for testing
```
