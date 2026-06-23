---
sidebar_position: 8
---

# Entity Provider

:::info[Using Entity Provider]
Entity Provider helps to integrate any technology (open and proprietary) that is not able, not capable, or you do not want to, use standard interface and protocols for management and automation of the certificate and cryptographic keys lifecycle.
:::

## Overview

The `Certificate` can be stored and managed in various locations in the infrastructure. Entity Provide gives you the capability of management entities that are the end user of `Certificates` and if supported, manage their location with associated `Certificate` and cryptographic key.

Entity Provider can implement literally any type of the certificate store.

## How it works

Entity Provider `Connector` provides access to the locations on the remote devices. These devices are the actual end-users of the certificate. Multiple locations on one server are supported. The Connector can create multiple Entities and automate the certificate lifecycle on associated locations.

## Provider objects

[`Entity`](../../concept-design/core-components/entity.md) and [`Location`](../../concept-design/core-components/location.md) objects are managed in the platform through the Entity Provider implementation.
`Entity` represents an end user of the `Certificate` and it can have access to multiple `Locations`.

The following diagram shows the relation (sample) between `Entity Provider`, `Entity`, `Location`, and `Certificate`:

```plantuml
@startuml

map "Entity Provider" as ep {
}

package "Entity 1" as e1 {
    map "Location 1" as e1l1 {
    }
    map "Location 2" as e1l2 {
    }
    map "Location 3" as e1l3 {
    }
}

package "Entity 2" as e2 {
    map "Location 1" as e2l1 {
    }
    map "Location 2" as e2l2 {
    }
}

package Inventory {
    map "Certificate 1" as c1 {
    }
    map "Certificate 2" as c2 {
    }
    map "Certificate 3" as c3 {
    }
    map "Certificate 4" as c4 {
    }
}

ep --> e1
ep --> e2
e1l1 <-> c1
e1l3 <--> c1
e1l3 <--> c2
e1l3 <--> c3
e2l1 <--> c3
e2l1 <--> c4
e2l2 <--> c4

@enduml
```

## Processes related to `Entity`

The following processes are associated with the Entity Provider and management of the `Entity` objects.

