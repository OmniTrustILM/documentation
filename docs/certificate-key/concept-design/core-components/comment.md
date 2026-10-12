---
sidebar_position: 24
---

# Comments

A `Comment` is a message attached to an object in the platform inventory. Comments let a user raise a request, ask a question or record a decision on the object it concerns, instead of in email or chat, so the reasoning stays with the object, is attributable to its author and is recorded in the [audit log](../../logging/audit-logs.md).

Comments are meant for collaboration between platform users who hold different permissions. A user who can read an object but cannot change it can still comment on it, and a user who holds the `Comment` permission, such as the one who can make the change, can reply and resolve the thread in the same place.

## Supported objects

The comment panel is shown on the detail page of the following objects:

| Group    | Objects                                                                                                                                                      |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Inventory | Certificates, cryptographic keys, tokens, discoveries, secrets, vaults, authorities, entities, locations, connectors, approvals                              |
| Profiles | RA profiles, vault profiles, compliance profiles, approval profiles, notification profiles, signing profiles, token profiles, ACME, SCEP, CMP and TSP profiles |

The panel, its controls and its behavior are the same on every one of them. Certificate requests and the objects owned by a connector are not commentable.

:::note[Approval comments]
A comment thread on an **approval object** is the feature described here. The comment an approver enters when approving or rejecting a request is part of the approval decision, is recorded with it, and is not affected by this feature. See [Approvals](../architecture/approvals.md).
:::

When an object is deleted, its comments are deleted with it.

## Threads and replies

Comments are organized in threads that are one level deep:

- A comment written directly on an object opens a **thread**. This first comment is the **thread root**.
- A **reply** is a comment written under a thread root. A reply to a reply is not possible.

Both threads and replies are listed in pages. The administrator interface shows the newest comments first, for threads and for replies alike, and remembers the direction you choose in your browser. The Comments API lists oldest first unless a sort direction is requested.

A comment records its author and the time it was written. Comments cannot be edited. To correct a comment, delete it and write a new one.

### Resolving a thread

The thread root can be marked as **resolved** when the matter it raised is settled, and reopened later. The platform records who resolved the thread and when, and the thread shows the resolved mark. Resolving is quiet: unresolved threads carry no badge or counter, and a resolved thread stays visible and accepts replies.

A thread can be resolved or reopened by the author of the thread root, or by any user who holds the `Comment` permission on the object. Resolving does not require permission to change the object.

### Deleting comments

| Comment                                                  | Who can delete it                                                                          |
|----------------------------------------------------------|--------------------------------------------------------------------------------------------|
| Reply                                                    | Its author, the owner of the object, or a user who may update the object                   |
| Thread root with no replies, or only replies by its author | Its author, the owner of the object, or a user who may update the object                   |
| Thread root with a reply by another user                 | Only the owner of the object, or a user who may update the object                          |

Deleting a thread root deletes all of its replies. The rule exists so that the author of a thread cannot erase what other users have said in it. The administrator interface asks for confirmation before deleting, and says so when replies will be deleted too.

Every comment a deletion destroys, including replies deleted together with their thread, is written to the audit log with its text.

## Permissions

Reading and writing comments are governed separately.

