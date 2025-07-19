---
sidebar_position: 8
---

# Action

Actions are groups of executions triggered when a rule's conditions are met. An action can consist of multiple executions, each processed in a defined order. Actions encapsulate the operations that need to be performed as a response to the rule being triggered.

## Action attributes

| Attribute        | Description                                          |
|------------------|------------------------------------------------------|
| **Action Name**  | A unique name for the action.                        |
| **Description**  | A brief explanation of the action's purpose.         |
| **Resource**     | The object or entity to which the action applies.    |
| **Executions**   | The operations to be performed when the action runs. |

:::note
Action can support resource `Any`, which allows to combine executions with different resources. It is useful in case we want to reuse same action/execution in multiple triggers.
:::

## Actions processing

The executions within an action are processed in the order specified, ensuring that the operations are carried out as intended. Actions are the concrete tasks that implement the workflow's logic and define the response to specific conditions.

For a proper workflow execution, the actions must be well-defined and structured to ensure that the intended operations are performed accurately. Actions are the final step in the workflow process, executing the necessary tasks based on the rule's evaluation.

## Examples

We would like to illustrate the concept of actions with a few examples:

**Action to update owner and category:**

- **Action Name:** Update owner and category
- **Description:** This action updates the owner and category of a certificate
- **Resource:** Certificate
- **Executions:** `Update owner to "John Doe"`, `Update custom attribute "Category" to "To check"`
