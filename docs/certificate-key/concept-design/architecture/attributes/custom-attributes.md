---
sidebar_position: 3
---

# Custom Attributes

`Custom Attributes` are the collection of user defined attributes that can be attached to any object in the system and are used to extend the functionality of the system and provide additional information about the object. These attributes are not part of the `Connectors` and are not sent to the `Connector` when the object is created or updated.

`Custom Attributes` can be associated with resources.

### Properties

`Custom Attributes` have the following properties:

| Property       | Description                                                                                                        | Required                                      | 
|----------------|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `Name`         | Name of the `Custom Attribute`                                                                                     | <span class="badge badge--success">YES</span> |
| `Description`  | Description of the `Custom Attribute`                                                                              | <span class="badge badge--danger">NO</span>   |
| `Content Type` | Content type of the `Custom Attribute`                                                                             | <span class="badge badge--success">YES</span> |
| `Content`      | Content of the `Custom Attribute`. It is used when the user is required to select an item from the provided value. | <span class="badge badge--danger">NO</span>   | 
| `Label`        | Friendly name to be displayed in the UI                                                                            | <span class="badge badge--success">YES</span> | 
| `Required`     | If `true`, the `Custom Attribute` will be required to be filled in the UI                                          | <span class="badge badge--success">YES</span> | 
| `Visible`      | If `true`, the `Custom Attribute` will be visible in the UI                                                        | <span class="badge badge--success">YES</span> | 
| `Read Only`    | If `true`, the `Custom Attribute` will be read only and the value cannot be modified                               | <span class="badge badge--success">YES</span> | 
| `List`         | If `true`, the `Custom Attribute` will be a list of values                                                         | <span class="badge badge--success">YES</span> | 
| `Multiselect`  | If `true`, the `Custom Attribute` will be a multiselect list of values                                             | <span class="badge badge--success">YES</span> | 
| `Group`        | Group of attributes to which attribute belongs to                                                                  | <span class="badge badge--danger">NO</span>   |
  
In addition to the above defined properties, custom attributes contain set of resources that they can be applied to.

### Characteristics

Characteristics of `Custom Attributes` are:

- `Custom Attributes` are created and maintained by the user.
- `Custom Attributes` are `Core` defined attributes and are not sent to the connector.
- Single `Custom Attribute` can be associated with multiple object types / resources.
- `Property` of `Custom Attribute` can be updated and maintained by the user.
- A `Custom Attribute` must be in <span class="badge badge--success">enabled</span> state to be used.
- The content of a `Custom Attribute` is shown only to users whose role grants the `Members` action on it. This applies to object details and to lists, where only those users are offered it as a column, a filter field or a sort key, see [Columns and Views](../columns-and-views.md).

:::info
To know more about how to work with `Attributes`, see [Using Attributes](../../../../contributors/attributes/overview.md).
:::
