---
sidebar_position: 3
---

# Enable EST for RA Profile

EST can be served in two ways:

- by an `EST Profile` with a default RA Profile, under the label of the EST Profile's name, and without a label when it is the system default;
- by an `RA Profile` with EST activated, under the label of the RA Profile's name, with the settings of the activated `EST Profile` and the issue attributes of the activation.

This page activates EST on the `RA Profile` with the name `ilm` and the UUID `e4d5552d-f1a6-4ac9-8c7c-7ec74c4b2739`, under the authority with the UUID `316720f9-ce67-4ccf-bdf6-a81f49b39147`. One `EST Profile` can be activated on many RA Profiles.

## Configure the `EST Profile`

Create the [`EST Profile`](est-profile.md) with the authentication policy and the other settings that the clients of the RA Profile need. It needs no default RA Profile when it serves only RA Profiles that activate it.

We create the `EST Profile` named `Sample-EST-Profile`, which accepts vendor client certificates issued under a trusted CA certificate of the inventory, using the [EST Profile API](/api/core-est#tag/est-profile-management/POST/v1/estProfiles):

```bash
curl -X POST \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '
  {
    "name": "Sample-EST-Profile",
    "description": "Sample EST Profile",
    "authenticationPolicy": "vendorMtls",
    "trustedCaCertificateUuids": ["72d7d882-9336-8a77-aa54-8d2fd83f7c37"]
  }' \
  https://[domain]:[port]/api/v1/estProfiles
```

The response holds the details of the new profile, among them its `uuid`, for example `26eea9d9-c5d5-4779-8a5d-117b1ce02aa5`.

A new `EST Profile` is disabled, and every request routed to a disabled profile is answered with `404`. Enable it using the [EST Profile API](/api/core-est#tag/est-profile-management/PATCH/v1/estProfiles/{uuid}/enable):

```bash
curl -X PATCH \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  https://[domain]:[port]/api/v1/estProfiles/26eea9d9-c5d5-4779-8a5d-117b1ce02aa5/enable
```

## Activate EST on the `RA Profile`

The name of the RA Profile becomes its EST label, so the activation is accepted only when the name:

- consists of letters, digits, `-`, `.`, `_` and `~`, and is not an operation name (`cacerts`, `csrattrs`, `simpleenroll`, `simplereenroll`, `serverkeygen`, `fullcmc`, in any letter case), `.` or `..`;
- is not the name of an `EST Profile`, since EST Profile names and the names of RA Profiles with EST activated share one namespace of labels. Once EST is activated, no `EST Profile` can be created with the name of the RA Profile.

The authority of the RA Profile must have a connector. The issue attributes of the activation are validated by that connector and added to every certificate issued through the RA Profile's label. List them with [Get issue Attributes](/api/core-ra-profile#tag/ra-profile-management/GET/v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/attributes/issue).

Activate EST on the `ilm` RA Profile with the [RA Profile API](/api/core-ra-profile), `PATCH /v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/protocols/est/activate/{estProfileUuid}`:

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
  https://[domain]:[port]/api/v1/authorities/316720f9-ce67-4ccf-bdf6-a81f49b39147/raProfiles/e4d5552d-f1a6-4ac9-8c7c-7ec74c4b2739/protocols/est/activate/26eea9d9-c5d5-4779-8a5d-117b1ce02aa5
```

The response names the activated `EST Profile` and the EST URL of the RA Profile:

```json
{
    "uuid": "26eea9d9-c5d5-4779-8a5d-117b1ce02aa5",
    "name": "Sample-EST-Profile",
    "estAvailable": true,
    "label": "ilm",
    "estUrl": "https://[domain]:[port]/.well-known/est/ilm",
    "issueCertificateAttributes": []
}
```

EST clients append the operation to this URL, for example `https://[domain]:[port]/.well-known/est/ilm/simpleenroll`. The URL is built from the host and scheme of the request that read it, so read it through the platform's public address. Requests to the label are answered with `404` while the RA Profile or the `EST Profile` is disabled. Activating EST again replaces the `EST Profile` and the issue attributes of the activation. The current activation is returned by `GET /v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/protocols/est`.

In the administrator interface, EST is activated with **Activate** in the **EST** row of the RA Profile's protocols, which selects the `EST Profile` and the issue attributes. Once EST is active, the row's details show the **Label** and the **EST URL**.

## Deactivate EST

Deactivate EST on the RA Profile with `PATCH /v1/authorities/{authorityUuid}/raProfiles/{raProfileUuid}/protocols/est/deactivate`. Its label is then free, and requests to it are answered with `404`. An `EST Profile` cannot be deleted while RA Profiles have it activated, unless it is force deleted, which deactivates EST on all of them; see [Operations](est-profile.md#operations).
