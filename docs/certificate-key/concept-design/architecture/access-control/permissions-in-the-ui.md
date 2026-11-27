---
sidebar_position: 8
---

# Permissions in the User Interface

:::info[New in 2.21.0]
The behavior described on this page is available from platform version 2.21.0.
:::

The web interface shows each user only the sections they can open, and offers only the operations they are allowed to run, so a user with restricted permissions is rarely led into an action that ends in "Access denied". Where the interface cannot know the answer in advance, as for actions on several checked rows, the platform decides when the request is sent.

:::warning[The server still decides]
Hiding a menu section or disabling a control is a convenience, not a security boundary. The platform enforces every permission on every request, as described in [Authorization](authorization.md). A request sent directly to the API for an operation the user is not allowed to run is refused, whatever the interface shows.
:::

## Hidden and disabled controls

The interface treats sections and operations differently:

| Element                                   | When the user may not use it                                            |
|-------------------------------------------|-------------------------------------------------------------------------|
| Menu section                              | Hidden.                                                                 |
| Button, page action, widget or row action | Shown disabled, with a tooltip saying which permission the user lacks. |

A disabled control explains itself in one of two ways:

- **You need the _action_ permission on _resource_.** The user's roles do not grant the action on the resource, for example _You need the Update permission on RA Profile._
- **Your permissions do not allow _action_ on this object.** The user holds the action on the resource, but not on this object, for example because the role denies the action on this object, or because the operation also needs access to a related object the user cannot use.

A user whose roles grant every action, such as `superadmin` or `admin`, is offered every operation.

## Menu sections

A section appears in the menu when the user may list its resource. The interface reads this from the `allowedListings` of the user profile, loaded once when the user signs in. The dashboard and approvals are listed for every user.

Every other resource is listed when the user holds the `list` action on it, either on the resource as a whole or on at least one of its objects. A `detail` grant on an object does not list the resource: the user can open that object by its link, but the section does not appear.

Beyond the list grant, two further rules apply:

- **Resources that can be assigned to a group and have no owner** are also listed for a user who holds the `members` action on at least one group.
- **Certificates, Keys and Secrets**, whose objects have an owner, are listed without a list grant only when the user:
  - holds the `create` action on the resource,
  - owns at least one of its objects, or
  - holds the `members` action on a group that one of its objects is assigned to, while that object is in no group on which the `members` action is denied.

A user with none of these does not see the section. A user who owns a secret, for example, sees Secrets in the menu, and the list holds the secrets that user may see.

## Operations on a resource

Operations that do not act on an existing object, such as **Add** on a list page, follow the resource-level grants the user profile carries in `allowedActions`. The profile holds these grants only: grants on individual objects, ownership and group access are not part of it.

On list pages, **Add** is disabled when the user does not hold the `create` action on the resource. **Delete** and the other actions applied to the checked rows depend on the resource:

- On resources whose objects can be owned or granted individually, such as Certificates, RA Profiles or Tokens, they stay available, and the platform decides for each object when the request is sent.
- On Keys, Secrets and resources without object access, whose endpoints check only the resource, they are disabled when the user does not hold the action on the resource.

## Operations on one object

On a detail page, the operations follow the user's access to that object, not only to its resource. Alongside the detail request, the interface asks the platform which actions the user may run on the object, and the answer counts everything that grants access to it:

- the user's grants on the resource as a whole,
- grants on that object only,
- [ownership](authorization.md#object-access-level-based-on-its-associations) of the object, which allows every action on it,
- [group access](authorization.md#object-access-level-based-on-its-associations), which allows listing and viewing the objects assigned to a group the user holds the `members` action on.

An owner, or a user granted actions on one RA profile only, therefore finds those actions enabled on that object and disabled, with a tooltip, on other objects of the same resource. The controls wait in a loading state until both the profile and the answer are in, so they do not flash between enabled and disabled. If the request fails, the page still loads, and the resource-level grants in the user profile decide.

Some operations check only the resource, not the object, and the interface reports them the way the platform enforces them. Certificate, key and secret lifecycle operations, such as renewing or revoking a certificate, are among them: an owner without the resource-level grant finds them disabled.

Some operations also require access to a related object, such as the authority of an RA profile, the token of a key or the vault profile of a secret. An operation is reported as allowed only when the user holds that access too.

## Allowed actions API

The interface uses two parts of the [Core API](/api/core-other#tag/resource-management), and any client can use them in the same way.

### User profile

[`GET /v1/auth/profile`](/api/core-auth#tag/authentication-management) returns the permissions of the signed-in user:

| Field             | Content                                                                                                                         |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `allowedListings` | Resources the user may list, following the [menu rules](#menu-sections). |
| `allowedActions`  | Actions the user holds on each resource as a whole. Resources on which the user holds no action are left out.                   |

Neither field can be derived from the other. Use `allowedListings` to decide whether to show a section, and `allowedActions` for any other resource-wide operation.

### Allowed actions on objects

`POST /v1/resources/{resource}/objects/allowed-actions` reports, for each object, the actions the caller may run on it.

```json title="Request"
{
  "uuids": ["9b1c6d3e-1f2a-4c5b-8d7e-0a1b2c3d4e5f"]
}
```

```json title="Response"
{
  "items": [
    {
      "uuid": "9b1c6d3e-1f2a-4c5b-8d7e-0a1b2c3d4e5f",
      "allowedActions": ["delete", "detail", "enable", "update"]
    }
  ]
}
```

- The request names between 1 and 1,000 objects.
- Each action is answered the way the endpoints that perform it are authorized. Where several endpoints perform the same action and check different things, the strictest decides, so every reported action is accepted.
- Objects the caller may neither list nor view are left out of the answer, in the same way as objects that do not exist, so the endpoint cannot be used to find objects.
- Actions that do not act on an existing object, such as `create` and `list`, are not reported.
- The resource must be one whose objects are identified by a UUID and authorized individually. Any other resource, and a request with no objects, more than 1,000 objects or an empty entry, is refused with status `422`.

Detail responses are unchanged. A client that does not ask for allowed actions pays nothing for them.

## Lists and group access

:::info[Changed in 2.21.0]
Lists of certificates, keys and secrets apply group access the same way as their detail pages. A user who holds the `members` action on groups sees in the list every grouped object they can open:

- an object assigned to several allowed groups appears once, and list counts and dashboard statistics count it once;
- a user who holds the `members` action on every group sees every grouped object;
- an object that is also in a group on which the `members` action is denied is not listed, as its detail page is refused.

A deny on a group removes only the access that group gives. It does not affect the object's owner, or a user granted the action on the resource or on the object.
:::
