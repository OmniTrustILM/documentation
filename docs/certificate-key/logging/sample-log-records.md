---
sidebar_position: 99
---

# Sample Log Records

The following are sample logs for different operations in the CZERTAINLY platform in JSON format.

## Edit group

This log shows the operation of updating a group `DefaultGroup` by the user `tester`. 

```json
{
  "actor": {
    "name": "tester",
    "type": "user",
    "uuid": "7f5dd059-7a35-46ab-ab1e-a795fc7d03b6",
    "authMethod": "certificate"
  },
  "module": "core",
  "source": {
    "path": "/api/v1/groups/ca6b8d0e-9c40-415c-bf08-cb650bdc2a5a",
    "method": "PUT",
    "ipAddress": "0:0:0:0:0:0:0:1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "contentType": "application/json"
  },
  "audited": true,
  "message": null,
  "version": "1.0",
  "resource": {
    "type": "groups",
    "names": null,
    "uuids": ["ca6b8d0e-9c40-415c-bf08-cb650bdc2a5a"]
  },
  "operation": "update",
  "operationData": {
    "name": "DefaultGroup",
    "uuid": "ca6b8d0e-9c40-415c-bf08-cb650bdc2a5a"
  },
  "additionalData": {
    "uuid": "ca6b8d0e-9c40-415c-bf08-cb650bdc2a5a",
    "request": {
      "name": "DefaultGroup",
      "email": "",
      "description": "default one",
      "customAttributes": []
    }
  },
  "operationResult": "success",
  "affiliatedResource": null
}
```

## ACME directory

This log shows the operation of getting the ACME directory for the profile `acmetest`.

```json
{
  "actor": {
    "name": "acme",
    "type": "protocol",
    "uuid": "2b4c1277-f395-47e9-bf11-3a64fd5ecd7e",
    "authMethod": "userProxy"
  },
  "module": "protocols",
  "source": {
    "path": "/api/v1/protocols/acme/acmetest/directory",
    "method": "GET",
    "ipAddress": "127.0.0.1",
    "userAgent": "vscode-restclient",
    "contentType": null
  },
  "audited": true,
  "message": null,
  "version": "1.0",
  "resource": {
    "type": "acmeProfiles",
    "names": ["acmetest"],
    "uuids": null
  },
  "operation": "acmeDirectory",
  "operationData": null,
  "additionalData": {
    "acmeProfileName": "acmetest"
  },
  "operationResult": "success",
  "affiliatedResource": null
}
```

## Local Admin

This log shows the operation of creating a local admin `newadmin` which is allowed only from the localhost.

```json
{
  "actor": {
    "name": "localhost",
    "type": "user",
    "uuid": "b1098daa-0b6c-49ac-9b1d-14acb2c7c49f",
    "authMethod": "userProxy"
  },
  "module": "auth",
  "source": {
    "path": "/api/v1/local/admins",
    "method": "POST",
    "ipAddress": "127.0.0.1",
    "userAgent": "vscode-restclient",
    "contentType": "application/json"
  },
  "audited": true,
  "message": null,
  "version": "1.0",
  "resource": {
    "type": "users",
    "names": ["newadmin"],
    "uuids": null
  },
  "operation": "create",
  "operationData": {
    "uuid": "a355aba5-a0f0-471c-950f-aca0eba80a9c",
    "roles": ["superadmin"],
    "username": "newadmin"
  },
  "additionalData": {
    "request": {
      "name": "newadmin",
      "email": null,
      "enabled": null,
      "lastName": null,
      "username": "newadmin",
      "firstName": null,
      "groupUuids": [],
      "description": null,
      "certificateData": null,
      "certificateUuid": "c6828217-0a6b-49f9-a1f6-8f492322aecf",
      "customAttributes": null
    }
  },
  "operationResult": "success",
  "affiliatedResource": null
}
```