| Operation                                       | Required permission                                                                                       |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Read comments of an object                      | The permission to read the object. There are no private or internal-only comments                          |
| Post a thread or a reply                        | The `Comment` action on the object                                                                        |
| Resolve or reopen a thread                      | Author of the thread root, or the `Comment` action on the object                                          |
| Delete a comment                                | See [Deleting comments](#deleting-comments)                                                               |

The `Comment` action is a permission of its own. It is not implied by the permission to update an object, and it can be granted to users who cannot change the object at all, which is its intended use.

### How the permission is granted

Where the `Comment` action must be granted depends on the kind of object, in the same way as the other actions:

| Object                                                          | `Comment` must be granted                                                                     |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Tokens, vaults, authorities, entities, locations, connectors and all profiles except approval and notification profiles | On the object itself, or on the whole resource           |
| Certificates                                                    | On the whole resource, and the user must also be a member of the certificate's RA profile      |
| Cryptographic keys                                              | On the whole resource, and the user must also be a member of the key's token                   |
| Secrets                                                         | On the whole resource, and the user must also be a member of the secret's vault profile        |
| Discoveries, approvals, approval profiles and notification profiles | On the whole resource                                                                     |

Access to an object through a group lets a user read its comments, but posting still requires the `Comment` action. See [Roles and Permissions](../architecture/access-control/roles-permissions.md) for how to grant actions.

:::info
The `auditor` role never includes the `Comment` action, because it is a read-only role. To let a specific person comment, grant them a separate role that contains the `Comment` action. See [Auditor role](../architecture/access-control/roles-permissions.md#auditor-role).
:::

## Formatting comments in Markdown

The text of a comment is written in Markdown. It is stored exactly as typed, up to 65,536 characters, and the composer offers a preview before posting.

Comments are displayed in a restricted subset of Markdown, so that one user's text cannot change or disturb what another user sees:

| Supported                                                              | Notes                                                                                           |
|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| Paragraphs, line breaks, emphasis, strong emphasis, strikethrough       |                                                                                                 |
| Inline code and code blocks                                            | The language hint of a code block is ignored                                                    |
| Ordered and unordered lists, block quotes                              |                                                                                                 |
| Tables                                                                 | Column alignment is ignored                                                                     |
| Headings                                                               | Displayed two levels smaller than written, so a comment never produces a page-level heading     |
| Links with `http`, `https` or `mailto` addresses                       | Open in a new tab. Links with any other address are shown as plain text                         |

The following is **not** rendered: raw HTML is shown as literal text, images are replaced by their alternative text, and embedded content, forms, scripts and styles are not supported.

This restriction applies to how comments are displayed in the administrator interface, in the comment panel and in the preview. The text itself is stored exactly as typed. The audit log and notification payloads carry the Markdown source, not rendered output, and it is up to the receiving system to display it as plain text.

## Notifications

Commenting raises two [events](./workflow/event.md#supported-events), **Comment created** and **Comment resolved**. A comment notification identifies the comment it is about: opening it in the administrator interface leads to the object, the page of the comment panel that contains the thread, and expands the thread. If the comment has been deleted in the meantime, the panel says so.

Reopening a resolved thread raises **Comment resolved** as well, with the thread marked as no longer resolved.

### Built-in notifications

Without any configuration, the people who take part in the conversation are told through internal notifications, on a new thread, a reply, a resolution and a reopening:

- the **owner** of the object, who is told about every comment event on it, including threads they have not joined, because they are usually the user able to act on a request;
- the **participants of the thread**: the author of the thread root and everyone who replied.

The user who performed the action is never notified of it. A participant who can no longer read the object is not notified.

### Notification profiles

Operators can also have comment events delivered through [notification profiles](./notification-profile.md) by associating a profile with the **Comment created** or **Comment resolved** event. Nothing is delivered through a profile unless it is associated.

The association can be made globally in [Settings → Events](../../settings/events.md), or for a specific [group](./group.md). A group-scoped association applies to comments on objects that belong to that group, which lets a team subscribe to the comment activity on its own objects.

:::warning
A profile that delivers through an external notification provider sends the comment text as written by the user to every recipient of the profile. Comments are free text and may quote information from the object. Size the recipient list of a profile bound to comment events accordingly, and prefer group-scoped associations over a broad global one. Internal notifications carry a summary and the identifiers of the comment, not its text.
:::

## Audit

Every operation on comments is written to the [audit log](../../logging/audit-logs.md) under the resource `Comment`: listing, creating, resolving, reopening and deleting. Each record names the object the comment belongs to. Creating, resolving, reopening and deleting also record the text of the comment; listing records do not. For a deletion, the record contains the text of every comment destroyed, including replies deleted together with their thread.
