---
sidebar_position: 6
---

# Execution

Executions are the specific operations performed when a rule is evaluated as matching. These operations are processed in a specified order to ensure the correct sequence of actions. Executions are the concrete tasks that carry out the workflow's intent.

## Execution attributes

| Attribute          | Description                                          |
|--------------------|------------------------------------------------------|
| **Execution Name** | A descriptive name for the execution.                |
| **Description**    | A brief explanation of the execution's purpose.      |
| **Execution Type** | The type of execution to be performed.               |
| **Resource**       | The object or entity to which the execution applies. |

:::note
Execution supports resource `Any`, which allows to use the same execution for different resources.
It is especially useful for execution types that are not resource or event specific.
:::

## Execution types

Executions can be classified into various types based on the nature of the operation they perform. Each type has specific attributes and behaviors that determine how the execution is processed. Currently, there are two supported execution types:

- **`Set Field`** — sets a property or a custom attribute of the processed object. See [Set Field](#set-field) below for the details of source values and mapping rules.
- **`Send Notification`** — sends a notification using the configured notification profile.

### Set Field

A `Set Field` execution item has a **target** (the property or custom attribute being written) and a **source** (the value being written into it). The source can be one of:

- A **static value**, typed directly into the execution item.
- A **mapped attribute value**, read from another attribute on the same object at trigger evaluation time. The source attribute can be a [metadata](../../../settings/global-metadata.md) attribute, a connector-supplied **data** attribute, or a [custom attribute](../../../settings/custom-attributes.md). It is selected the same way a [condition](./condition.md) references an attribute.

**Rules for mapped sources:**

- Mapping from a source attribute is available only when the **target is a custom attribute**. Properties can be set from a static value only.
- The source attribute is **read-only** — its value is copied into the target, and the source itself (for example, connector-managed metadata) is never modified.
- The source attribute is matched by **name and content type**. The execution item is recorded as failed if the object has no matching attribute, or if the copied value is not valid for the target custom attribute.

## Execution item syntax

Each execution item reads as **target then source**: in `Custom attribute 'Expiry' to Metadata attribute 'Expiry Source'`, the custom attribute `Expiry` is the target and the metadata attribute `Expiry Source` is the source. The same convention applies to a static source: `Property 'Owner' to 'John Doe'` writes the literal string `John Doe` into the `Owner` property.

## Examples

We would like to illustrate the concept of executions with a few examples:

**Update certificate owner:**

- **Execution Name:** Update owner to John Doe
- **Description:** This execution updates the owner of a certificate to "John Doe"
- **Execution Type:** Set Field
- **Resource:** Certificate
- **Execution Items:** `Property 'Owner' to 'John Doe'`

**Update custom attribute value:**

- **Execution Name:** Update custom attribute Category to To check
- **Description:** This execution updates the value of a custom attribute "Category" to "To check"
- **Execution Type:** Set Field
- **Resource:** Certificate
- **Execution Items:** `Custom attribute 'Category' to 'To check'`

**Send a notification:**

- **Execution Name:** Send notification
- **Description:** This execution sends a notification based on the configured notification profile
- **Execution Type:** Send Notification
- **Resource:** Any
- **Notification Profile:** Notification profile to use when processing the notification

**Copy metadata value to custom attribute:**

- **Execution Name:** Copy expiry source from metadata
- **Description:** This execution copies the value of the metadata attribute "Expiry Source" into the custom attribute "Expiry" on the certificate
- **Execution Type:** Set Field
- **Resource:** Certificate
- **Execution Items:** `Custom attribute 'Expiry' to Metadata attribute 'Expiry Source'`
