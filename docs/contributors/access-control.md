---
sidebar_position: 8
---

# Access control

Authorization is an integral part of CZERTAINLY platform. Each authenticated user and their permissions are represented by internal authorization token which is evaluated using [Open Policy Agent](https://www.openpolicyagent.org/) (OPA) and pre-defined policies. For more information, refer to [Access Control](../certificate-key/concept-design/architecture/access-control/overview).

For more information about the definition of authorization policies, refer to [CZERTAINLY Auth OPA Policies](https://github.com/CZERTAINLY/CZERTAINLY-Auth-OPA-Policies) repository. Individual permissions are set for roles existing in `Auth` service which can then be assigned to users.

## Resources and actions

`Core` service works with different types of objects (entities) that are called **resources**. Each resource then has defined set of **actions** that are available for that particular resource. Available resources and actions are defined as `enum` type to easily refer to.

| Access Control Enum | Reference                                                                                                                                         |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| **Resources**       | [Resource enum](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/java/com/czertainly/core/model/auth/Resource.java)             |
| **Actions**         | [ResourceAction enum](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/java/com/czertainly/core/model/auth/ResourceAction.java) |

The list of available actions for particular resources is dynamically constructed by the `Core` service based on the `@ExternalAuthorization` annotation. Continue reading to get more details.

## Permissions object

The permissions object represents set of actions performed on resources that need to be evaluated. It conforms with the JSON data structure and is constructed by the `Auth` service and evaluated by the `OPA` service.

Individual permissions can be evaluated on two levels (represented by different OPA policies), generally if an action is allowed / denied on:
- resource level ([Method policy](https://github.com/CZERTAINLY/CZERTAINLY-Auth-OPA-Policies/blob/master/policies/method_policy.rego)), or
- on object level for specific object UUID. ([Objects policy](https://github.com/CZERTAINLY/CZERTAINLY-Auth-OPA-Policies/blob/master/policies/objects_policy.rego))

Example of permissions objects for some resource can be seen on following excerpt from authorization token:

```json
{
  "permissions": {
    "allowAllResources": false,
    "resources":
    [
      {
        "name": "raProfiles",
        "allowAllActions": false,
        "actions": [ "detail", "list" ],
        "objects": [
          {
            "name": "NG-RA-Profile1",
            "uuid": "d7d5b6e6-0335-4492-a994-6120751fced1",
            "allow": [],
            "deny": [ "detail" ]
          }
        ]
      },
      {
        "name": "certificates",
        "allowAllActions": true,
        "actions": [],
        "objects": []
      }
    ]
  }
}
```

In this example there are permissions defined for two resources:
- `raProfiles` and
- `certificates`.
  For `certificates` resource all actions are allowed and for `raProfiles` detail and list action on any RA Profile except RA Profile named *NG-RA-Profile1* where detail action is denied.

:::info[OPA evaluation input]
You can see [`input.json`](https://github.com/CZERTAINLY/CZERTAINLY-Auth-OPA-Policies/blob/master/samples/input.json) for a complete input sample for OPA evaluation.
:::

## `@ExternalAuthorization` annotation

Authorization process is triggered by accessing methods annotated with [`@ExternalAuthorization` annotation](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/java/com/czertainly/core/security/authz/ExternalAuthorization.java). Typically, public methods of service implementations are annotated with this annotation, to require authorization if service is called from anywhere across `Core` service.

Authorization mechanism itself is driven by [Spring framework](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html) security layer and custom implementations of `AccessDecisionVoter`.

For example, voter responsible for evaluating `method` policies extracts parameters of annotation of method that is being accessed and constructs input to include in request to OPA evaluation. Based on response from `OPA` service, result can be `ACCESS_GRANTED` or `ACCESS_DENIED`.

`@ExternalAuthorization` annotation has parameters to define two pairs of `Resource` and `ResourceAction`. One is for the resource that is being accessed and the second for parent resource. Both can be evaluated simultaneously to authorize access to resources in hierarchical dependency.
Resource and action names are codes for enums defined in `Core` service.

Specifying the parent resource/action is optional and its usage depends on the context, if method requires authorization for more resources. Typically, you can use evaluation of permissions together with parent resource when input of your method are two resources that are hierarchically related (e.g., concept of principal and dependent entities in DB).
But in case access to other resource is in separate corresponding service method, permissions for that resource can be evaluated separately in its own context (service).

:::info[Parent resource]
Even the name parent resource suggests some dependency between resources specified, you can use parent resource / action pair to evaluate any resource pair without any relation.
:::

For example, method annotated with
```java
@ExternalAuthorization(
  resource = Resource.RA_PROFILE,
  action = ResourceAction.DELETE,
  parentResource = Resource.AUTHORITY,
  parentAction = ResourceAction.DETAIL
)
```
means that accessing this method triggers evaluation of permissions for `delete` action on resource `raProfiles` and `detail` action on parent resource `authorities`. (Note: Between resource `raProfiles` and parent resource `authorities` is one-to-many relationship).

## Object access level permissions evaluation

In case we want to evaluate permissions for resource / action on object access level, `@ExternalAuthorization` annotation is combined with method parameters. Parameter representing UUID of object that should be evaluated needs to be of type `SecuredUUID`. To evaluate object access level for parent resource / action, we use similarly type `SecuredParentUUID`.

```java
@ExternalAuthorization(
  resource = Resource.RA_PROFILE,
  action = ResourceAction.DELETE,
  parentResource = Resource.AUTHORITY,
  parentAction = ResourceAction.DETAIL
)
public void deleteRaProfile(SecuredParentUUID authorityUuid, SecuredUUID uuid) throws NotFoundException {
    // your code
}
```

In the example above, we can see how annotation and method signature should look if we want to evaluate permissions to delete RA Profile object with UUID specified by parameter `uuid` and permissions to retrieve detail of object of parent resource authority with UUID specified by parameter `authorityUuid`.

If we have list of UUIDs to evaluate, we can use `List<SecuredUUID>` type in similar fashion:
```java
@ExternalAuthorization(
  resource = Resource.RA_PROFILE,
  action = ResourceAction.DELETE
)
public void bulkDeleteRaProfile(List<SecuredUUID> uuids) {
    // your code
}
```

Another use case for evaluation object access level permissions is when we want to filter list of retrieved objects to contain only objects that have allowed action specified in the annotation (usually applicable in listing endpoints).

This can be achieved by passing `SecurityFilter` object to method annotated with `@ExternalAuthorization`. `SecurityFilter` contains resource filters (for resource and parent resource from annotation) with a list of allowed and denied object UUIDs that are populated with response from OPA `object` policy evaluation. `SecurityFilter` can then be used for example to filter out records retrieved from DB.

If you want to automate retrieving records from database based on `SecurityFilter`, `Core` service offers generic implementation of `SecurityFilterRepository`. Its method `findUsingSecurityFilter` constructs query with `WHERE IN` and `WHERE NOT IN` conditions based on lists of allowed and denied UUIDs in security filter.
In case parent resource is set, it is necessary to set property of entity (representing resource object) that holds reference UUID for parent resource (DB table column). It can be done by setting `parentRefProperty` of `SecurityFilter`.

```java
@ExternalAuthorization(
  resource = Resource.RA_PROFILE,
  action = ResourceAction.LIST,
  parentResource = Resource.AUTHORITY,
  parentAction = ResourceAction.LIST
)
public List<RaProfileDto> listRaProfiles(SecurityFilter filter) {
    filter.setParentRefProperty("authorityInstanceReferenceUuid");
    return securityFilterRepository.findUsingSecurityFilter(filter).stream().map(RaProfile::mapToDtoSimple).collect(Collectors.toList());
}
```

In this example, we are using security filter to get filters for RA Profile objects that have permission for list action and their parent resource authority, too. Since `SecurityFilterRepository` is used to retrieve list of allowed RA profiles based on authorization, `parentRefProperty` of filter is set to `"authorityInstanceReferenceUuid"` which contains reference to `Authority` of `RaProfile` entity.

## How are resource and actions synchronized

To achieve that changes in available set of resources and their actions are reflected in role permissions, `Core` service manages changes automatically with the help of syncing mechanism.

When `Core` service starts, it collects all `@ExternalAuthorization` annotation instances and builds map of available resources and their actions. This information is then passed to `Auth` service which can then store role permissions with reference to corresponding resource/action.

This way, `Core` and `Auth` services are in sync and permissions can refer to all resources and actions that are actually used and require authorization.

## `@AuthEndpoint` annotation

In addition, you can mark resources to allow adding permissions on object access level. It can be achieved by annotating listing endpoint in the corresponding **controller** that can be used to list objects. The [annotation `@AuthEndpoint`](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/java/com/czertainly/core/auth/AuthEndpoint.java) is used to set object listing endpoint path for a resource which can be later used in permissions editor to dynamically retrieve available objects of that resource.

Example of using `@AuthEndpoint` annotation to mark RA profile resource to have object access level permissions:

```java
@AuthEndpoint(
  resourceName = Resource.RA_PROFILE
)
public List<RaProfileDto> listRaProfiles(Optional<Boolean> enabled) {
    return raProfileService.listRaProfiles(SecurityFilter.create(), enabled);
}
```

:::warning[Object `uuid` and `name` property]
Entity and DTO that is returned from listing endpoint which is representing resource that has object access level has to contain `name` property. That way any object can be properly labeled also with human readable name instead of its UUID. Without `name` property, objects will be identified only through its UUID.
:::

## Extending resources and actions

Finally, when you need to extend set of available resources and / or actions that can be used within platform access control, you need to do the following:
- add new items to `enums` specified in [Resources and actions](#resources-and-actions)
- annotate corresponding object listing endpoint with annotation [`@AuthEndpoint`](#authendpoint-annotation) to allow setting permissions on objects access level
- make sure that entity and response objects from listing endpoint contain `name` property
- implement methods with proper [`@ExternalAuthorization`](#externalauthorization-annotation) annotation properties
- map parameters of method representing object UUIDs to resources used in annotation by using correct parameter type `SecuredUUID` / `SecuredParentUUID` to evaluate [object access level permissions](#object-access-level-permissions-evaluation)
