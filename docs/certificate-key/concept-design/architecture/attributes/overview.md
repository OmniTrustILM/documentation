---
sidebar_position: 0
---

# Overview of A<sup>2</sup> engine

![A^2 engine](../../../../assets/a2-engine.png)

Although the CZERTAINLY platform is technology independent, each technology have its own specifics that the users should be able to use properly. Due to the dynamic nature of CZERTAINLY, required input data should be represented generally, in concise and accurate structure.
CZERTAINLY uses `Attribute` to require input and/or store import information identified by attribute name, type and content type.

From the standpoint of attribute definition source, we can split attributes to two separate groups.

### Connector attributes

Connector attributes, as name tells, are defined in connectors and are used to require input from user for some operation, provide additional non-mandatory data or display information to the user.
There are the following types of connector attributes:
- `Data` - their content represent some input parameter
- `Info` - their content is used to display some additional formatted information to the user (e.g. hint, tip, guide, etc.)
- `Group` - logical grouping of `Data` and `Info` attributes, that can be requested conditionally based on previous user input.

For more information on how to work with attributes, see [Using Attributes](../../../../contributors/attributes/overview.md).

### Custom attributes

Custom attributes are defined and managed by the users of CZERTAINLY platform. It allows user to add custom information to individual objects / resources that are part of platform.

This way, user can individually categorize, mark objects or create hierarchy and relationships between objects.

Custom attributes are not exchanged between the platform and connectors.

For more information, see [Custom Attributes](./custom-attributes.md).

### Metadata attributes

Metadata attributes are additional non-mandatory structured data that can provide additional information specific to implementation of connector.

Connector can provide metadata attributes as part of the operation result and they may be used during additional connector operations.

Metadata attributes are typically managed by the connector.

Metadata attribute can be marked as `global` to make it available between various connectors. For more information, see [Global Metadata](./global-metadata.md).

:::info
For more information about the concept behind the `Connector`, `Attributes`, `Callbacks`, etc, see the [CZERTAINLY platform overview](../../../concept-design/overview.md).
:::

## Attributes management
Since functionality in CZERTAINLY is heavily based on attributes and its data, attribute engine also provides layer for management of attributes and their content. Attribute engine is responsible for
- registration, validation and management of attributes definitions
- validation of attribute content for individual objects (user input)
- retrieving object attributes based on type and/or operation
- handling and providing attribute definitions for group attributes callback attributes
