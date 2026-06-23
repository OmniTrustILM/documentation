---
sidebar_position: 4
---

# Compliance Provider

## Overview

Each certificate and cryptographic key can contain various attributes and can be based on different algorithms. There are also various standards and regulations that require specific behavior of the certificate, for example to be able to react on algorithm deprecation or vulnerabilities. The compliance checking helps to monitor the compliance status of each certificate that is included in the inventory of the platform.

Compliance Provider implements the functionality of compliance settings and checking for the certificates available in the platform. it applies specific compliance rules and group of compliance rules to `Certificate` and informs about the compliance status. Based on the compliance check, the `Certificate` will either be determined as compliant or not compliant.

## How it works

Compliance Provider have a set of applicable compliance rules and groups that can be configured as part of the `Compliance Profile`. This defines the set of compliance requirements. To check for the compliance status, `Compliance Profile` should be associated with `RA Profile`. After that every `Certificate` managed by such `RA Profile` will be checked against compliance rules configured in the `Compliance Profile`.

Compliance checking can be executed on `RA Profile` level (for all `Certificates`), for every specific `Certificate` in the inventory, or for each `Compliance Profile`.

## Provider objects

[`Compliance Profiles`](../../concept-design/core-components/compliance-profile.md) objects are managed in the platform through the Compliance Provider implementation.
Each `Compliance Profile` contains a list of available compliance rules and groups that can be applied for a compliance checking.
Many different `Compliance Profiles` with different compliance requirements can be managed and applied on certificates.

## Processes

The following processes are associated with the Compliance Provider and management of the `Compliance Profile` objects and checking compliance status of `Certificate` object.

### Add Compliance Provider

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-connector/#tag/Connector-Management/operation/createConnector]]: Create a new Connector
        Core -> Connector [[connector-compliance-provider/#tag/Info/operation/listSupportedFunctions]]: List supported functions of the connector
        Connector --> Core: Function Group and Kind
        Core -> Connector [[connector-compliance-provider/#tag/Compliance-Rules/operation/getRules]]: Get list of rules
        Connector --> Core: List Compliance Rules
        Core -> Connector [[connector-compliance-provider/#tag/Compliance-Rules/operation/getGroups]]: Get list of groups
        Connector --> Core: List Compliance Groups
        Core -> Core: Store Rules and Groups
        Core -> Client: Return Connector UUID
    @enduml
```

### Check Certificate Compliance

```plantuml
    @startuml
    autonumber
    skinparam topurl https://docs.otilm.com/api/
        Client -> Core [[core-certificate/#tag/Certificate-Inventory/operation/checkCompliance]]: Initiate Certificate Compliance Check
        Core --> Client: Return Async response
        Core -> Core: Get Compliance Profile of the Certificate
        Core -> Core: Frame requests to the Compliance Providers
        loop for each Compliance Provider
            Core -> Connector [[connector-compliance-provider/#tag/Compliance/operation/checkCompliance]]: Check certificate compliance
            Connector --> Connector: Evaluate each rule
            Connector --> Core: Return Compliance Check Result
        end
        Core -> Core: Aggregate Compliance Result
        Core -> Core: Store Compliance Result
    @enduml
```

:::info
When a request is made to check the compliance of the `Certificate`, the `Core` gathers list of rules configure in the associated `Compliance Profile` and request each Compliance Profiles for the specific compliance rule result. After all compliance rules are evaluated, the `Core` then computes the overall compliance status.
:::

## Specification and example

The Compliance Provider implements [Common Interfaces](../common-interfaces/overview.md) and the following additional interfaces:
- [Compliance Rules](/api/connector-compliance-provider/#tag/Compliance-Rules)
- [Compliance](/api/connector-compliance-provider/#tag/Compliance)

The OpenAPI specification of the Compliance Provider can be found here: [Connector API - Compliance Provider](/api/connector-compliance-provider/).
