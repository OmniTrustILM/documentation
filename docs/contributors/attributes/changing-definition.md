---
sidebar_position: 15
---

# Attribute Definition Management

Attributes play a crucial role in exchanging parameters and values for various operations. Maintaining consistency in their definition and content is essential, particularly for `Data` and `Metadata` attributes. These definitions are specified within connectors and are not managed by `Core`.

## Unique, Permanent, and Changeable Properties of Attributes

When `Core` requests attributes for a particular operation, the attribute definitions are retrieved, validated, and stored in the `Core` database for filtering purposes. Each attribute is uniquely identified by a combination of the following properties:

- `UUID`
- `Name`
- `Connector UUID` (not applicable for global metadata)

If an attribute is not found, its definition is stored. For existing definitions, `Core` checks whether the permanent property `contentType` has been altered. If there is a mismatch, an exception is thrown since `Core` cannot process incoming data that is incompatible with the already existing attribute content.

For other changes, the definition is updated based on the connector's input. This includes updating the serialized definition and the following changeable properties managed by `Core`:

- `Label`
- `Required` (not applicable for metadata)
- `ReadOnly` (not applicable for metadata)

In regard to other properties, they can be changed as needed. The only thing worth mentioning is that change does not affect in any way already existing content which can become invalid by some changes.

Described validation and updating mechanism ensures that attribute definitions and their content remain consistent. It is essential to maintain this consistency for proper operation and to enable filtering of objects based on their content type.

## FAQ

This FAQ section serves as a reference for situations where the attribute definition used in an operation needs to be updated.

### What if I need to change the Attribute UUID and/or Name?

UUID and name are unique properties of an attribute. If either is changed, `Core` will treat the attribute as a new one for the given operation, while the content will remain linked to the original definition. This may cause issues in some operations, such as renewing a certificate, where metadata is sent as part of the request. `Core` will send the content with the UUID or name of the original attribute definition, and whether it can be properly linked to the new definition depends on the connector and the changes made.

Changing UUID and/or Name will cause the link to the existing content to be lost. In some cases, it is possible to retrieve the content with the new definitions from the connector (e.g., the `identify` operation of the `authority` provider interface or the `sync` operation of the `entity` provider interface).

Currently, there is no attribute migration feature available. The only option is to sync (identify) or recreate the object. 

### What about Other Properties?

If there is a need to change the `contentType` property, you must update the definition with a new UUID and name to avoid conflicts with the existing content.

For other properties, `Core` will automatically update them in the stored definition. For example:

- When the `Label` is updated, the change will be visible immediately in API responses and in the UI on corresponding forms or attribute viewers.
- If the `Required` property is changed to `True`, be aware that operations on already existing objects may fail if the content for that attribute was not previously required.
- If the `ReadOnly` property is changed to `True`, operations may fail because the existing content may differ from what is specified in the definition, thus violating the read-only validation rule.

### What about migrating from V2 to V3?

V2 attributes are deprecated and all new implementations should use V3. When migrating existing connector attributes from V2 to V3:

- The `version` field must be set to `3` and `schemaVersion` to `"v3"`
- Content items must include the `contentType` field
- If the connector uses `CREDENTIAL` or `SECRET` content types, these must be replaced with the `RESOURCE OBJECT` content type and corresponding [Resource Callback](./callbacks.mdx#supported-special-purpose-callbacks)
- The attribute `uuid` and `name` should remain the same to preserve compatibility with existing stored definitions and content

Changing only the `version` and `schemaVersion` while keeping the same `uuid` and `name` is the recommended approach. `Core` will update the stored definition accordingly.

### What is the Best Practice for Attribute Definition?

When specifying an attribute definition, it is important to generate a unique combination of UUID and name. A good practice is to ensure the name is descriptive enough, and if the attribute represents a generic input (e.g., name, URL, type), use a prefix to specify its purpose more accurately. This helps avoid potential collisions or the need to rename attributes when adding new ones with similar purposes.

### Can I delete unused Data or Metadata attribute definition from `Core`?

Currently, there is no way how to manually delete stored definitions except custom attributes. Plan for the future is to include automatic cleanup of unused definitions without linked content for objects automatically.
