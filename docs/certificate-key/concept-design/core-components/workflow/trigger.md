---
sidebar_position: 10
---

# Trigger

Triggers are constructs that initiate a workflow. They are linked to rules and actions, determining how and when a workflow starts.
Triggers can be time-based (scheduled), event-based, or manually initiated, providing flexibility in how workflows are activated.
By defining triggers, users can automate processes and ensure that workflows are executed in response to specific events or conditions.

Triggers are linking components that connect rules and actions, ensuring that the workflow is initiated when the defined conditions are met.
They provide the starting point for the workflow execution, enabling the automation of tasks based on predefined criteria.

## Trigger attributes

| Attribute          | Description                                                                |
|--------------------|----------------------------------------------------------------------------|
| **Trigger Name**   | A unique name for the trigger.                                             |
| **Description**    | A brief explanation of the trigger's purpose.                              |
| **Type**           | The type of trigger to restrict its usage.                                 |
| **Event Name**     | The specific event that is supported by the trigger.                       |
| **Ignore Trigger** | A flag to indicate if the trigger should ignore processing matched object. |
| **Resource**       | The object or entity to which the trigger applies.                         |
| **Rules**          | The rules associated with the trigger.                                     |
| **Actions**        | The actions triggered by the trigger.                                      |

## Trigger types

Triggers can be classified into various types based on how they initiate a workflow. Each trigger type has specific attributes and behaviors that determine how the workflow is started.

## Examples

We would like to illustrate the concept of triggers with a few examples:

**Trigger to set certificate owner on newly discovered certificates having a specific common name:**

- **Trigger Name:** Set owner for all certificates with CN containing example.com to John Doe
- **Description:** This trigger sets the owner of all certificates with a common name containing "example.com" to "John Doe"
- **Type:** Event
- **Event:** Certificate Discovered
- **Ignore Trigger:** No
- **Resource:** Certificate
- **Rules:** `Certificates with CN containing "example.com" and Public Key Algorithm is RSA`
- **Actions:** `Update owner and category`
