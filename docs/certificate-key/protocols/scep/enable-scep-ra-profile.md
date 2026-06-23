---
sidebar_position: 7
---

# Enable SCEP for RA Profile

Let's assume we would like to enable `SCEP Profile` for the `RA Profile` with name `czertainly` and know UUID `e4d5552d-f1a6-4ac9-8c7c-7ec74c4b2739`.

We need to follow simple steps to enable the SCEP service:
- Configure and enable `SCEP Profile`
- Enable SCEP protocol for `RA Profile`

The SCEP service can be also enabled based on the `SCEP Profile` configuration only if you select the default `RA Profile`. Then all request coming to the `SCEP Profile` URL will be processed by the default `RA Profile`.

## Configuration of `SCEP Profile`

First step is to configure the [`SCEP Profile`](./scep-profile.md). It will create an instance of the SCEP service with specific attributes that will be used to control the certificate management process and SCEP clients will need to follow. You can create as many `SCEP Profiles` as you need. Each of them can have a different configuration, challenge password, renewal conditions, server certificate, etc.

Configuration of the default `RA Profile` is optional, we will enable SCEP protocol for a specific `RA Profile` instead of it with name `czertainly`. Let's do this in `czertainly` `RA Profile` configuration.

We will create `SCEP Profile` named `SCEP CZERTAINLY Profile` using the [Core SCEP API](/api/core-scep):
```bash
curl -X POST \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '
  {
    "name": "SCEP CZERTAINLY Profile",
    "description": "Sample SCEP Profile",
    "caCertificateUuid": "72d7d882-9336-8a77-aa54-8d2fd83f7c37"
  }' \
  https://[domain]:[port]/api/v1/scepProfiles
```

When the `SCEP Profile` is successfully created, its `uuid` is sent back:
```json
{
  "uuid": "26eea9d9-c5d5-4779-8a5d-117b1ce02aa5"
}
```

## Enable SCEP protocol for `RA Profile`

Once the `SCEP Profile` is configured and enabled, we can enable SCEP protocol for the `RA Profile` with name `czertainly`. For that purpose, we will use the [`Core RA Profile API`](/api/core-ra-profile/#operation/activateScepForRaProfile). We will need to configure `Attributes` to issue certificates, if there are any available and supported in the `RA Profile`. These `Attributes` will be statically attached to all requests coming from the SCEP client.

You can get the list of `Attributes` using the following APIs:
- [Get issue Attributes](/api/core-ra-profile#tag/RA-Profile-Management/operation/listRaProfileIssueCertificateAttributes)

We will enable SCEP protocol for `czertainly` `RA Profile`:
```bash
curl -X PATCH \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '
  {
    "issueCertificateAttributes": []
  }' \
  https://[domain]:[port]/api/v1/authorities/316720f9-ce67-4ccf-bdf6-a81f49b39147/raProfiles/e4d5552d-f1a6-4ac9-8c7c-7ec74c4b2739/scep/activate/26eea9d9-c5d5-4779-8a5d-117b1ce02aa5
  #https://[domain]:[port]v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/scep/activate/{scepProfileUuid}
```

When succeed, we will receive in the response SCEP server directory endpoint to use:
```json
{
    "uuid": "06d287f5-2b03-42a6-b40e-b98707ba4851",
    "name": "SCEP CZERTAINLY Profile",
    "scepAvailable": true,
    "url": "https://[domain]:[port]/api/v1/protocols/scep/raProfile/ilm/pkiclient.exe",
    "issueCertificateAttributes": []
}
```

Now we have the SCEP protocol enabled for `RA Profile` with name `czertainly`, based on the `SCEP Profile` with name `SCEP CZERTAINLY Profile`.
