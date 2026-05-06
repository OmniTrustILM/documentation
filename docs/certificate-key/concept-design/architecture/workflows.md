---
sidebar_position: 9
---

# Workflows

Workflows are a series of tasks executed in a specific sequence to automate processes, ensuring tasks are performed correctly and efficiently. They streamline operations by automating tasks such as categorizing discovered certificates in inventory, updating certificate statuses, and many other activities.

Workflows can be triggered manually, automatically, or by events such as the completion of a task or the creation of a new certificate. The primary goal of workflows is to automate and orchestrate tasks within a broader process, minimizing manual intervention and errors.

:::info[Workflow support]
The CZERTAINLY platform supports workflows starting from version 2.12.0. The current implementation includes a specific set of rules and actions that can be triggered for newly discovered certificates. The platform is designed to be extensible, with plans to add more rules, actions, and triggers in future releases.
:::

## Workflow components

A workflow consists of the following components:

| Component                                                  | Description                                                                                                                                                                                |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **[Conditions](../core-components/workflow/condition.md)** | Criteria used to evaluate if specific operations should be executed. If the conditions are met, the corresponding actions are triggered for the object.                                    |
| **[Rules](../core-components/workflow/rule.md)**           | Collections of conditions that are assessed to decide if an action should be initiated. Rules can include multiple conditions with various types and operators.                            |
| **[Executions](../core-components/workflow/execution.md)** | Operations performed when a rule is triggered. Executions are typically processed in a specified order to ensure the correct sequence of actions.                                          |
| **[Actions](../core-components/workflow/action.md)**       | Groups of executions triggered when a rule's conditions are met. Actions may consist of multiple executions, each processed in a defined order for objects that match the rules.           |
| **[Triggers](../core-components/workflow/trigger.md)**     | Constructs that initiate a workflow. Triggers are linked to rules and actions, determining how and when a workflow starts. Triggers can be time-based, event-based, or manually initiated. |

## Components relations

The following diagram illustrates the relationship between the workflow components:

```plantuml
@startuml
top to bottom direction

circle Ignore

package Conditions {
    collections "Conditions 1" as c1
    collections "Conditions 2" as c2
    collections "Conditions 3" as c3
    collections "Conditions 4" as c4
}

package Rules {
    collections "Rules 1" as r1
    collections "Rules 2" as r2
    collections "Rules 3" as r3
}

package Executions {
    collections "Executions 1" as e1
    collections "Executions 2" as e2
    collections "Executions 3" as e3
}

package Actions {
    collections "Actions 1" as a1
    collections "Actions 2" as a2
    collections "Actions 3" as a3
}

package Triggers {
    control "Trigger 1" as t1
    control "Trigger 2" as t2
    control "Trigger 3" as t3
}

c1 --> r1
c2 --> r1
c2 --> r2
c2 --> r3
c3 --> r3
c4 --> r3

r1 --> t1
r2 --> t2
r3 --> t2
r3 --> t3

t1 --> a1
t2 --> a2
t3 --> Ignore

a1 --> e1
a1 --> e2
a1 --> e3
a2 --> e2
a3 --> e3
    
@enduml
```

In this diagram:

- **Conditions** feed into **Rules**, defining the criteria for each rule.
- **Rules** link to **Triggers**, determining when the rules are evaluated.
- **Triggers** initiate **Actions**, specifying the actions to be taken.
- **Actions** lead to **Executions**, detailing the specific operations to be performed.
