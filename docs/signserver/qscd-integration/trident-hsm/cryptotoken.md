---
sidebar_position: 5
---

# Crypto Token Configuration

Trident HSM uses a standard [PKCS#11 Crypto Token](https://doc.primekey.com/signserver/signserver-reference/signserver-components/cryptotokens/pkcs11cryptotoken) for the integration with the SignServer.

The following rules must be applied for a proper configuration of the PKCS#11 Crypto Token:
- `SLOTLABELTYPE = SLOT_NUMBER`
- `SLOTLABELVALUE` must be the same number as the number of configured `slot1...n` property in the `mpcm-pkcs11.conf` (there may be multiple slots configured, the number is used to connect with one particular slot)

:::warning
When the Trident HSM slot is empty or does not have a proper configuration of `DEFAULTKEY` property, the configured PKCS#11 Crypto Token will be considered as `Offline - Crypto Token is disconnected`. Nevertheless, the private key can be generated on the Crypto Token and assigned as `DEFAULTKEY`. After that, the PKCS#11 Crypto Token will have `Online` status.
:::

## Sample configuration

```
WORKER6.CRYPTOTOKEN_IMPLEMENTATION_CLASS=org.signserver.server.cryptotokens.PKCS11CryptoToken
WORKER6.SLOTLABELVALUE=15
WORKER6.NAME=TridentQSCDCryptoToken
WORKER6.PIN=_MASKED_
WORKER6.IMPLEMENTATION_CLASS=org.signserver.server.signers.CryptoWorker
WORKER6.DEFAULTKEY=defaultkey01
WORKER6.ATTRIBUTES=attributes(generate,CKO_PUBLIC_KEY,*) \= {\r\n   CKA_TOKEN \= false\r\n   CKA_ENCRYPT \= false\r\n   CKA_VERIFY \= true\r\n   CKA_WRAP \= false\r\n}\r\nattributes(generate, CKO_PRIVATE_KEY,*) \= {\r\n   CKA_TOKEN \= true\r\n   CKA_PRIVATE \= true\r\n   CKA_SENSITIVE \= true\r\n   CKA_EXTRACTABLE \= false\r\n   CKA_DECRYPT \= false\r\n   CKA_SIGN \= true\r\n   CKA_UNWRAP \= false\r\n}
WORKER6.SHAREDLIBRARYNAME=TridentHSM
WORKER6.DISABLED=FALSE
WORKER6.TYPE=CRYPTO_WORKER
WORKER6.SLOTLABELTYPE=SLOT_NUMBER
```