### Create `Entity`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-Entity/#tag/Entity-Management/operation/createEntityInstance]]: Add Entity instance
        note over Client,Core: Update Existing Entity with Attributes from the connector
        Core->Core: Check existence of Connector and Entity
        Core -> Connector [[core-Entity/#tag/Entity-Management/operation/validateLocationAttributes]]: Validate Attributes
        Connector --> Core: Result of attribute validation
        Core -> Connector [[core-Entity/#tag/Entity-Management/operation/createEntityInstance]]: Add Entity instance
        Connector --> Connector: Check Connection to the Entity
        Connector --> Connector: Resister Entity
        Connector --> Core: Entity Details
        Core -> Core: Store Entity Reference
        Core -> Client: Return Entity UUID
    @enduml
```

### Get `Entity` Details

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-Entity/#tag/Entity-Management/operation/getEntityInstance]]: Get Entity instance details
        Core -> Connector [[core-Entity/#tag/Entity-Management/operation/getEntityInstance]]: Get Entity instance details
        Connector --> Core: Entity details
        Core -> Client: Return Entity details
    @enduml
```

### Update `Entity`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-Entity/#tag/Entity-Management/operation/editEntityInstance]]: Update Entity instance
        note over Client,Core: Update Existing Entity with Attributes from the connector
        Core -> Connector [[core-Entity/#tag/Entity-Management/operation/validateLocationAttributes]]: Validate Attributes
        Connector --> Core: Result of attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Entity-Management/operation/updateEntityInstance]]: Update Entity instance
        Connector -> Connector: Check Connection to the Entity
        Connector -> Connector: Update Entity details and attributes
        Connector --> Core: Entity Details
        Core -> Core: Update Entity Reference
        Core --> Client: Return Entity details
    @enduml
```


### Remove `Entity`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-Entity/#tag/Entity-Management/operation/deleteEntityInstance]]: Remove Entity instance
        Core -> Core: Check for dependent objects
        Core -> Connector [[core-Entity/#tag/Entity-Management/operation/removeEntityInstance]]: Remove Entity instance
        Connector --> Core: Entity Instance removed
        Connector -> Connector: Remove Entity Instance reference
        Core --> Client: Entity Instance removed
    @enduml
```

## Processes related to `Location`

The following processes are associated with the Entity Provider and management of the `Location` objects.

### Create `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core: List Entities
        Core --> Client: List Entities
        Client -> Core [[core-location/#tag/Location-Management/operation/addLocation]]: Add Location
        Core->Core: Check existence of Connector
        Core -> Core: Check existence of Entity
        Core -> Core: Check existence of Location
        Core -> Connector [[connector-entity-provider/#tag/Entity-Management/operation/validateLocationAttributes]]: Validate Attributes
        Connector --> Core: Result of attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/getLocationDetail]]: Get Location Details
        Connector --> Connector: Get Location details and Certificates
        Connector --> Core: Location details and Certificates
        Core -> Core: Create and store Location
        Core -> Core: Store Certificates
        Core --> Client: Location UUID
    @enduml
```

### `Location` Details

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/getLocation]]: Get Location Details
        Core -> Core: Process location details
        Core --> Client: Location details
    @enduml
```

### Update `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/editLocation]]: Edit Location
        Core -> Connector [[connector-entity-provider/#tag/Entity-Management/operation/validateLocationAttributes]]: Validate Attributes
        Connector --> Core: Result of attribute validation
        Core -> Core: Update Location details
        Core --> Client: Location details
    @enduml
```

### Remove `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/deleteLocation]]: Remove Location
        Core -> Core: Check for dependent objects
        Core -> Core: Remove Location
        Core --> Client: Location details
    @enduml
```

### Change `Location` State

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        alt enable/disable
            Client -> Core [[core-location/#tag/Location-Management/operation/enableLocation]]: Enable Location
            Client -> Core [[core-location/#tag/Location-Management/operation/disableLocation]]: Disable Location
            end
        Core --> Client: Location State Changed
    @enduml
```

### Issue `Certificate` in `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/issueCertificate]]: Issue Certificate to Location
        Core -> Core: Perform Pre Checks for Certificate Issuance
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/validateGenerateCsrAttributes]]: Validate CSR Attributes
        Connector --> Core: Result of CSR Attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/generateCsrLocation]]: Generate CSR
        Connector -> Connector: Generate CSR with new Key Pair
        Connector --> Core: CSR Data
        Core -> Authority [[connector-authority-provider-v2/#tag/Certificate-Management/operation/issueCertificate]]: Issue Certificate
        Authority --> Core: Base64 Certificate
        Core -> Core: Store Certificate
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/validatePushCertificateAttributes]]: Validate Push Certificate Attributes
        Connector --> Core: Result of Push Attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/pushCertificateToLocation]]: Push Certificate
        Connector --> Core: Certificate Pushed
        Core --> Client: Certificate Issued
    @enduml
```


### Renew `Certificate` in `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/renewCertificateInLocation]]: Renew Certificate in Location
        Core -> Core: Perform Pre Checks for Certificate Renewal
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/validateGenerateCsrAttributes]]: Validate CSR Attributes
        Connector --> Core: Result of CSR Attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/generateCsrLocation]]: Generate CSR
        Connector -> Connector: Generate CSR with existing Key Pair
        Connector --> Core: CSR Data
        Core -> Authority [[connector-authority-provider-v2/#tag/Certificate-Management/operation/renewCertificate]]: Renew Certificate
        Authority --> Core: Base64 Certificate
        Core -> Core: Store Certificate
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/validatePushCertificateAttributes]]: Validate Push Certificate Attributes
        Connector --> Core: Result of Push Attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/pushCertificateToLocation]]: Push Certificate
        Connector --> Core: Certificate Pushed
        Core --> Client: Certificate Renewed
    @enduml
```


### Push `Certificate` to `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/pushCertificate]]: Push Certificate to Location
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/validatePushCertificateAttributes]]: Validate Push Certificate Attributes
        Connector --> Core: Result of Push Attribute validation
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/pushCertificateToLocation]]: Push Certificate
        Connector --> Core: Certificate Pushed
        Core --> Client: Certificate Pushed to Location
    @enduml
```


### Delete `Certificate` from `Location`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-location/#tag/Location-Management/operation/removeCertificate]]: Remove Certificate from Location
        Core -> Connector [[connector-entity-provider/#tag/Location-Operations/operation/removeCertificateFromLocation]]: Remove Certificate
        Connector --> Core: Result of Certificate deletion
        Core --> Client: Certificate deleted
    @enduml
```

## Specification and example

The Entity Provider implements [Common Interfaces](../common-interfaces/overview.md) and the following additional interfaces:
- [Entity Management](/api/connector-entity-provider/#tag/Entity-Management)
- [Location Operations](/api/connector-entity-provider/#tag/Location-Operations)

The OpenAPI specification of the Entity Provider can be found here: [Connector API - Entity Provider](/api/connector-entity-provider/).
