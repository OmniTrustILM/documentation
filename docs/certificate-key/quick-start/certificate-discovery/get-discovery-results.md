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
        "name": "discovered_7c41e2b9d05a3f86e1c94b27a0d3f5e8c6b19d42a7e30f5b8c2d64e91a7f03bc_1f3a9c2e"
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
    }
  ],
  "itemsPerPage": 10,
  "pageNumber": 1,
  "totalPages": 1,
  "totalItems": 2
}
```

- `resource` narrows the listing to one resource, for example `?resource=keys`, and `newlyDiscovered=true` to the items that were new to the inventory.
- `inventory` is the certificate or key the item became. It is absent while a key waits to be imported, when it was not imported, and when the object was deleted later.
- `processedError` carries the reason when an item was not imported or could not be processed, for example for a private key, which the platform lists but never imports.
- `uniqueRef` is the `Discovery Provider`'s reference for the item. The `Network Discovery Provider` uses the fingerprint of the certificate or the key.
- `meta` says where the `Discovery Provider` found the item, such as the host and port.

The fields are described in [Items](../../concept-design/modules/certificate-discovery.md#items). The certificates a `Discovery` found are also listed on their own, with their subject, issuer and validity, by `GET /api/v1/discoveries/{uuid}/certificates`.

## Get `Discovery` results using the Web Interface

Steps to get `Discovery` results:

1. Click **Discoveries** in the left menu to display the **Discovery Store**
2. You can find `Discovery` easily by name `ILM Hostname Discovery`
3. Click `ILM Hostname Discovery` to display the `Discovery` detail
4. Open the **Results** tab

On the **Details** tab, the **Resources** row of **Discovery Details** names what the discovery targeted, and the **Results** widget counts the items received, new to the inventory, imported and not imported. For a discovery that targets certificates, it also counts the distinct certificates saved and the certificate items the provider reported.

The **Results** tab shows one tab per resource, **Certificate** and **Key**, when the discovery targets more than one; otherwise it shows the one resource directly. Each lists **All** items, or only the **New** or **Existing** ones. When the discovery was cancelled or failed, a note says that nothing it found was imported into the inventory and no triggers ran on it.

**Discovered Certificates** lists the **Common Name**, which links to the certificate in the inventory, **Serial Number**, **Not After**, **Not Before**, **Issuer Common Name** and **Fingerprint**. The **New** tab also shows the **Triggers** evaluated on each certificate, and an information symbol that opens the **Processing error** of a certificate that could not be processed. Triggers are evaluated once per unique certificate, so a certificate found in several places shows them on one of its rows, and the cell stays empty on the others.

**Discovered Key** lists the keys:

| Column      | Description |
|-------------|-------------|
| Name        | The key in the key inventory, linked, once the key is imported |
| Type        | Public, private, secret or split key |
| Algorithm   | The key's algorithm |
| Size        | The key's size |
| Format      | The format of the public key, when one was reported |
| Fingerprint | The fingerprint the provider reported |
| Discovered  | When the provider found the key |
| State       | **Imported**; **Not imported**, in warning colour, with the reason shown when you point at it; or **Waiting** while the key is not processed yet |
| Public key  | An eye symbol that opens the **Public key** dialog, with the key's format, its value, and **Copy public key** to copy it. Private, secret and split keys have none |
| Details     | An information symbol that opens the item: its position in the run and the provider's reference as the title, the reason when it was not imported, and the payload and metadata the provider reported |

A private, secret or split key is listed as **Not imported**: the platform imports only keys with a public part. See [Discovered keys](../../concept-design/modules/key-inventory.md#discovered-keys).
