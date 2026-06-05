---
sidebar_position: 6
---

# Execution

Executions are the specific operations performed when a rule is evaluated as matching. These operations are processed in a specified order to ensure the correct sequence of actions. Executions are the concrete tasks that carry out the workflow’s intent.

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

Executions can be classified into various types based on the nature of the operation they perform. Each type has specific attributes and behaviors that determine how the execution is processed.
Currently, there are two supported execution types:
- `Set Field`
  - sets a **property** or a **custom attribute** of the processed object
  - the value can be a **static value** or **mapped from another attribute** — a [metadata](../../../settings/global-metadata.md), data, or [custom attribute](../../../settings/custom-attributes.md) of the processed object, resolved at trigger evaluation time. The source is referenced by field identifier, the same way a [condition](./condition.md) references an attribute.
  - mapping from a source attribute is available only when the **target is a custom attribute**; properties can be set from a static value only. The source attribute is **read-only** — its value is copied into the target, and the source itself (for example connector-managed metadata) is never modified.
  - the source attribute is matched by name and content type; if the object has no matching attribute the value cannot be resolved and the execution item is recorded as failed. Source and target content types must be compatible, as the value is copied unchanged.
- `Send Notification`
  - notify users based on notification profile

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

**Send Notification:**
- **Execution Name:** Send notification
- **Description:** This execution sends notification based on notification profile
- **Notification Profile:** Notification profile to use when processing notification

**Copy metadata value to custom attribute:**

- **Execution Name:** Copy expiry source from metadata
- **Execution Type:** Set Field
- **Resource:** Certificate
- **Execution Items:** `Custom attribute 'Expiry' to Metadata Attribute 'Expiry Source'`

:::note
An execution item reads as *target then source*: `Custom attribute 'Expiry' to Metadata Attribute 'Expiry Source'` sets the custom attribute **Expiry** to the value currently held in the metadata attribute **Expiry Source**. The metadata attribute is only read — it is not changed.
:::
