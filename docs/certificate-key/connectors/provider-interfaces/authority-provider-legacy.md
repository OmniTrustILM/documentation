---
sidebar_position: 3
---

# Authority Provider Legacy

:::warning
Authority Provider Legacy is deprecated and will be removed in future release.
:::

## Overview

Authority Provider Legacy interface provides specific set of certificate management functions that support only API operations of the `EJBCA`.
The interfaces of the Authority Provider Legacy contain:
- Authority Management
- Certificate Management
- End Entity Management
- Profiles Management

## How it works

Authority Provider Legacy provides the ability to communicate with the EJBCA certification authorities.
:::warning
The Authority Provider Legacy interface is designed to work only with the EJBCA. If you are looking to support different technology, consider [Authority Provider v2](authority-provider-v2.md) interface.
:::

## Provider objects

[`Authority`](../../concept-design/core-components/authority.md) objects are managed in the platform through the Authority Provider Legacy implementation.

## Processes

The following processes are associated with the Authority Provider Legacy and management of the `Authority` objects.

## `Authority` Instance Management

### Create `Authority` Instance

```plantuml
    @startuml
    autonumber
    skinparam topurl /api/
        Client -> Core [[core-authority#tag/authority-management/POST/v1/authorities]]: Add Authority Instance
        Core->Core: Check existence of Connector and Authority
        Core -> Connector : Validate Attributes
        Connector --> Core: Result of Attribute validation
        Core -> Connector [[connector-authority-provider-v2#tag/authority-management/POST/v1/authorityProvider/authorities]]: Create Authority instance
        Connector -> Connector: Validation of connection to CA
        note right of Connector: Connection to the CA with the attributes is validated
        Connector --> Core: Return Authority Instance response
        Core -> Core : Store Authority Instance Reference
        Core --> Client: Return Authority UUID
    @enduml
```

### Get `Authority` Instance Details

```plantuml
    @startuml
    autonumber
    skinparam topurl /api/
        Client -> Core [[core-authority#tag/authority-management/GET/v1/authorities/{uuid}]]: Details of an Authority instance
        Core -> Connector [[connector-authority-provider-v2#tag/authority-management/GET/v1/authorityProvider/authorities/{uuid}]]: Get an Authority instance
        note right of Core: Details of the Authority instance is processed and combined with Authority Instance Reference from core
        Connector --> Core: Return Authority details
        Core -> Client: Return Authority details
    @enduml
```

### Update `Authority` Instance

```plantuml
    @startuml
    autonumber
    skinparam topurl /api/
        Client -> Core [[core-authority#tag/authority-management/PUT/v1/authorities/{uuid}]]: Update Authority instance
        Core -> Connector : Validate Attributes
        Connector --> Core: Result of Attribute validation
        Core -> Connector [[connector-authority-provider-v2#tag/authority-management/POST/v1/authorityProvider/authorities/{uuid}]]: Update Authority instance
        Connector -> Connector: Validation of connection to CA and update
        note right of Connector: Connection to the CA with the attributes is validated
        Connector --> Core: Return Authority Instance response
        Core -> Core : Update Authority Instance Reference in the database
        Core --> Client: Return Authority UUID
    @enduml
```

### Delete `Authority` Instance

The below diagram shows the sequence of messages that are exchanged between the client, core, and provider to delete an Authority instance.

```plantuml
    @startuml
    autonumber
    skinparam topurl /api/
        Client -> Core [[core-authority#tag/authority-management/DELETE/v1/authorities/{uuid}]]: Remove Authority instance
        Core -> Core : Check dependencies
        Core -> Connector [[connector-authority-provider-v2#tag/authority-management/DELETE/v1/authorityProvider/authorities/{uuid}]]: Remove Authority instance
        Connector --> Core: Return Authority Instance deletion response
        Core -> Core : Delete Authority Instance Reference
        Core --> Client: Return deletion status
    @enduml
```

## `Certificate` Management

### Issue `Certificate`

```plantuml
    @startuml
    autonumber
    skinparam topurl /api/
        Client -> Core [[core-client-operations#tag/legacy-client-operations/POST/v1/operations/{raProfileName}/certificate/issue]]: Issue Certificate
        note over Client,Core: Issue Certificate with required Attributes and RA Profile data
        Core -> Connector [[connector-authority-provider-legacy#tag/certificate-management/POST/v1/authorityProvider/authorities/{uuid}/endEntityProfiles/{endEntityProfileName}/certificates/issue]]: Issue Certificate
        Connector -> CA: Issue Certificate
        CA --> Connector: Return Certificate
        Connector --> Core: Return Certificate response
        Core -> Core : Store Certificate
        Core --> Client: Return Certificate UUID
    @enduml
```

### Renew `Certificate`

:::warning
Renewal of the certificate is not supported by the Authority Provider Legacy.
:::
### Revoke `Certificate`

```plantuml
    @startuml
    autonumber
    skinparam topurl /api/
        Client -> Core [[core-client-operations#tag/legacy-client-operations/POST/v1/operations/{raProfileName}/certificate/revoke]]: Revoke Certificate
        Core -> Connector [[connector-authority-provider-legacy#tag/certificate-management/POST/v1/authorityProvider/authorities/{uuid}/endEntityProfiles/{endEntityProfileName}/certificates/revoke]]: Revoke Certificate
        Connector -> CA: Revoke Certificate
        CA --> Connector: Return Certificate Revocation status
        Connector --> Core: Return Certificate revocation response
        Core -> Core : Set Certificate status as revoked
        Core --> Client: Return revocation status
    @enduml
```

## Specification and example

The Authority Provider Legacy implements [Common Interfaces](../common-interfaces/overview.md) and the following additional interfaces:
- [Authority Management](/api/connector-authority-provider-legacy#tag/authority-management)
- [Certificate Management](/api/connector-authority-provider-legacy#tag/certificate-management)
- [End Entity Profiles](/api/connector-authority-provider-legacy#tag/end-entity-profiles)
- [End Entity Management](/api/connector-authority-provider-legacy#tag/end-entity-management)

The OpenAPI specification of the Authority Provider Legacy can be found here: [Connector API - Authority Provider Legacy](/api/connector-authority-provider-legacy).
