---
sidebar_position: 25
---

# Secret Provider

The secret provider is provider interface responsible for fetching and managing secrets from various secret management systems. It abstracts the underlying implementation details and provides a consistent API for accessing secrets.

## Vault Management
### Create `Vault` Instance

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-authority/#tag/Authority-Management/operation/createAuthorityInstance]]: Add Vault Instance
        Core->Core: Check existence of Connector and Vault by Name
        Core -> Connector : Get Vault Attributes
        Connector --> Core: Vault Attributes
        Core -> Core : Validate Vault Attributes
        Core -> Connector: Check Vault Connection
        note right of Connector: Connection to the Vault with the attributes is validated
        Connector --> Core: Return check connection result
        Core -> Core : Store Vault Instance
        Core --> Client: Return Vault
    @enduml
```

## Secret Management

### Create Secret

```plantuml
    @startuml
    autonumber
    skinparam maxMessageSize 200
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-key/#tag/Secret-Management/operation/createSecret]]: Create new Secret
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Secret Attributes
        Connector --> Core: Secret Attributes
        Core -> Core : Validate Secret Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Vault Attributes
        Connector --> Core: Vault Attributes
        Core -> Core : Validate Vault Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/createKey]]: Create new Secret
        Connector -> Connector: Create new Secret
        note over Connector
        The secret is created within a Vault
        end note
        Connector --> Core: Return Secret Response
        Core -> Core : Create Secret in the inventory
        Core --> Client: Return Secret
    @enduml
```

### Update Secret

```plantuml
    @startuml
    autonumber
    skinparam maxMessageSize 200
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-secret/#tag/Secret-Management/operation/createSecret]]: Update Secret
        Core -> Core : Check if the content of secret has changed
        Core -> Core : Create new Secret Version
        note right Core
        Repeat for each connector containing the secret
        end note
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Secret Attributes
        Connector --> Core: Secret Attributes
        Core -> Core : Validate Secret Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Vault Attributes
        Connector --> Core: Vault Attributes
        Core -> Core : Validate Vault Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/createKey]]: Update Secret
        Connector -> Connector: Update Secret
        note over Connector
        The secret is updated within a Vault
        end note
        Connector --> Core: Return Secret Response
        Core -> Core : Update Secret in the inventory
        Core --> Client: Return Secret
    @enduml
```

### Delete Secret

```plantuml
    @startuml
    autonumber
    skinparam maxMessageSize 200
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-secret/#tag/Secret-Management/operation/createSecret]]: Delete Secret
        note right Core
        Repeat for each connector containing the secret
        end note
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Secret Attributes
        Connector --> Core: Secret Attributes
        Core -> Core : Validate Secret Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Vault Attributes
        Connector --> Core: Vault Attributes
        Core -> Core : Validate Vault Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/createKey]]: Delete Secret
        Connector -> Connector: Delete Secret
        note over Connector
        The secret is deleted in a Vault
        end note
        Core -> Core : Delete Secret in the inventory
        Core --> Client: Return Secret
    @enduml
```

### Get Secret Content

```plantuml
    @startuml
    autonumber
    skinparam maxMessageSize 200
    skinparam topurl https://docs.czertainly.com/api/
        Client -> Core [[core-secret/#tag/Secret-Management/operation/createSecret]]: Get Secret Content
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Secret Attributes
        Connector --> Core: Secret Attributes
        Core -> Core : Validate Secret Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/getCreateSecretAttributes]]: Get Vault Attributes
        Connector --> Core: Vault Attributes
        Core -> Core : Validate Vault Attributes 
        Core -> Connector [[connector-secret-provider/#tag/Secret-Management/operation/createKey]]: Get Secret Content
        Connector --> Core: Return Secret Content 
        Core --> Client: Return Secret Content
    @enduml
```