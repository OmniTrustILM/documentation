---
sidebar_position: 7
---

# Get Discovery Results

Once the `Discovery` is completed, we can retrieve the results.
The results contain every item the `Discovery` found, certificates and keys, with where they were found and what became of them.

## Get `Discovery` results using the API

To get the items of a `Discovery`, we can use the following API:
```bash
curl -X GET \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Accept: application/json" \
  "https://[domain]:[port]/api/v1/discoveries/c0aaafda-a731-4175-8ec4-2cdcd06015fa/items?itemsPerPage=10&pageNumber=1"
  #https://[domain]:[port]/api/v1/discoveries/{uuid}/items
```

This returns one page of the items, in the order the `Discovery Provider` found them:
```json
{
  "items": [
    {
      "uuid": "8f6c1d2e-4b3a-4c5d-9e8f-0a1b2c3d4e5f",
      "inventory": {
        "uuid": "1257542a-02b9-4917-9193-df565c484ee3",
        "name": "www.example.com"
      },
      "sequence": 1,
      "uniqueRef": "db0d46499a56b00982ef6bf0a151c2445ca6cd712bcbb660c5b1901b49573564",
      "discoveredAt": "2026-10-05T09:12:40Z",
      "resource": "certificates",
      "payload": {
        "resource": "certificates",
        "certificateData": "MIIFKzCCBBOgAwIBAgISBE/IVI30lMz+BLpi8z9+5SIpMA0GCSqGSIb3DQEBCwUAMDIx..."
      },
      "newlyDiscovered": true,
      "processed": true,
      "meta": [ ... ]
    },
    {
      "uuid": "3a4b5c6d-7e8f-4a0b-8c1d-2e3f4a5b6c7d",
      "inventory": {
        "uuid": "6b0f2d1c-9a8e-4f7d-b6c5-4a3b2c1d0e9f",
        "name": "certKey_www.example.com"
      },
      "sequence": 2,
      "uniqueRef": "7c41e2b9d05a3f86e1c94b27a0d3f5e8c6b19d42a7e30f5b8c2d64e91a7f03bc",
      "discoveredAt": "2026-10-05T09:12:40Z",
      "resource": "keys",
      "payload": {
        "resource": "keys",
        "type": "Public",
        "algorithm": "RSA",
        "length": 2048,
        "fingerprint": "7c41e2b9d05a3f86e1c94b27a0d3f5e8c6b19d42a7e30f5b8c2d64e91a7f03bc",
        "publicKeyFormat": "SubjectPublicKeyInfo",
        "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq8cbDO3GAfjqqbPPCBdPostMcRmEubv85gXecll7mZMH5qSfTPuB..."
      },
      "newlyDiscovered": true,
      "processed": true,
      "meta": [ ... ]
    },
    ...
  ],
  "itemsPerPage": 10,
  "pageNumber": 1,
  "totalPages": 1,
  "totalItems": 6
}
```

- `resource` narrows the listing to one resource, for example `?resource=keys`, and `newlyDiscovered=true` to the items that were new to the inventory.
- `inventory` is the certificate or key the item became. A key that came into the inventory with its certificate is named after the certificate, as in the example. `inventory` is absent while a key waits to be imported, when it was not imported, and when the object was deleted later.
- `processedError` gives the reason when an item was not imported, for example a private key, which the platform lists but never imports.
- `meta` says where the `Discovery Provider` found the item, such as the host and port. A certificate or key that the `Network Discovery Provider` finds on several hosts is listed once, with the first place it was found.

The fields are described in the [API reference](/api/core-discovery#tag/discovery-management/GET/v1/discoveries/{uuid}/items). The certificates a `Discovery` found are also listed on their own by `GET /api/v1/discoveries/{uuid}/certificates`.

## Get `Discovery` results using the Web Interface

Steps to get `Discovery` results:

1. Click **Discoveries** in the left menu to display the **Discovery Store**
2. You can find `Discovery` easily by name `ILM Hostname Discovery`
3. Click `ILM Hostname Discovery` to display the `Discovery` detail
4. Open the **Results** tab

The **Results** tab shows one tab per resource, **Certificate** and **Key**, when the discovery targets more than one. Each lists **All** items, or only the **New** or **Existing** ones:

- **Discovered Certificates** lists the certificates, each linked to the certificate in the inventory. The **New** tab also shows the triggers evaluated on each certificate, and why a certificate could not be processed.
- **Discovered Key** lists the keys with their type, algorithm, size and fingerprint, each linked to the key once it is imported, and whether it is **Imported**, **Waiting** to be imported or **Not imported**, with the reason. Why a key is not imported is described in [Discovered keys](../../concept-design/modules/key-inventory.md#discovered-keys).
