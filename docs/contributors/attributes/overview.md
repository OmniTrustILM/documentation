---
sidebar_position: 1
---

import DocCardList from '@theme/DocCardList';

# Overview

Although the CZERTAINLY platform is technology independent, each technology has its own specifics that the users should be able to use properly.

CZERTAINLY uses `Attribute` to control such specific behaviour of different technologies, like certification authorities, credential providers, discovery of certificates, etc. So called `Attributes` are used in almost every `Connector` and developer must understand them in order to implement custom behaviour or extend the functionality of the platform.

:::info
For more information about the concept behind the `Connector`, `Attributes`, `Callbacks`, etc, see the [CZERTAINLY platform overview](../../certificate-key/concept-design/overview.md).
:::

Now let's take a look on what exactly is an `Attribute` and how it can be used.

## It is all about the `Attributes`

The concept works on the principle of exchanging and validation of `Attributes` between the `Client`, `Connector` and CZERTAINLY platform.
Implementation of some specific `Connector` must be able to define and properly handle its specific `Attributes`. The definition is then exchanged with the `Client` and the platform validates it consistency and mediate the flow and logic between them:

```plantuml
    @startuml
        Client ->> CZERTAINLY: list available Attributes
        CZERTAINLY ->> CZERTAINLY: check and validate request
        CZERTAINLY ->> Connector: get Attributes for the Client
        Connector <<->> Technology: get technology data
        Connector ->> CZERTAINLY: Attributes definition
        CZERTAINLY ->> CZERTAINLY: validate Attributes definition
        CZERTAINLY ->> Client: Attributes definition
        Client ->> CZERTAINLY: set Attributes
        CZERTAINLY ->> CZERTAINLY: validate and merge Attributes
        CZERTAINLY ->> Connector: request with the content of Attributes
        Connector <<->> Technology: use Attributes and process request
    @enduml
```

Because the communication is controlled by the platform, it ensures the consistency and security of the `Attributes` that are exchanged between the `Client` and the `Connector`, and eventually applied in the target technology.

## `BaseAttribute`

The `BaseAttribute` is the base class for all `Attributes`. It contains the basic properties that are common for all `Attributes` and uses the generic type `T` to define the `content`. Attributes are available in two versions — **V2** and **V3**. The basic functionality of both versions is the same. The key differences in V3 are:

- Required `schemaVersion` field (value `"v3"`)
- Each content item includes an explicit `contentType` field
- New `RESOURCE OBJECT` content type for referencing platform resources (replaces V2-only `SECRET` and `CREDENTIAL` content types)

:::warning[V2 is deprecated]
**V2 attributes are deprecated.** All new connector implementations should use **V3** attribute classes. V2 is maintained for backward compatibility with existing connectors but will not receive new features. Existing connectors are encouraged to migrate to V3.
:::

You can find specification of the `BaseAttribute` in the [CZERTAINLY Interfaces repository](https://github.com/OmniTrustILM/interfaces).

Table below describes the properties of the `BaseAttribute`:

| Property      | Type                                                | Short description                                                                                                                                   | Required                                      |
|---------------|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `uuid`        | `string`                                            | UUID of the defined `Attribute`. The combination of the `Connector` UUID and the `Attribute` UUID must be unique                                    | <span class="badge badge--success">Yes</span> |
| `name`        | `string`                                            | Name of the `Attribute`                                                                                                                             | <span class="badge badge--success">Yes</span> |
| `description` | `string`                                            | Description of the `Attribute` for better understanding of the `Attribute` purpose. This should contain descriptive explanation of the `Attribute`. | <span class="badge badge--danger">No</span>   |
| `type`        | [`AttributeType`](./attributes.mdx#attribute-types) | Type of the `Attribute`                                                                                                                             | <span class="badge badge--success">Yes</span> |
| `content`     | [`AttributeContent`](./content.md)                  | Content of the `Attribute` based on the [`AttributeContentType`](./content.md#supported-content-types)                                              | <span class="badge badge--danger">No</span>   |
| `version`     | `integer`                                           | Version of the `Attribute`. Supported versions are `2` and `3`, where `2` is currently the default version.                                         | <span class="badge badge--success">Yes</span> |
| `schemaVersion` | [`AttributeVersion`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/czertainly/api/model/common/attribute/common/AttributeVersion.java) | Schema version of the `Attribute`. **Required for V3** (value `"v3"`), not applicable to V2. | <span class="badge badge--success">Yes (V3)</span> |

## `Attribute` building blocks:

Each implementation of `Attribute` type consists of the following building blocks:

- `AttributeProperties` - properties defines the behaviour of the `Attribute`
- `AttributeContent` - specific content of the `Attribute` that is defined based on the `content` type
- `AttributeConstraint` - constraint that defines the validation of the `Attribute` content
- `AttributeCallback` - callback that is used to get the `Attribute` content when it depends on other factors

```plantuml
package Attribute {
    object AttributeProperties
    object AttributeContent
    object AttributeConstraint
    object AttributeCallback
}
```

The building blocks for each particular `Attribute` type are described in [Attributes](./attributes.mdx) section.

## Building blocks description and examples

The following section describes in detail each building block of the `Attribute` and provides examples of the `Attributes`.

<DocCardList/>