---
sidebar_position: 6
---

# Dynamic Configuration Signer Sample Configuration

The following is a sample configuration of the `DynamicConfigSigner`:

```
# Type of worker
WORKERGENID1.TYPE=PROCESSABLE

# Name for other workers to reference this worker
WORKERGENID1.NAME=EntrustDynamicConfigSigner

# Implementation class and Crypto Token reference
WORKERGENID1.IMPLEMENTATION_CLASS=com.czertainly.signserver.module.entrustsam.signer.DynamicConfigSigner
WORKERGENID1.CRYPTOTOKEN=PKCS11CryptoToken
# The private key of the Configuration Privileged User
WORKERGENID1.DEFAULTKEY=cpu1

# A name of a crypto token containing private key and user certificate. Will be used to authenticate crypto token to Entrust SAM.
WORKERGENID1.OTHER_SIGNERS=EntrustClientKeyStore
# the private key of the Operation Privileged User
WORKERGENID1.ENTRUST_CLIENT_AUTHENTICATION_KEY_ALIAS=opu1

# Entrust SAM server
WORKERGENID1.ENTRUST_SAM_SERVER=https://213.121.187.216:10462
WORKERGENID1.ENTRUST_TRUST_SELF_SIGNED=true
WORKERGENID1.ENTRUST_CONNECTION_POOL_SIZE=20
```
