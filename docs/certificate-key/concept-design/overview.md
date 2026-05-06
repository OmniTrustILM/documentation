---
sidebar_position: 1
---

# Overview

The platform is carefully designed with the following goals in mind:

- easy management of the data
- extensibility and flexibility
- technology agnostic
- easy to use and maintain
- quick installation

## Concept of the platform

It is designed as a microservice architecture with the ability to be flexible in various occasions.

It is based on the principle that the `Core` is acting as a middleman between the `Client` and the `Connector` providing the logic of all operations. The `Connector` contains the full implementation of a particular technology. It accepts the request from the `Core`, processes it, and sends back the response in a format the `Core` can understand. `Connector` is also designed to be completely independent from other paltform components.

### Architecture

The architecture of the platform is based on the following parts:

| Part                                                          | Brief description                                                                                               |
|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **[Database](architecture/database.md)**                      | Stores the data. SQL Database is used by default.                                                               |
| **[Core](architecture/core.md)**                              | This is the brain of the platform. It contains the full logic of request processing.                            |
| **[Interfaces](architecture/interfaces.md)**                  | Interfaces provided and used by the platform.                                                                   |
| **[Connector](architecture/connector.md)**                    | Technology implementations that interact with the `Core` to perform the designated operation on the technology. |
| **[Access Control](architecture/access-control/overview.md)** | Roles and permissions in the platform.                                                                          |
| **[A^2 Engine](./architecture/attributes/overview.md)**       | A^2 Engine is a component that provides the ability to define and manage attributes.                            |
| **[Notifications](./architecture/notifications.md)**          | Internal and External notifications.                                                                            |

See the [Architecture Overview](architecture/overview.md) for more details about the architecture of the platform.

### Core Components

The platform consists of the following components:

| Components                                                      | Brief description                                                                                                               |
|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **[Credential](core-components/credential.md)**                 | Stores the credentials for the Connectors.                                                                                      |
| **[Authority](core-components/authority.md)**                   | Authority instances representing access to specific certification authority technology.                                         |
| **[RA Profile](core-components/ra-profile.md)**                 | RA Profile abstracts the configuration of certificate-related attributes and provides a service for the Clients to manage them. |
| **[Compliance Profile](core-components/compliance-profile.md)** | Collection of rules to be applied on a certificate to determine whether it satisfies the organizational compliance policy       |
| **[Entity](core-components/entity.md)**                         | Entity representing the end user of the certificates and cryptographic key.                                                     |
| **[Certificate](core-components/certificate.md)**               | Certificate is an inventory object that contains all information about its lifecycle.                                           |
| **[Group](core-components/group.md)**                           | Grouping allows to manage multiple certificates with the same characteristics.                                                  |
| **[Token](core-components/token.md)**                           | Token instance representing access to specific cryptographic device or technology.                                              |
| **[Key](core-components/key.md)**                               | Cryptographic key object that can be managed and contains relevant information about its lifecycle.                             |
| **[Token Profile](core-components/token-profile.md)**           | Token Profile abstracts the configuration of cryptographic service for the Clients to request cryptographic operations.         |
| **[Notification](./core-components/notification.md)**           | Notification instance representing access to specific notification technology.                                                  |
| **[CBOM](core-components/cbom.md)**                             | Cryptographic Bill of Materials providing inventory and management of cryptographic assets based on CycloneDX specification.    |

### Modules

Platform modules provides the following functionality:

| Module                                                          | Brief description                                                                                         |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| **[Certificate Management](modules/certificate-management.md)** | Provides certificate lifecycle management functions.                                                      |
| **[Certificate Inventory](modules/certificate-inventory.md)**   | Inventory of all certificates that are consistently visible and managed.                                  |
| **[Certificate Discovery](modules/certificate-discovery.md)**   | Searching for certificates in various sources providing detailed results about discovered certificates.   |
| **[Dashboards](modules/dashboards.md)**                         | Comprehensive visual dashboard providing quick information about the current certificate inventory state. |
| **[Key Management](modules/key-management.md)**                 | Provides key lifecycle management functions and cryptographic operations.                                 |
| **[Key Inventory](modules/key-inventory.md)**                   | Inventory of all keys that are consistently visible and managed in technology-agnostic way.               |
