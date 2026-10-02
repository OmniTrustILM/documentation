---
sidebar_position: 16
---

# Columns and Views

Inventory lists let each user choose which columns are shown, sort the whole inventory by a column, and save the arrangement as a named view. This applies to the following lists:

| Inventory          | Custom attribute columns |
|--------------------|:------------------------:|
| `Certificates`     |           Yes            |
| `Keys`             |           Yes            |
| `Discoveries`      |           Yes            |
| `Connectors`       |           Yes            |
| `Secrets`          |           Yes            |
| `CBOMs`            |            No            |
| `Crypto Assets`    |            No            |
| `Signing Records`  |            No            |

Every list offers its object properties as columns. Metadata and data attributes are offered on a list once objects of that inventory carry them. `CBOMs`, `Crypto Assets` and `Signing Records` do not support `Custom Attributes`, so their lists offer fewer sources than the others.

## Choosing columns

### Column sources

A column shows one field, taken from one of four sources:

| Source           | Badge    | Description                                                                                                  |
|------------------|----------|--------------------------------------------------------------------------------------------------------------|
| Property         | -        | A property of the object itself, such as its name, status or expiry date.                                     |
| Custom attribute | `Custom` | A [`Custom Attribute`](../architecture/attributes/custom-attributes.md) defined in the platform and set on the object. |
| Metadata         | `Meta`   | Information a `Connector` or the platform recorded about the object, such as where a certificate was discovered. |
| Data attribute   | `Data`   | A value entered when the object was created or configured through a `Connector`.                             |

The heading of an attribute column carries the badge of its source, so a custom attribute and a property with the same label can be told apart. Hovering the badge shows the full source name.

Attributes that share a name and content type are shown as one column, whatever `Connector` or object they come from.

Not every field can be a column. The following are never offered:

