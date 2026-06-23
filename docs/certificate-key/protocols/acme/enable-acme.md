---
sidebar_position: 7
---

# Enable ACME

Before the platform can be used as ACME server, it must be configured.

For the purpose of this guide. we will assume that the ACME protocol should be enabled for the `RA Profile` with name `ilm` and know UUID `61c7d882-9336-4c9e-b380-8d2fd83f7c26`.

We need to follow simple steps to enable the ACME server:
- Configuration of `ACME Profile`
- Enable ACME protocol for `RA Profile`

The ACME server can be also enabled based on the `ACME Profile` configuration only if you select the default `RA Profile`.

## Configuration of `ACME Profile`

First step is to configure the [`ACME Profile`](acme-profile.md). It will create an instance of the ACME server with specific attributes that will be used to control the certificate management process and ACME clients will need to follow. You can create as many `ACME Profiles` as you need. Each of them can have a different configuration, validation limits, terms of service, etc.

We do not need to configure default `RA Profile`, we will enable ACME protocol for a specific `RA Profile` with name `ilm`. Let's do this in `ilm` `RA Profile` configuration.

We will create `ACME Profile` named `ACME ILM Profile` using the [Core ACME API](/api/core-acme/#operation/createAcmeProfile):
```bash
curl -X POST \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '
  {
    "name": "ACME ILM Profile",
    "description": "Sample ACME Profile",
    "termsOfServiceUrl": "https://www.example.com/termsOfService",
    "websiteUrl": "https://www.example.com",
    "dnsResolverIp": "8.8.8.8",
    "dnsResolverPort": "53",
    "retryInterval": 60,
    "validity": 3000,
    "requireContact": true,
    "requireTermsOfService": true
  }' \
  https://[domain]:[port]/api/v1/acmeProfiles
```

When the `ACME Profile` is successfully created, its `uuid` is sent back:
```json
{
  "uuid": "b6be5014-b8f8-4b4f-b96d-a54c38f54b48"
}
```

## Enable ACME protocol for `RA Profile`

Once the `ACME Profile` is ready, we can enable ACME protocol for the `RA Profile` with name `ilm`. For that purpose, we will use the [`Core RA Profile API`](/api/core-ra-profile/#operation/activateAcmeForRaProfile). We will need to configure `Attributes` to issue and revoke certificates, if there are any available and supported in the `RA Profile`. These `Attributes` will be statically attached to all ACME requests that are processed.

You can get the list of `Attributes` using the following APIs:
- [Get issue Attributes](/api/core-ra-profile#tag/RA-Profile-Management/operation/listRaProfileIssueCertificateAttributes)
- [Get revocation Attributes](/api/core-ra-profile#tag/RA-Profile-Management/operation/listRaProfileRevokeCertificateAttributes)

We will enable ACME for `ilm` `RA Profile`:
```bash
curl -X POST \
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
  https://[domain]:[port]/api/v1/authorities/61c7d882-9336-4c9e-b380-8d2fd83f7c26/raProfiles/d1a95ebc-4d73-11ed-bdc3-0242ac120002/acme/activate/b6be5014-b8f8-4b4f-b96d-a54c38f54b48
  #https://[domain]:[port]v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/acme/activate/{acmeProfileUuid}
```

When succeed, we will receive in the response ACME server directory endpoint to use:
```json
{
    "uuid": "b6be5014-b8f8-4b4f-b96d-a54c38f54b48",
    "name": "ACME ILM Profile",
    "directoryUrl": "https://[domain]:[port]/api/v1/protocols/acme/raProfile/ilm/directory",
    "issueCertificateAttributes": [],
    "revokeCertificateAttributes": [],
    "acmeAvailable": true
}
```

Now we have the ACME protocol enabled for `RA Profile` with name `ilm`, based on the `ACME Profile` with name `ACME ILM Profile`.
