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

Executions can be classified into various types based on the nature of the operation they perform. Each type has specific attributes and behaviors that determine how the execution is processed. The following execution types are supported:

- **`Set Field`** — sets a property or a custom attribute of the processed object. See [Set Field](#set-field) below for the details of source values and mapping rules.
- **`Send Notification`** — sends a notification using the configured notification profile.
- **`Renew certificate`** — renews the processed certificate when its renewal is due. See [Renew certificate](#renew-certificate) below.

### Set Field

A `Set Field` execution item has a **target** (the property or custom attribute being written) and a **source** (the value being written into it). The source can be one of:

- A **static value**, typed directly into the execution item.
- A **mapped attribute value**, read from another attribute on the same object at trigger evaluation time. The source attribute can be a [metadata](../../../settings/global-metadata.md) attribute, a connector-supplied **data** attribute, or a [custom attribute](../../../settings/custom-attributes.md). It is selected the same way a [condition](./condition.md) references an attribute.

**Rules for mapped sources:**

- Mapping from a source attribute is available only when the **target is a custom attribute**. Properties can be set from a static value only.
- The source attribute is **read-only** — its value is copied into the target, and the source itself (for example, connector-managed metadata) is never modified.
- The source attribute is matched by **name and content type**. The execution item is recorded as failed if the object has no matching attribute, or if the copied value is not valid for the target custom attribute.

### Renew certificate

A `Renew certificate` execution renews a certificate automatically once its [renewal window](../renewal-window.md) has started. It has no execution items: an execution of this type with items is refused. Its resource is `Certificate`, and it is meant for a trigger on the [Certificate renewal due](./event.md#certificate-renewal-due-event) event, which fires for each certificate that is due.

Automatic renewal is off by default. A certificate is renewed only when both of these are in place:

- **Enable Automatic Renewal** is on in the [renewal settings](../ra-profile.md#renewal-settings) of its `RA Profile`.
- A trigger on the **Certificate renewal due** event, for example in [Settings → Events](../../../settings/events.md) or on the `RA Profile`, has an action that runs a `Renew certificate` execution.

#### Renewal modes

How a certificate is renewed depends on where its private key lives. The mode is decided again at each firing:

| Mode | When | What happens |
|---|---|---|
| **Per location** (`location`) | At least one [`Location`](../location.md) of the certificate generates keys: the location is enabled, its entity provider manages keys, and the certificate's entry in it holds CSR and push attributes | In each such location a new key and CSR are generated, a new certificate is issued and pushed to the location. Each location gets its own new certificate and key. Locations that only received the certificate by push are not updated; one history entry names them |
| **With the key held by the platform** (`ilmKey`) | No location generates keys, the platform holds the private key of the certificate and has its stored certificate request | The certificate is renewed once with the same key and request. Once issued, the new certificate replaces the old one in every location that holds it |
| **Not possible** (`none`) | Neither | The certificate is not renewed. The reason is shown on the certificate detail and written once to its history |

When a certificate has both a key-generating location and a key held by the platform, it is renewed per location. The reasons why a certificate cannot be renewed are:

- `no key-generating location holds the certificate and the platform does not hold its private key`
- `no stored certificate request` — the platform holds the key, but not the request to renew it with

#### When the renewal starts

At the first firing in a window, the platform picks a random time between the start of the window, or now if later, and its end, and stores it. The certificate is renewed at the first firing after that time, so within an hour of it; when the window has already ended, it is renewed at once. Picking a random time spreads the renewals of many certificates over the window. A new window picks a new time.

A firing does nothing for a certificate, and records nothing, when:

- automatic renewal is off in its `RA Profile`, or the chosen time has not come
- a renewal started by an earlier firing is still pending, for example waiting for [approval](../approval-profile.md)
- someone else already renews the certificate: it has a successor that automatic renewal did not request
- the renewal has failed the **Maximum Renewal Attempts**, or is waiting after a failure

#### Failures and retries

A renewal fails when its request is refused, or when the new certificate is later found failed, rejected or deleted. A failure is written to the certificate history and to the trigger history, and the renewal is tried again after 1 hour, then 6 hours, then every 24 hours, until the **Maximum Renewal Attempts** of the `RA Profile` is reached. In the per-location mode each location is counted and retried on its own: a location that failed is tried again, and a location that succeeded is never renewed again in the same window. The **Certificate renewal due** event keeps firing until every location has its new certificate.

A location that no longer holds the old certificate is settled: with an issued new certificate it counts as done, and without one it is no longer tracked.

When the platform holds the key and the new certificate is issued but replacing the old one in a location fails, the renewal still counts as done. The failure is written to the certificate and trigger history, naming where the new and old certificates are, and is not retried. The new certificate replaces the old one in its locations only when the certificate authority issues it at once; with an authority that issues asynchronously, push it to the locations yourself.

#### Permissions of the trigger owner

The renewal runs as the owner of the trigger, the user who associated it. A trigger without an owner fails the action. The owner needs:

| Mode | Permissions |
|---|---|
| Per location | `Update` on each `Location` and `Detail` on its `Entity`; `Detail` and `Renew` on the certificate and `Members` on its `RA Profile`; `Detail` on the `RA Profile` and on its `Authority` |
| With the key held by the platform | `Renew` on the certificate; `Detail` on the `RA Profile` and on its `Authority` |

The `Renew` permission is checked when the queued renewal runs, unless an approval has already been given; without it the new certificate fails.

A missing permission fails the renewal with the reason, for example `the trigger owner may not update the location`.

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

**Renew certificates when their renewal is due:**

- **Execution Name:** Renew certificate
- **Description:** This execution renews the certificate when its renewal window has started
- **Execution Type:** Renew certificate
- **Resource:** Certificate
- **Execution Items:** none
