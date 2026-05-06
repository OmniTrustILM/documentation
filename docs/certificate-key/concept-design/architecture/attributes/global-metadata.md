---
sidebar_position: 6
---

# Global Metadata

`Global Metadata` is an abstraction layer to control and unite definition of specific metadata with same purpose. It allows the administrators to use already defined metadata marked as global and group all various content for different objects under one precise definition.

`Global Metadata` can be created in 2 ways:

- Defined in the `Core` and used in the `Connector`.
- Promote existing `Connector` metadata to `Global Metadata`.

### Characteristics

The characteristics of `Global Metadata` are:

- `Global Metadata` is not available for the user to create or update.
- Any metadata from the connector can be made as `Global Metadata` by enabling the property `global` in the attribute property configuration.
- Name of the `Global Metadata` should match the name of the attribute in the `Connector`.
- If a `Global Metadata` is not defined but enabled in the connector, its definition will be stored as a global metadata.
- If a `Global Metadata` is defined and not enabled in the connector, it will be stored as a connector metadata.

:::info
`Global Metadata` is currently supported only in `Core` through API interface.
:::

:::info
To know more about how to work with `Attributes`, see [Using Attributes](../../../../contributors/attributes/overview.md).
:::
