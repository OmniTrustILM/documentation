---
sidebar_position: 11
---

# Crypto Token Configuration

CryptoServer CP5 uses a standard [PKCS#11 Crypto Token](https://doc.primekey.com/signserver/signserver-reference/signserver-components/cryptotokens/pkcs11cryptotoken) for the integration with the SignServer.

:::warning
Due to initialization and authorization of the private keys functions, private key cannot be managed through the PKCS#11 Crypto Token. The PKCS#11 Crypto Token should always be configured as a last step with existing certificate and private key authorized for signing/sealing operations.
:::

## Sample configuration

```
WORKER6.CRYPTOTOKEN_IMPLEMENTATION_CLASS=org.signserver.server.cryptotokens.PKCS11CryptoToken
WORKER6.SLOTLABELVALUE=TestSlot
WORKER6.NAME=UtimacoCP5QSCDCryptoToken
WORKER6.PIN=_MASKED_
WORKER6.IMPLEMENTATION_CLASS=org.signserver.server.signers.CryptoWorker
WORKER6.DEFAULTKEY=testkey01
WORKER6.ATTRIBUTES=attributes(generate,CKO_PUBLIC_KEY,*) \= {\r\n   CKA_TOKEN \= false\r\n   CKA_ENCRYPT \= false\r\n   CKA_VERIFY \= true\r\n   CKA_WRAP \= false\r\n}\r\nattributes(generate, CKO_PRIVATE_KEY,*) \= {\r\n   CKA_TOKEN \= true\r\n   CKA_PRIVATE \= true\r\n   CKA_SENSITIVE \= true\r\n   CKA_EXTRACTABLE \= false\r\n   CKA_DECRYPT \= false\r\n   CKA_SIGN \= true\r\n   CKA_UNWRAP \= false\r\n}
WORKER6.SHAREDLIBRARYNAME=CryptoServerCP5
WORKER6.DISABLED=FALSE
WORKER6.TYPE=CRYPTO_WORKER
WORKER6.SLOTLABELTYPE=SLOT_LABEL
```
