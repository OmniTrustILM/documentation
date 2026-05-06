---
sidebar_position: 1
---

# Authority Provider v2

## Overview

Authority Provider v2 interface is used to manage operations with certificates issued by certification authority. The Authority Provider v2 acts as an interface between the `Core` and the certification authority providing the following management functions:
1. Issue
2. Renew
3. Revoke 

## How it works

Authority Provider v2 provides the ability to communicate with different types and technologies of certification authorities.

## Provider objects

[`Authority`](../../concept-design/core-components/authority.md) objects are managed in the platform through the Authority Provider v2 implementation.

## Processes

The following processes are associated with the Authority Provider v2 and management of the `Authority` objects.

## `Authority` Instance Management

### Create `Authority` Instance

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-authority/#tag/Authority-Management/operation/createAuthorityInstance]]: Add Authority Instance
        Core->Core: Check existence of Connector and Authority
        Core -> Connector : Validate Attributes
        Connector --> Core: Result of Attribute validation
        Core -> Connector [[connector-authority-provider-v2/#tag/Authority-Management/operation/createAuthorityInstance]]: Create Authority instance
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
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-authority/#tag/Authority-Management/operation/getAuthorityInstance]]: Details of an Authority instance
        Core -> Connector [[connector-authority-provider-v2/#tag/Authority-Management/operation/getAuthorityInstance]]: Get an Authority instance
        note right of Core: Details of the Authority instance is processed and combined with Authority Instance Reference from core
        Connector --> Core: Return Authority details
        Core -> Client: Return Authority details
    @enduml
```

### Update `Authority` Instance

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-authority/#tag/Authority-Management/operation/editAuthorityInstance]]: Update Authority instance
        Core -> Connector : Validate Attributes
        Connector --> Core: Result of Attribute validation
        Core -> Connector [[connector-authority-provider-v2/#tag/Authority-Management/operation/updateAuthorityInstance]]: Update Authority instance
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
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-authority/#tag/Authority-Management/operation/deleteAuthorityInstance]]: Remove Authority instance
        Core -> Core : Check dependencies
        Core -> Connector [[connector-authority-provider-v2/#tag/Authority-Management/operation/removeAuthorityInstance]]: Remove Authority instance
        Connector --> Core: Return Authority Instance deletion response
        Core -> Core : Delete Authority Instance Reference
        Core --> Client: Return deletion status
    @enduml
```

## `Certificate` Management
Sections below represents the list of processes involved in managing the certificates.

### Issue `Certificate`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-client-operations/#tag/v2-Client-Operations/operation/issueCertificate]]: Issue Certificate
        Core -> Connector [[connector-authority-provider-v2/#tag/Certificate-Management/operation/validateIssueCertificateAttributes]]: Validate Attributes
        Connector --> Core: Result of Attribute validation
        Core -> Connector [[connector-authority-provider-v2/#tag/Certificate-Management/operation/issueCertificate]]: Issue Certificate
        Connector -> CA: Issue Certificate
        CA --> Connector: Return Certificate
        Connector --> Core: Return Certificate response
        Core -> Core : Perform Certificate validation
        Core -> Core : Store Certificate
        Core --> Client: Return Certificate UUID
    @enduml
```

### Renew `Certificate`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-client-operations/#tag/v2-Client-Operations/operation/renewCertificate]]: Renew Certificate
        Core -> Core: Get Attributes from parent Certificate
        note right Core: Attributes for renewal are taken from parent Certificate
        Core -> Connector [[connector-authority-provider-v2/#tag/Certificate-Management/operation/renewCertificate]]: Renew Certificate
        Connector -> CA: Issue Certificate
        CA --> Connector: Return Certificate
        Connector --> Core: Return Certificate response
        Core -> Core : Perform Certificate validation
        Core -> Core : Store Certificate to the database
        Core --> Client: Return Certificate UUID
    @enduml
```

### Revoke `Certificate`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-client-operations/#tag/v2-Client-Operations/operation/revokeCertificate]]: Revoke Certificate
        Core -> Connector [[connector-authority-provider-v2/#tag/Certificate-Management/operation/validateRevokeCertificateAttributes]]: Validate Attributes
        Connector --> Core: Result of Attribute validation
        Core -> Connector [[connector-authority-provider-v2/#tag/Certificate-Management/operation/revokeCertificate]]: Revoke Certificate
        Connector -> CA: Revoke Certificate
        CA --> Connector: Return Certificate revocation status
        Connector --> Core: Return Certificate revocation response
        Core -> Core : Set Certificate status as revoked
        Core --> Client: Return revocation status
    @enduml
```

## Specification and example

The Authority Provider v2 implements [Common Interfaces](../common-interfaces/overview.md) and the following additional interfaces:
- [Authority Management](/api/connector-authority-provider-v2/#tag/Authority-Management)
- [Certificate Management](/api/connector-authority-provider-v2/#tag/Certificate-Management)

The OpenAPI specification of the Authority Provider v2 can be found here: [Connector API - Authority Provider v2](/api/connector-authority-provider-v2/).
