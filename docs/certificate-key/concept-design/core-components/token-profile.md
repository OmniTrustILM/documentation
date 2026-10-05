---
sidebar_position: 18
---

# Token Profile

## What is `Token Profile`?

`Token Profile` is a representation of attributes that collectively provides a complete configuration of the cryptographic key management service which can be used by users and applications in a consistent and convenient way.

`Token Profile` provides an abstraction of the key management service configuration attributes:

- Token and its related information
- Technology-specific attributes
- Service-related configuration
- Access control configuration
- Global configuration of key usages

Additionally, `Token Profile` uses the following attributes to identify the service:

- `Token Profile` Name
- Optional description

### Characteristics

Characteristics of `Token Profile` are:

- Binds the `Token` and act as a specific key management service
- Configures specific attributes and defines the behavior of the key management service
- Provide rules for the lifecycle and operations with cryptographic keys

### Key types

Every key is created under a `Token Profile`. The `Connector` behind its `Token` decides which key types the profile can create: secret keys, key pairs, or both.

- **A [Cryptography Provider v2](../../connectors/provider-interfaces/cryptography-provider-v2.md) reports its key types up front.** It reports them for the profile's token and configuration. The platform offers only those types when a user creates a key.
- **A [v1 provider](../../connectors/provider-interfaces/cryptography-provider.md) reveals its key types only at creation.** The platform offers both key types. The `Connector` refuses an unsupported type once a user requests it.
