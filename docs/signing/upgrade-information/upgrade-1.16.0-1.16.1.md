---
sidebar_position: 130
---

# From 1.16.0 To 1.16.1

Release version `1.16.1` includes the following changes:

## Entrust Internal SAD Provider

[Entrust Internal SAD Provider](../sam-integration/entrust-sam/sad-providers/internal.mdx) is a new SAD provider that allows internal authorization of the signatures using Entrust SAM. The provider is used to authorize the signatures without having to use external services yet still providing the same level of security and configuration options as the external SAD provider.

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements to the SignServer:
- Fix client-side hashing algorithm override
- Include unique random identifier into generated key alias
