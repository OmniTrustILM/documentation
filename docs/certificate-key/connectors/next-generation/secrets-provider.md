---
sidebar_position: 40
---

# Secrets Provider

## Overview

The purpose of the Secrets Provider is to provide an interface for easy and quick integration with external secret management systems. This allows the platform to securely store, retrieve, and manage sensitive information required for various operations.

## How it works

The Secrets Provider acts as a bridge between the platform and external secret management systems. It connects to these systems to perform operations such as storing, retrieving, and managing secrets. The Secrets Provider ensures that sensitive information is handled securely and efficiently, adhering to best practices for secret management, while providing a consistent user experience.

## Provider objects

[`Secrets Manager`](../../concept-design/core-components/secret.md) objects are managed in the platform through the Secrets Provider implementation. Every instance of the `Secrets Manager` represents a connection to an external secret management system with specific configuration.

[`Secret`](../../concept-design/core-components/secret.md) objects represent individual secrets stored in the external secret management system. Each `Secret` is associated with a specific `Secrets Manager` instance and contains specific type supported by the platform.

These objects are managed by the Core and the implementation does not mandate any specific requirements on the persistence of the information. The implementation is free to decide what information should be stored, in case needed, in its own storage.

## Processes related to `Secrets Manager` instances

The following processes are associated with the Secrets Provider and management of the `Secrets Manager` and `Secret` objects.

### Create `Secrets Manager` Instance

To create a `Secrets Manager` instance, client needs to provide the required attributes as defined by the specific implementation of the Secrets Provider. The implementation will validate the provided attributes and attempt to establish a connection to the external secret management system to ensure that the configuration is correct and the system is reachable.

Once the connection is successfully validated, the `Secrets Manager` instance will be created and stored in the platform. The client will receive a unique identifier (UUID) for the newly created `Secrets Manager` instance.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/createSecretsManagerInstance]]: Add Secrets Manager Instance
        Core -> Core: Check existence of Connector and\nSecrets Manager Instance
        Core -> Connector [[connector-secrets-provider/#tag/Secrets-Manager/operation/createSecretsManagerInstance]]: Validate connection to\nSecrets Manager Instance
        Connector -> Connector: Validation of connection to external\nSecrets Management System,\n if it is available and reachable\nand authentication is successful
        note right of Connector: Connection to the Secret external\nManagement System with the attributes\nis validated according to the\nimplementation requirements
        Connector --> Core: Return Secrets Manager Instance response
        Core -> Core : Store Secrets Manager Instance\nwith required Attributes
        Core --> Client: Return Secrets Manager UUID
    @enduml
```

### Update `Secrets Manager` Instance

To update a `Secrets Manager` instance, the client needs to provide the UUID of the existing instance along with the updated attributes. The implementation will validate the provided attributes and attempt to re-establish a connection to the external secret management system to ensure that the updated configuration is correct and the system is reachable.

If the connection is successfully validated, the `Secrets Manager` instance will be updated in the platform with the new configuration. The client will receive the updated details of the `Secrets Manager` instance.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/editSecretsManagerInstance]]: Update Secrets Manager Instance
        Core -> Core: Check existence of Connector and\nSecrets Manager Instance
        Core -> Connector [[connector-secrets-provider/#tag/Secrets-Manager/operation/updateSecretsManagerInstance]]: Validate connection to\nSecrets Manager Instance
        Connector -> Connector: Validation of connection to external\nSecrets Management System,\n if it is available and reachable\nand authentication is successful
        note right of Connector: Connection to the Secret external\nManagement System with the attributes\nis validated according to the\nimplementation requirements
        Connector --> Core: Return Secrets Manager Instance response
        Core -> Core : Update Secrets Manager Instance\nwith required Attributes
        Core --> Client: Return Secrets Manager Instance details
    @enduml
```

### Remove `Secrets Manager` Instance

To remove a `Secrets Manager` instance, the client needs to provide the UUID of the existing instance. The implementation will check if the `Secrets Manager` instance exists and whether it is referenced by any `Secret`. If it is not referenced, the instance will be removed from the platform.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/deleteSecretsManagerInstance]]: Remove Secrets Manager Instance
        Core -> Core: Check existence of Connector and Secrets Manager Instance
        Core -> Core: Check the Secrets Manager Instance is not referenced by any Secret
        Core -> Core : Remove Secrets Manager Instance from the database
        Core --> Client: Return deletion response
    @enduml
```

### Get `Secrets Manager` Instance Details

To retrieve the details of a specific `Secrets Manager` instance, the client needs to provide the UUID of the instance. The implementation will fetch the details from the platform and return them to the client.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/getSecretsManagerInstance]]: Get details of Secrets Manager Instance
        Core -> Core: Fetch Secrets Manager Instance details
        Core --> Client: Return Secrets Manager Instance details
    @enduml
```

## Processes related to `Secret` objects

