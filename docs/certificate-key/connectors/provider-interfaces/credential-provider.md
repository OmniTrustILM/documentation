---
sidebar_position: 5
---

# Credential Provider

## Overview

Typically, when we need to access some service, we need to be properly authenticated and authorized. For this purpose we need to provide information to the service that can be used for this purpose. This is the purpose of the Credential Provider that defines the credential and its properties that are needed to securely access required service.

## How it works

The Credential Provider defines specific configuration of the credentials that can be used across the platform for authentication and authorization. 

## Provider objects

[`Credential`](../../concept-design/core-components/credential.md) objects are managed in the platform through the Credential Provider implementation.

## Processes

The following processes are associated with the Credential Provider and management of the `Credential` objects.

### Add `Credential`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client->Core [[core-credential/#tag/Credential-Management/operation/createCredential]]: Add Credential
        Note over Client,Core: Add Credential with specific Attributes based on the implementation
        Core->Core: Check existence of Connector and Credential
        Core->Connector [[connector-credential-provider/#tag/Attributes/operation/validateAttributes]]: Validate attributes
        Connector-->Core: Return validation result
        Core->Core: Store Credential
        Core-->Client: Return Credential UUID
    @enduml
```

### Get `Credential` details

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client->Core [[core-credential/#tag/Credential-Management/operation/getCredential]]: Details of a Credentials
        Core->Core: Process secrets
        Note right of Core: Secrets are securely processed before the Credential is returned
        Core-->Client: Return Credential details
    @enduml
```

### Update `Credential`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client->Core [[core-credential/#tag/Credential-Management/operation/editCredential]]: Update Credential
        Core->Core: Check existence of Connector and Credential
        Core->Connector [[connector-credential-provider/#tag/Attributes/operation/validateAttributes]]: Validate attributes
        Connector-->Core: Return validation result
        Core->Core: Update Credential
        Core-->Client: Return updated Credential
    @enduml
```

### Remove `Credential`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client->Core [[core-credential/#tag/Credential-Management/operation/deleteCredential]]: Remove Credential
        Core->Core: Check if the Credential can be removed
        Core->Core: Remove Credential
        Core-->Client: Return result
    @enduml
```

### Change state of the `Credential`

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        alt enable/disable
            Client->Core [[core-credential/#tag/Credential-Management/operation/enableCredential]]: Enable Credential
            Client->Core [[core-credential/#tag/Credential-Management/operation/disableCredential]]: Disable Credential
        end
        Core->Core: Check if the Credential state can be changed
        Core->Core: Change Credential state
        Core-->Client: Return result
    @enduml
```

## Specification and example

The Credential Provider implements [Common Interfaces](../common-interfaces/overview.md).
There are no additional interfaces needed for the Credential Provider.

The OpenAPI specification of the Credential Provider can be found here: [Connector API - Credential Provider](/api/connector-credential-provider/).
