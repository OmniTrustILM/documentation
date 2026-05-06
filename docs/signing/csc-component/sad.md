---
sidebar_position: 30
---

# Signature Activation Data

The Signature Activation Data (SAD) is a set of data that is used to activate the signature. The signature activation data is used to authorize a signature, is linked to the document or the documents to be signed.

The content of the SAD is described as follows:

| Property Name        | Description                                                                                                        |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| `userId`             | Identifier of the user the credential will belong to. This identifier must be unique within the identity provider. |
| `credentialId`       | Unique identifier of the credential.                                                                               |
| `signatureQualifier` | Identifier qualifying the type of signature this credential is suitable for.                                       |
| `numSignatures`      | Maximum number of signatures that can be created with this credential with a single authorization request.         |
| `hashes`             | An array containing the Base64-encoded document hashes to be signed.                                               |
| `hashAlgorithmOid`   | The OID of the hash algorithm used to create the hashes.                                                           |
| `clientData`         | Arbitrary data from the signature application.                                                                     |

## Sample Signature Activation Data

The following is sample of the SAD data:

```json
{
  "userID": "9714de4e-2dc1-4be3-9682-678f0aae4f1e",
  "credentialID": "f730t7fnbnd674dve3",
  "signatureQualifier": "eu_eidas_qes",
  "numSignatures": "3",
  "hashes": [
    "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=",
    "Njy1yEOux68lDklWf+4nBjiMpXLAyZHqqMOxFcM3Ojo="
  ],
  ,
  "hashAlgorithmOID": "2.16.840.1.101.3.4.2.1",
  "clientData": "My Custom Client Data"
}
```
