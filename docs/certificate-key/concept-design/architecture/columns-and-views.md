---
sidebar_position: 10
---

# Columns and Views

Inventory lists, such as those of certificates, keys and discoveries, let each user choose the columns a list shows, sort the whole inventory by a column, and save the arrangement as a named view. Views are stored by `Core`, so they follow the user to every browser and session.

## Columns

A column shows one field of the listed objects. Fields come from these sources:

| Source           | Description                                                                                                   |
|------------------|---------------------------------------------------------------------------------------------------------------|
| Property         | A property of the object itself, such as its name, status or expiry date                                       |
| Custom attribute | A [`Custom Attribute`](./attributes/custom-attributes.md) set on the object                                    |
| Metadata         | Information that a `Connector` or the platform recorded about the object, such as where a certificate was discovered |
| Data attribute   | A value entered when the object was created or configured through a `Connector`                                |

Each inventory offers the fields that apply to its objects, so the choice differs between inventories. Attributes that share a name and content type form one column, whichever `Connector` or object they come from.

Some fields are never offered as columns:

- attributes whose content is secret, encrypted or a code block;
- attributes that are not visible;
- custom attributes the user is not permitted to read, see [Custom Attributes](./attributes/custom-attributes.md#characteristics);
- a few properties the list does not carry, such as the subject alternative names of a certificate.

A column is headed by the label of its field. A user can rename the heading in a view; a heading that was not renamed follows later changes to the label, such as an edited label of a custom attribute.

## Sorting

Sorting orders the whole inventory, not only the current page, by one column at a time. Attribute values are compared by their content type: numbers numerically, dates and times chronologically, and other content alphabetically. When an object has several values in the column, its smallest value decides its place in ascending order and its largest in descending order. Objects without a value are listed last in both directions.

Some columns cannot be sorted because their cells do not show a single value that can be ordered, for example attributes with `File` or `Resource` content, and properties that hold a set of values or are derived from other data.

## Views

A view stores the columns of a list, with their order and headings, its filters, and its sort column and direction. The page size and the current page are not stored. A few standard columns are computed for display only and cannot be stored in a view; a view opens without them.

Views are personal. Each user has their own views of each inventory, and no other user can see them, administrators included. Views need no permission, and the rows a view shows are still limited by the user's permissions on the inventory. View names are unique among a user's views of one inventory, and a user's views are deleted together with the user.

Every list also offers the built-in `Standard` view, with the platform's default columns, no filters and the default order. It is not stored and cannot be changed, so changes made on it can only be saved as a new view.

Changes to the columns, filters or sort of a list are never saved to a view automatically: the user either saves them to the view or discards them.

A user can make one of their views the default for an inventory. Opening the list shows that view, or `Standard` when no view is the default. A link that opens a list with filters, such as one on the dashboard, shows `Standard` with those filters instead, and returning to a list from one of its objects reopens the view that was in use.

## When an attribute changes

A view refers to an attribute by its name and content type.

If the attribute is deleted, encrypted or, for a custom attribute, made not visible, or if the user loses permission to read it, the view keeps the column but cannot show it. The list names the columns it cannot show and offers to remove them from the view, and shows the standard columns if none of the view's columns can be shown. A sort on such a column is dropped. Filters on the attribute stay in the view but can no longer compare its values: a condition that needs a value matches no object, and a negative condition, such as not equals, matches every object.

If an attribute with the same name and content type is created again later, the view does not take it over on its own, because it may be a different attribute. Until the user confirms it, the view does not show its column or apply its filters, and a sort on it is dropped; the list offers to use the attribute in the view or to remove it.

## API

Views are managed with the [List View](/api/core-other#tag/list-view) operations of the Other API, which always act on the views of the calling user.
