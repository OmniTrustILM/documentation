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
  - set properties or custom attributes of the processed object
  - the target custom attribute value can be set either from a **static value** or dynamically from another attribute (META, DATA, or CUSTOM), with the source value resolved at trigger evaluation time
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
