---
sidebar_position: 4
---

# Connector

`Connector` is the component that is used to communicate with the specific technology. In other words, `Connector` can be described as the service that translates actions and messages from other technologies to the platform.

`Connector` is technology independent and can be developed with any programming language. Each `Connector` implements specific `Function Groups` and `Kinds` and must be registered and approved within the `Core`.

For more information about the `Connector` interfaces, refer to [Interfaces](interfaces.md).

## `Connector` building blocks

### `Function Group`

The `Function Group` of a `Connector` describes the functions it can perform. It represents its capabilities.

`Function Group` can be combined, for example, a `Connector` can implement both `Credential Provider` and `Authority Provider` `Function Group`, however, `Kinds` cannot be mixed.

The platform supports the following `Connector` `Function Groups`:

| Function Group                                                               | Description                                                                                                                                                          | Interfaces needed to implement                                            |
|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [`Credential Provider`](../../connectors/provider-interfaces/credential-provider.md)             | `Connector` that provides a specific type of the `Credential` to the platform. `Credential` can be further used by the objects and other `Connector` of the platform | [Credential Provider API](/api/connector-credential-provider)             |
| [`Discovery Provider`](../../connectors/provider-interfaces/discovery-provider.md)               | Provides an interface to search for a certificates within a specific technology and sources                                                                          | [Discovery Provider API](/api/connector-discovery-provider)               |
| [`Legacy Authority Provider`](../../connectors/provider-interfaces/authority-provider-legacy.md) | Provides a connection with the certification authority and certificate management functions                                                                          | [Legacy Authority Provider API](/api/connector-authority-provider-legacy) |
| [`Authority Provider`](../../connectors/provider-interfaces/authority-provider-v2.md)            | Provides a connection with the certification authority and certificate management functions                                                                          | [Authority Provider API](/api/connector-authority-provider-v2)            |
| [`Entity Provider`](../../connectors/provider-interfaces/entity-provider.md)                     | Provides access to end entities and their locations to automate certificate and key lifecycle operations                                                             | [Entity Provider API](/api/connector-entity-provider)                     |
| [`Compliance Provider`](../../connectors/provider-interfaces/compliance-provider.md)             | Defines compliance rules that can be applied to certificates and validate against                                                                                    | [Compliance Provider API](/api/connector-compliance-provider)             |
| [`Cryptography Provider`](../../connectors/provider-interfaces/cryptography-provider.md)         | Provides cryptographic key management and operations using specific technology                                                                                       | [Cryptography Provider API](/api/connector-cryptography-provider)         |
| [`Notification Provider`](../../connectors/provider-interfaces/notification-provider.mdx)        | Provides a way to send notifications                                                                                                                                 | [Notification Provider API](/api/connector-notification-provider)         |
| [`Secret Provider`](../../connectors/provider-interfaces/secret-provider.md)                     | Provides secret management and retrieval from various secret management systems and vaults                                                                           | [Secret Provider API](/api/connector-secret-provider)                     |


### `Kind`

`Kind` represents the technology that single `Function Group` implements.

Each `Connector` can implement multiple `Function Groups` and each `Function Group` can implement multiple `Kinds`. The platform combines the power of `Function Group` and `Kind` to achieve multiple implementations in a single `Connector` if needed. But we always recommend creating a separate `Connector` for different technology for easy maintenance.

### `Attribute`

`Attribute` is the input the `Connector` may require for the request processing.
When the `Connector` is requested to perform the operation, it uses `Attributes` to get the list of required inputs with the format definition.

### `End Point`

`End Point` is the API that is implemented by the `Connector`. A `Connector` must include a few mandatory `End Points`. These pre-defined, standard endpoints are used by the `Core` to determine if the `Connector` is compliant with the platform.

See [`Connector` Interfaces](interfaces.md#connector-interfaces) for more information about the required `End Points`.

### `Callback`

Each `Connector` can implement `Callback` for any `Attribute`. `Callback` is the ways to fetch the values that are dependent on the input from other `Attribute`.

`Callback` is implemented as specific `End Point`.

### `Connector` Authentication

The `Connector` can be implemented without authentication, but when needed, authentication can be included. The platform implements the following authentication types:

- Basic (username/password)
- Client certificate
- API Key

### Interfaces implemented by the `Connector`

All Connectors must implement their respective interfaces. For more information, refer to [Interfaces](interfaces.md).

## How it works together?

The following steps explain how the `Connector` works:

- `Connector` will be registered with the `Core`
- `Core` validates the compliance of the `Connector` and its `Function Groups` together with `Kinds`
- Once the registration is complete, the `Connector` can provide its functionality to the platform

To perform any operations with `Connector`, the `Client`:

- Requests the `Core` for the operation
- Provides necessary attributes related to the `Connector` implementation