- attributes whose content is secret, encrypted or a code block;
- attributes whose definition is not visible;
- `Custom Attributes` the user has no permission to read, see [Permissions](#permissions);
- a few properties the list does not carry, such as the subject alternative names of a certificate.

### Adding and removing columns

The **+** control at the right end of the table header opens the column menu. It lists the columns shown on the table, followed by the available fields grouped by source, and has a search box that matches a field's label or identifier.

- Tick a field to add it. A new column is added as the **first** column of the table.
- Untick a column under `Shown on the table`, or choose `Remove column` from its header menu, to remove it.
- `Reset to standard` restores the platform's default columns.

There is no limit on the number of columns, but a view must keep at least one.

### Reordering columns

Drag a column by the grip on the left of its heading and drop it where the indicator shows. The header menu (the **⋮** button on each heading) offers the same through `Move left`, `Move right`, `Move to the start` and `Move to the end`, which also works from the keyboard.

### Renaming a column heading

`Rename…` in the header menu replaces the heading with your own text. `Reset heading` reverts it to the platform label. A heading left at the platform label follows any later change to that label, for example when the label of a `Custom Attribute` is edited; a renamed heading does not.

A heading cannot be left blank. Submitting an empty heading reverts it to the platform label.

## Sorting

Click a column heading to sort the list by that column in ascending order, and click it again to switch between ascending and descending. `Sort ascending` and `Sort descending` in the header menu do the same.

Sorting orders the **whole inventory**, not only the rows on the current page: the platform returns the sorted result and paging walks through it, so page 2 continues where page 1 ended. The list sorts by one column at a time, and sorting by another column replaces the previous sort.

The active sort is shown by an arrow on the heading and in the summary line above the table, for example `Sorted by Expires At`. The reset button of the table restores the default ordering of the list, together with the default filters and paging.

### Which columns can be sorted

A heading that cannot be sorted is plain text without an arrow, and its header menu shows the sort entries disabled. A column cannot be sorted when:

- it holds an attribute with `File` or `Resource` content;
- it holds a property with no single orderable value, such as key usage or a list of values stored together.

Attribute columns are sorted by the type of their content: numbers numerically, dates chronologically and everything else alphabetically. An attribute with several values on one object is sorted by its smallest value in ascending order and by its largest in descending order. Objects with no value for the column are always listed last, in both directions.

## Views

A view is a saved arrangement of a list: its columns, its filters and its sort. Views are shown as tabs above the filter of each inventory.

| Stored in a view                                             | Not stored in a view          |
|--------------------------------------------------------------|-------------------------------|
| Columns, their order and any renamed headings                | Page size and the current page |
| Filters                                                      | Column widths                 |
| Sort column and direction                                    |                               |

A filter on a field with secret content applies to the table but is never saved into a view.

Switching to another tab replaces the columns, the filters and the sort together, and returns to the first page. Any filter set before the switch is replaced by the filters of the view, so a tab always shows the same rows for the same data.

### Views are per user

Each user has their own views for each inventory. A view is never shared with or visible to another user, including administrators, and two users can each have a view of the same name. Views follow the user across browsers and sessions, and are deleted when the user is deleted.

### The Standard tab

`Standard` is always the first tab. It shows the platform's default columns, no filters and the default ordering of the list. It is not a stored view, so it cannot be renamed, deleted, made to hold changes, or used as a view name. It is always available as a known starting point, however the user's own views have changed.

### Saving changes

Changing the columns, the filters or the sort does not change the view automatically. The tab shows a dot and the summary line reports unsaved changes:

- on a saved view, `Save to view` stores the changes and `Revert` discards them;
- on `Standard`, which cannot hold changes, `Save as view…` saves the table as a new view and `Revert` discards them.

### Managing views

| Action          | How                                                                                                     |
|-----------------|---------------------------------------------------------------------------------------------------------|
| Create          | The **+** at the end of the tab strip. A new view starts from the standard columns, with no filters and no sort. |
| Duplicate       | `Duplicate` in the tab's actions menu. The copy takes what the table shows, including unsaved changes, and is named `<name> (copy)`, then `<name> (copy) 2` and so on. |
| Rename          | `Rename…` in the tab's actions menu.                                                                    |
| Delete          | `Delete view` in the tab's actions menu. Deleting the active view opens the default view.               |
| Open by default | `Open this view by default` in the tab's actions menu. `Stop opening this view by default` clears it.   |

The actions menu is the **▾** button on the active tab. A view name must be unique among the user's views of the same inventory and may be up to 255 characters long.

Exactly one view opens when the list is loaded: the view marked with the pin icon, or `Standard` when no view is marked. Marking another view moves the pin to it.

Tabs are listed in the order the views were created. Up to four saved views are shown next to `Standard`; the rest are in the `N more` menu at the end of the strip, where each view can also be renamed, marked as default or deleted without opening it.

## When an attribute changes

### Renamed attribute

The name of a `Custom Attribute` cannot change once it is created; editing its label changes the heading of every column that has not been renamed in a view.

### Deleted attribute

A view keeps a column that refers to an attribute which no longer exists. The column is not shown, and a notice above the table names it, for example `Department cannot be shown, so this view is showing 5 of its 6 columns.` From the notice:

- `Remove from view` deletes the column from the view permanently;
- the dismiss button hides the notice, which returns if another column of the view becomes unavailable.

If none of the columns of a view can be shown, the table shows the standard columns instead. Saving the view keeps the unavailable columns, so they are never lost without the user removing them. A sort on an unavailable column is ignored and the view opens in the default ordering of the list.

## Permissions

A `Custom Attribute` is offered as a column, as a filter field and as a sort key only to users whose role grants the `Members` action on that attribute. For any other user it is left out entirely, and its values are not returned in any list.

A view whose owner later loses that permission behaves as if the attribute had been deleted: the column is listed as unavailable in the notice, a sort on it is ignored, and a filter on it no longer matches any object. Metadata and data attributes are not restricted by this permission.

Views themselves need no permission. A user can always create and manage their own views, and the rows a view shows are still limited by the user's permissions on the inventory.
