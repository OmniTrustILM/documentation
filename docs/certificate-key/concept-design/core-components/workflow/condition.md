---
sidebar_position: 2
---

# Condition

Conditions are the foundational criteria used to evaluate whether specific operations should be executed within a workflow. They act as filters or checks that must be met for a workflow to proceed. Conditions ensure that actions are only triggered for objects that match the defined criteria.

## Condition attributes

| Attribute          | Description                                          |
|--------------------|------------------------------------------------------|
| **Condition Name** | A unique name for the condition.                     |
| **Description**    | A brief explanation of the condition's purpose.      |
| **Condition Type** | The type of condition.                               |
| **Resource**       | The object or entity to which the condition applies. |

## Condition types

Conditions can be classified into various types based on their evaluation mechanism. Each type has specific attributes and behaviors that determine how the condition is processed.

## Examples

We would like to illustrate the concept of conditions with a few examples:

**Matching conditions based on the certificate common name and public key algorithm:**

- **Condition Name:** Certificate CN contains `example.com`
- **Description:** This condition checks if the common name of a certificate contains the string `example.com`
- **Condition Type:** Check Field
- **Resource:** Certificate
- **Condition Items:** `Property 'Common Name' contains 'example.com'`

**Matching conditions based on the certificate public key algorithm:**

- **Condition Name:** Certificate Public Key Algorithm is RSA
- **Description:** This condition checks if the public key algorithm of a certificate is RSA
- **Condition Type:** Check Field
- **Resource:** Certificate
- **Condition Items:** `Property 'Public Key Algorithm' equals 'RSA'`

## Matching conditions based on regular expressions

Condition items can also use the `matches regex` operator.  
In such cases, the string being evaluated must comply with **POSIX Regular Expression syntax**, as this is the format used in [PostgreSQL regular expression functions](https://www.postgresql.org/docs/current/functions-matching.html#POSIX-SYNTAX-DETAILS).

:::warning[POSIX Regular Expressions]
When using the regular expressions operator in condition items, ensure that the regular expressions conform to POSIX syntax. This is crucial for accurate evaluation, as the platform relies on PostgreSQL's regular expression functions, which adhere to this standard.
:::

### Example use case: matching certificate Subject Alternative Name (SAN)

In the database, **Subject Alternative Names (SAN)** are serialized as JSON.  
An example SAN entry might look like this:

```json
{
  "dNSName": ["czertainly.com", "www.czertainly.com"],
  "directoryName": [],
  "ediPartyName": [],
  "iPAddress": ["156.88.27.150"],
  "otherName": [],
  "registeredID": [],
  "rfc822Name": [],
  "uniformResourceIdentifier": [],
  "x400Address": []
}
```

For any empty SAN type, the corresponding value is an empty array (`[]`).

### Example 1: checking if `registeredID` SAN is not empty

- **Condition Name:** Certificate SAN registeredID is not empty  
- **Description:** Checks whether the SAN field of a certificate contains one or more `registeredID` entries 
- **Condition Type:** Check Field  
- **Resource:** Certificate  
- **Condition Items:** `Property 'Subject Alternative Name' not matches regex '"registeredID"\s*:\s*\[\s*\]'`

This regular expression ensures that the `registeredID` field does **not** match an empty array (`[]`).

### Example 2: checking if `dNSName` SAN equals `czertainly.com`

For non-empty SAN fields, values are represented as strings in quotes, separated by commas.

- **Condition Name:** Certificate SAN dNSName equals `czertainly.com`  
- **Description:** Checks whether the SAN of a certificate contains a `dNSName` entry equal to `czertainly.com`
- **Condition Type:** Check Field  
- **Resource:** Certificate  
- **Condition Items:** `Property 'Subject Alternative Name' matches regex '"dNSName"\s*:\s*\[[^\]]*"\s*czertainly\.com\s*"[^]]*\]'`

This regular expression matches any SAN JSON that includes `czertainly.com` as one of the `dNSName` values.

> **Note:**  
> The same principles that apply to the `matches regex` operator in condition items also apply to the `matches regex` operator in search filters.
