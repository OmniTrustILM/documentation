---
sidebar_position: 7
---

# Discovery Provider

## Overview

Certificate discovery, in other words searching for certificates in various location and sources, is important part of the lifecycle management. It provides clear understanding and visibility on all certificates that are used in the infrastructure and therefore should be included in the inventory to start manage them. Discovery can also detect certificates that are not allowed or should not be deployed.

Discovery Providers implements the functionality to discover certificate. It is responsible for discovering the certificates from defined source and returning the list of certificates to the `Core` inventory and makes it available for various lifecycle management operations.

## How it works

Discovery Provider triggers the discovery process using specific configuration. The trigger is managed from `Core`. Once the certificate discovery process is initiated, platform periodically checks for the discovered certificates that are included in the certificate inventory.

The history of `Discovery` is maintained in the `Core` for further reference.

## Provider objects

[`Discovery`](../../concept-design/modules/certificate-discovery.md) objects are managed in the platform through the Discovery Provider implementation.
Each `Discovery` provides an overview of the configuration and the discovery process, including discovered certificates.

## Processes

The following processes are associated with the Discovery Provider and management of the `Discovery` objects.

### Create `Discovery`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-discovery/#tag/Discovery-Management/operation/createDiscovery]]: Create Discovery
        note over Client: Create Discovery with specific Attributes from Connector
        Core->Core: Check existence of Connector
        Core -> Core: Check existence of Discovery  with same name
        Core -> Connector [[connector-discovery-provider/#tag/Attributes/operation/validateAttributes]]: Validate Attributes
        Connector --> Core: Result of attribute validation
        |||
        Core -> Connector [[connector-discovery-provider/#tag/Discovery/operation/discoverCertificate]]: Initiate certificate Discovery
        Connector --> Core: Return discovery triggered async response
        Core --> Client: Return discovery UUID
        Connector -> Devices : Discover Certificates
        Devices -> Connector : Certificates
        Connector -> Connector: Store discovered certificates
        note over Core, Connector: Certificates retrieval phase
        loop till all certificates are retrieved
            Core --> Connector [[connector-discovery-provider/#tag/Discovery/operation/getDiscovery]]: List of Certificates request
            Connector --> Core: Certificates with pagination details
        end
        Core -> Core: Store Certificates
        Core -> Core: Initiate Certificate validation
    @enduml
```

### Get `Discovery` Details

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-discovery/#tag/Discovery-Management/operation/getDiscovery]]: Discovery Details
        Core -> Core: Formulate Discovery details
        Core -> Client: Return Discovery details
    @enduml
```


### Delete `Discovery`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-discovery/#tag/Discovery-Management/operation/deleteDiscovery]]: Remove Discovery
        Core -> Connector [[connector-discovery-provider/#tag/Discovery/operation/deleteDiscovery]]: Delete Discovery
        Connector --> Core: Discovery removed
        Core -> Core : Remove Discovery
        Core --> Client: Discovery reference removed
    @enduml
```

## Specification and example

The Discovery Provider implements [Common Interfaces](../common-interfaces/overview.md) and the following additional interfaces:
- [Discovery](/api/connector-discovery-provider/#tag/Discovery)

The OpenAPI specification of the Discovery Provider can be found here: [Connector API - Discovery Provider](/api/connector-discovery-provider/).
