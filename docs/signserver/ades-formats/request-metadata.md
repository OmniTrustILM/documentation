---
sidebar_position: 25
---

# Request Metadata

Request metadata is used to control the signing process for the AdES signature formats.
The following document describes available metadata fields that can be specified.
Any request that does not contain any of the following metadata is considered to be a normal signing operation as defined by the SignServer framework.

## `RETURN_DTBS_ONLY`

When you need to split the signing process into two steps, you can use the `RETURN_DTBS_ONLY=true` metadata to indicate that the Signer should only return the Data To Be Signed (DTBS). In this case Signer returns only formatted data to be signed of the uploaded data and not the signed data. The private key is not used in this case.

Using this metadata, the Signer will respond with the JSON with the following structure:
```json
{
  "dtbs": "Base64 encoded data to be signed, formatted according the Signer's format",
  "digestAlgorithm": "Digest algorithm specified for the Signer"
}
```

Returned DTBS data can be used further by the external application or system to authorize signing process and to generate signature activation data that are used to activate the private key and to sign the data as the second step.

:::warning
The `RETURN_DTBS_ONLY` metadata is only supported for the Signers that provide deterministic data to be signed. This restriction is applied to be able to guarantee that the signature activation data contains the same data to be signed and the signing process can be finished in the second step. Without deterministic behaviour, the signature process will fail.
:::

## B-level attributes

The B-level signed attributes can be controlled using the request metadata fields.
When the B-level property is present in the request metadata, it will override the value configured in the Signer.

See [B-level Properties](./common-properties/blevel-properties.mdx) for the list of all available B-level properties.

The request metadata should contain the name of the B-level property and the value, for example:
```properties
TRUST_ANCHOR_BP_POLICY_ENABLED=false
SIGNING_DATE=1647880945450
```
