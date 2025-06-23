---
sidebar_position: 4
---

# Rule

Rules are collections of conditions that are evaluated to decide whether an action should be initiated. A rule can include multiple conditions, and the relationship between these conditions dictates how the rule is evaluated. Rules are essential in defining complex criteria that determine workflow actions.

## Rule attributes

| Attribute       | Description                                                        |
|-----------------|--------------------------------------------------------------------|
| **Rule Name**   | A unique name for the rule.                                        |
| **Description** | A brief explanation of the rule's purpose.                         |
| **Resource**    | The object or entity to which the rule applies.                    |
| **Conditions**  | The conditions that must be met for the rule to trigger an action. |

:::note
Rule can support resource `Any`, which allows to combine conditions with different resources. It is useful in case we want to reuse same rule/condition in multiple triggers.
:::

## Rule evaluation

Rules are evaluated based on the conditions they contain. All the conditions within a rule must be met for the rule to be evaluated as matching. The evaluation logic determines how the conditions are processed and whether the rule is triggered.

The conditions within a rule must use the same resource type to ensure that the evaluation is consistent. If a rule contains conditions for different resources, the evaluation may not yield the expected results.

## Examples

We would like to illustrate the concept of rules with a few examples:

**Rule for example.com:**

- **Rule Name:** Certificates with CN containing example.com and Public Key Algorithm is RSA
- **Description:** This rule triggers an action for certificates with a common name containing "example.com" and a public key algorithm of RSA
- **Resource:** Certificate
- **Conditions:** `Certificate CN contains "example.com"`, `Certificate Public Key Algorithm is RSA`
