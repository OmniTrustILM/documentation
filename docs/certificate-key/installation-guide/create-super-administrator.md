---
sidebar_position: 5
---

# Create Super Administrator

When you deploy the platform for the first time, there are no Super Administrators and Administrators registered.

To register the first Administrator, you need to use `Local API`, which is accessible only from the `localhost` of the `Core` deployment. The `Local API` does not require the X.509 client certificate based authentication.

## Register first Administrator
You can use any tool or command line utility to access the `Local API` and register the first Administrator.

You need to provide the following information:

`first-admin.json`
```json
{
   "certificateData": "MIIDPTCCAiUCFBd+dfQuley5j4MetX3iewvIxHZDMA0GCSqGSIb3DQEBCwUAMF0xCzAJBgNVBAYTAkNaMRAwDgYDVQQIDAdDemVjaGlhMQswCQYDVQQHDAJDQjENMAsGA1UECgwEM0tFWTEMMAoGA1UECwwDREVWMRIwEAYDVQQDDAlsb2NhbGhvc3QwHhcNMjAwOTI1MTE1NDU3WhcNMzAwODA0MTE1NDU3WjBZMQswCQYDVQQGEwJDWjEQMA4GA1UECAwHQ3plY2hpYTELMAkGA1UEBwwCQ0IxCzAJBgNVBAoMAkNGMQwwCgYDVQQLDANERVYxEDAOBgNVBAMMB0NMSUVOVDEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC/SsO+9IzQ85xxyiT+ou8RDNxZMP0Ja8YKrdu19BTFjyLtVLpb+I1XqzlXFdJcObYZ5ZboyALB00i5Ds0TTs8ydgEeaw0K2O96DnGh4z5r4qLuF+fpVR+3A8kKRSrqJN1JNPFeb+NKsilUNvx5plZBm5+VTd64Sop6r1DALEDBS8AxRJSgp4x/oCq+T4zLh9XDyVUQ68axLgF86sS4YcBYKQVTH7KwRx+FGPFnBqt2ll2IherJ1N1dheXdLqzPYY+uIhs55wUPRhQibjiJhM9NgMYsmOPZRzsPIr6+gUil82rmSfyMg/A0wT4dsm6MT7ly6PPRyxoRvhNvfn96FsCRAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAI+YNR82n23p9014wa+99aEWJfujlirY07jhAQmsGTkkFM5QTNJzwi6VYnUwjlJMOXw8fEiBVRHUiyLV5RWZGiGZuLdCZgYCjtzCtWuOPidShAK5GpLDipG9upZ+RCNpBXVbb6J5tEI0esTSxZ/jwj2JqZZayhRmRXL/j8vGRn74atTILeFwUIYsSreoMI8wG1Rk0que09LgP1RmCiSl1GUSTL/lrK/dYaw0orZwUxzKg/KNnTYprYiAIVRsHUz8bkd6mGEBCfDdpEp0l7laBej2R8RhGDwuxjma1ZrwlCsKLlpdn2lwzqIEc+Zl7dxiLTb1NLMH80f4LCuF1iFCD6E=",
   "certificateUuid": "",
   "username":"adminadmin",
   "firstname":"admin",
   "lastname":"admin",
   "email":"admin@czertainly.com",
   "enabled":"true",
   "description": "First Administrator"
}
```

The following example is using `curl`:

```bash
curl -X POST \
 -H 'content-type: application/json' \
 -d @first-admin.json \
 https://localhost:8080/api/v1/local/admins 
```

Using the `wget`:

```bash
wget -O- --header='Content-Type:application/json' \
 --post-file=first-admin.json \
 http://localhost:8080/api/v1/local/admins
```

In this example, the Administrator with the following attributes will be registered in the RA Profiles with the corresponding certificate:
- **Firstname:** admin
- **Lastname:** admin
- **Username:** adminadmin
- **Email:** admin@czertainly.com
- **Role:** `SUPERADMINISTRATOR`
- **Description:** First Administrator
- <span class="badge badge--success">ENABLED</span>

You can use `Local API` multiple times, also in case you are locked out from the application.

:::warning
Use the `Local API` carefully, manage access to `localhost` of the system to avoid registration of unwanted Administrators.
:::