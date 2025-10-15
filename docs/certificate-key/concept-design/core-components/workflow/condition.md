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

- **Condition Name:** Certificate CN contains example.com
- **Description:** This condition checks if the common name of a certificate contains the string "example.com"
- **Condition Type:** Check Field
- **Resource:** Certificate
- **Condition Items:** `Property 'Common Name' contains 'example.com'`

**Matching conditions based on the certificate public key algorithm:**

- **Condition Name:** Certificate Public Key Algorithm is RSA
- **Description:** This condition checks if the public key algorithm of a certificate is RSA
- **Condition Type:** Check Field
- **Resource:** Certificate
- **Condition Items:** `Property 'Public Key Algorithm' equals 'RSA'`


**Matching conditions based on regex:**

Condition item can also consist of matches regex operator. In that case, the string being matched against must comply to POSIX Regular Expression, as it is the format used in [Postgres](https://www.postgresql.org/docs/current/functions-matching.html#POSIX-SYNTAX-DETAILS). For example, regex expressions can be used to create conditions for certifcate Subject Alternative Name. In database, SAN are serialized as JSON of the names. An example of such entry is 
```json
{"dNSName":["3key.company","www.3key.company"],"directoryName":[],"ediPartyName":[],"iPAddress":["156.88.27.150"],"otherName":[],"registeredID":[],"rfc822Name":[],"uniformResourceIdentifier":[],"x400Address":[]}
```
For each empty name, the corresponding value is `[]`. Condition for selecting certificates with `registeredID` SAN not empty would be as follows:

- **Condition Name:** Certificate SAN registeredID is not empty
- **Description:** This condition checks if SAN of a certificate contains any registeredId
- **Condition Type:** Check Field
- **Resource:** Certificate
- **Condition Items:** `Property 'Subject Alternative Name' not matches regex '"registeredID"\s*:\s*\[\s*\]'`

For not empty names, values are strings in quotes separated by commas. Condition for selecting certificates with `dNSName` SAN equal to `3key.company` would be as follows:

- **Condition Name:** Certificate SAN dNSName equals 3key.company
- **Description:** This condition checks if SAN of a certificate contains a dNSName equal to 3key.company
- **Condition Type:** Check Field
- **Resource:** Certificate
- **Condition Items:** `Property 'Subject Alternative Name' matches regex '"dNSName"\s*:\s*\[[^\]]*"\s*3key\.company\s*"[^]]*\]'`

:::info
The same principles as for `matches regex` operator in condition items hold for `matches regex` operator in search filters.
:::
 
