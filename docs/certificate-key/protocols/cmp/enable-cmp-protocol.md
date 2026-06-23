---
sidebar_position: 7
---

# Enable CMP Protocol

Let's assume we would like to enable `CMP Profile` for the `RA Profile` with name `czertainly` and know UUID `e4d5552d-f1a6-4ac9-8c7c-7ec74c4b2739`.

We need to follow simple steps to enable the CMP service:
- Configure and enable `CMP Profile`
- Enable CMP protocol for `RA Profile`

The CMP service can be also enabled based on the `CMP Profile` configuration only if you select the default `RA Profile`. Then all request coming to the `CMP Profile` URL will be processed by the default `RA Profile`.

## Configuration of `CMP Profile`

First step is to configure the [`CMP Profile`](./cmp-profile.md). It will create an instance of the CMP service with specific attributes that will be used to control the certificate management process and CMP clients will need to follow. You can create as many `CMP Profiles` as you need. Each of them can have a different configuration.

Configuration of the default `RA Profile` is optional, we will enable CMP protocol for a specific `RA Profile` with name `czertainly`. Let's do this in `czertainly` `RA Profile` configuration.

We will create `CMP Profile` named `CMP-ILM` using the [Core CMP API](/api/core-cmp/#operation/createCmpProfile):
```bash
curl -X POST \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '
  {
    "name": "CMP-ILM",
    "description": "Sample CMP Profile",
    "variant": "v2",
    "requestProtectionMethod": "sharedSecret",
    "sharedSecret": "mySecret",
    "responseProtectionMethod": "sharedSecret"
  }' \
  https://[domain]:[port]/api/v1/cmpProfiles
```

When the `CMP Profile` is successfully created, its `uuid` is sent back, for example:
```json
{
  "uuid": "94720dc8-6d94-488b-9949-5dac0485c375",
  "name": "CMP-ILM",
  "enabled": false,
  "variant": "v2",
  "description": "Sample CMP Profile",
  "customAttributes": [],
  "requestProtectionMethod": "sharedSecret",
  "responseProtectionMethod": "sharedSecret"
}
```

## Activate CMP protocol

The `CMP Profile` is disabled by default. To enable it, we need to activate it using the [Core CMP API](/api/core-cmp/#operation/editCmpProfile):
```bash
curl -X PATCH \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  https://[domain]:[port]/api/v1/cmpProfiles/94720dc8-6d94-488b-9949-5dac0485c375/enable
  #https://[domain]:[port]/api/v1/cmpProfiles//{cmpProfileUuid}/enable
```

You should receive `204` HTTP response when the `CMP Profile` is successfully enabled.

## Enable CMP protocol for `RA Profile`

Once the `CMP Profile` is configured and enabled, we can enable CMP protocol for the `RA Profile` with name `czertainly`. For that purpose, we will use the [`Core RA Profile API`](/api/core-ra-profile/#operation/activateCmpForRaProfile). We will need to configure `Attributes` to issue certificates, if there are any available and supported in the `RA Profile`. These `Attributes` will be statically attached to all requests coming from the CMP client.

You can get the list of `Attributes` using the following APIs:
- [Get issue Attributes](/api/core-ra-profile#tag/RA-Profile-Management/operation/listRaProfileIssueCertificateAttributes)

We will enable CMP protocol for `czertainly` `RA Profile`:
```bash
curl -X PATCH \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '
  {
    "issueCertificateAttributes": [],
    "revokeCertificateAttributes": []
  }' \
  https://[domain]:[port]/api/v1/authorities/316720f9-ce67-4ccf-bdf6-a81f49b39147/raProfiles/e4d5552d-f1a6-4ac9-8c7c-7ec74c4b2739/protocols/cmp/activate/94720dc8-6d94-488b-9949-5dac0485c375
  #https://[domain]:[port]/api/v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/protocols/cmp/activate/{cmpProfileUuid}
```

When succeed, we will receive in the response CMP server endpoint to use:
```json
{
  "uuid": "94720dc8-6d94-488b-9949-5dac0485c375",
  "name": "CMP-ILM",
  "cmpAvailable": true,
  "cmpUrl": "https://[domain]:[port]/api/v1/protocols/cmp/raProfile/ilm",
  "issueCertificateAttributes": [],
  "revokeCertificateAttributes": []
}
```

Now we have the CMP protocol enabled for `RA Profile` with name `czertainly`, based on the `CMP Profile` with name `CMP-ILM`.