The following processes are associated with the Secrets Provider and management of the `Secret` objects.

### Create `Secret`

Creating a `Secret` involves providing the necessary attributes and associating it with a specific `Secrets Manager` instance. The implementation will validate the provided attributes and store the `Secret` in the external secret management system through the attributes of associated `Secrets Manager`.
Afterwards, the `Secret` will be created and stored in the platform with attributes and metadata (if any). The client will receive a unique identifier (UUID) for the newly created `Secret`.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/createSecret]]: Create Secret
        Core -> Core: Check existence of Connector and\nSecrets Manager Instance
        Core -> Connector [[connector-secrets-provider/#tag/Secrets-Manager/operation/createSecret]]: Validate connection to Secrets Manager Instance
        Connector -> Connector: Validation of attributes for creating Secret
        Connector -> Connector: Create Secret in the external\nSecret Management System
        Connector --> Core: Return Secrets response
        Core -> Core : Store Secrets instance with its Attributes and Metadata
        Core --> Client: Return Secret details
    @enduml
```
### Update `Secret`

Updating a `Secret` involves providing the UUID of the existing `Secret` along with the attributes and metadata. The implementation will check if the `Secret` exists, validate the provided attributes and update the `Secret` in the external secret management system through the attributes of associated `Secrets Manager`.
Afterwards, the `Secret` will be updated in the platform with the new configuration, updated value fingerprint and version. The client will receive the updated details of the `Secret`.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/updateSecret]]: Update Secret
        Core -> Core: Check existence of Connector,\nSecrets Manager Instance and Secret
        Core -> Connector [[connector-secrets-provider/#tag/Secrets-Manager/operation/updateSecret]]: Validate connection to Secrets Manager Instance
        Connector -> Connector: Validation of attributes for updating Secret
        Connector -> Connector: Update Secret in the external\nSecret Management System
        Connector --> Core: Return Secrets response
        Core -> Core : Update Secret instance with its Attributes and Metadata
        Core --> Client: Return Secret details
    @enduml
```

### Delete `Secret`

Deleting a `Secret` involves providing the UUID of the existing `Secret` along with the attributes and metadata. The implementation will check if the `Secret` exists, is it not referenced in other objects and then remove it from platform and the external secret management system through the attributes of associated `Secrets Manager`.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/deleteSecret]]: Delete Secret
        Core -> Core: Check existence of Connector,\nSecrets Manager Instance and Secret
        Core -> Core: Check the Secret is not referenced by any other object
        Core -> Connector [[connector-secrets-provider/#tag/Secrets-Manager/operation/deleteSecret]]: Delete Secret in the external\nSecret Management System
        Connector -> Connector: Removal of Secret in the external\nSecret Management System
        Connector --> Core: Return deletion response
        Core -> Core : Remove Secret instance from the database
        Core --> Client: Return deletion response
    @enduml
```

### Rotate `Secret`

Rotating a `Secret` involves providing the UUID of the existing `Secret` along with the attributes and metadata. The implementation will check if the `Secret` exists, and then rotate it in the external secret management system through the attributes of associated `Secrets Manager` if it is supported.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core [[core-secret/#tag/Secrets-Manager/operation/rotateSecret]]: Rotate Secret
        Core -> Core: Check existence of Connector,\nSecrets Manager Instance and Secret
        Core -> Connector [[connector-secrets-provider/#tag/Secrets-Manager/operation/rotateSecret]]: Rotate Secret in the external\nSecret Management System
        Connector -> Connector: Rotation of Secret in the external\nSecret Management System
        Connector --> Core: Return rotated Secret response
        Core -> Core : Update Secret instance with new Metadata
        Core --> Client: Return Secret details
    @enduml
```

### Get `Secret` value and use it in connector

When client would like to use value of the `Secret` in any connector operation, since Core does not store the actual secret values, it needs to retrieve it from the external secret management system by provider.
Client is selecting secret by its UUID and name passing it to the core. Retrieving a `Secret` value then involves taking the UUID of the `Secret` along with the attributes and metadata and then fetch its value from the external secret management system through the attributes of associated `Secrets Manager`.
System will currently retrieve only the latest version of the `Secret` value.

```plantuml
    @startuml
    autonumber
    skinparam topurl %API_BASE_URL
        Client -> Core: Call operation that requires secret and its value
        Core -> Core: Check existence of Secret and\nConnector Secrets Manager Instance 
        Core -> SecretsConnector [[connector-secrets-provider/#tag/Secrets-Manager/operation/getSecretValue]]: Get Secret Value from the external\nSecret Management System
        SecretsConnector -> SecretsConnector: Retrieval of Secret Value\nfrom the external\nSecret Management System
        SecretsConnector --> Core: Return Secret Value response
        Core --> Connector: Send operation request with Secret Value
        Connector --> Core: Return operation response
        Core --> Client: Return operation response
    @enduml
```