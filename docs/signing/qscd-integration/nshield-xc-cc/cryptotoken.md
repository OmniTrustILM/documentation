---
sidebar_position: 11
---

# Crypto Token Configuration

nShield XC CC uses a standard [PKCS#11 Crypto Token](https://doc.primekey.com/signserver/signserver-reference/signserver-components/cryptotokens/pkcs11cryptotoken) for the integration with the SignServer.

:::warning
Private keys can be managed through the PKCS#11 Crypto Token, however, such private keys would not be generated and used as assigned private keys, but general private keys (see [CMTS Security World](./cmts.md)). The PKCS#11 Crypto Token should always be configured as a last step with existing certificate and assigned private key authorized for signing/sealing operations.
:::

## Sample configuration

```
WORKER6.CRYPTOTOKEN_IMPLEMENTATION_CLASS=org.signserver.server.cryptotokens.PKCS11CryptoToken
WORKER6.SLOTLABELVALUE=testsoftcard01
WORKER6.NAME=nShieldCMTSCryptoToken
WORKER6.PIN=_MASKED_
WORKER6.IMPLEMENTATION_CLASS=org.signserver.server.signers.CryptoWorker
WORKER6.DEFAULTKEY=testassignedkey01
WORKER6.ATTRIBUTES=attributes(generate,CKO_PUBLIC_KEY,*) \= {\r\n   CKA_TOKEN \= false\r\n   CKA_ENCRYPT \= false\r\n   CKA_VERIFY \= true\r\n   CKA_WRAP \= false\r\n}\r\nattributes(generate, CKO_PRIVATE_KEY,*) \= {\r\n   CKA_TOKEN \= true\r\n   CKA_PRIVATE \= true\r\n   CKA_SENSITIVE \= true\r\n   CKA_EXTRACTABLE \= false\r\n   CKA_DECRYPT \= false\r\n   CKA_SIGN \= true\r\n   CKA_UNWRAP \= false\r\n}
WORKER6.SHAREDLIBRARYNAME=nShieldXCCC
WORKER6.DISABLED=FALSE
WORKER6.TYPE=CRYPTO_WORKER
WORKER6.SLOTLABELTYPE=SLOT_LABEL
```
