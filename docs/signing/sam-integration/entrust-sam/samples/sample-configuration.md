---
sidebar_position: 2
---

# Entrust SAM Sample Configuration

The following is a sample configuration of the `EntrustSAMCryptoToken`:

```
# Type of worker
WORKERGENID1.TYPE=PROCESSABLE

# Name for other workers to reference this worker
WORKERGENID1.NAME=EntrustSAMCryptoToken

# EntrustSAMCryptoToken must only be used in conjunction with EntrustSAMCryptoWorker
WORKERGENID1.IMPLEMENTATION_CLASS=com.czertainly.signserver.module.entrustsam.EntrustSAMCryptoWorker
WORKERGENID1.CRYPTOTOKEN_IMPLEMENTATION_CLASS=com.czertainly.signserver.module.entrustsam.EntrustSAMCryptoToken

# A name of a crypto token containing private key and user certificate. Will be used to authenticate crypto token to
# Entrust SAM.
WORKERGENID1.OTHER_SIGNERS=EntrustClientKeyStore
WORKERGENID1.ENTRUST_CLIENT_AUTHENTICATION_KEY_ALIAS=ed1dcb7122e666b21c36b3a81d61910a864c9d64

# Entrust SAM server url
WORKERGENID1.ENTRUST_SAM_SERVER=https://213.121.187.216:10462
WORKERGENID1.ENTRUST_TRUST_SELF_SIGNED=true
WORKERGENID1.ENTRUST_CONNECTION_POOL_SIZE=20

# Service to authenticate signing requests
WORKERGENID1.SAD_PROVIDER_IMPLEMENTATION_CLASS=com.czertainly.signserver.module.entrustsam.sad.RestSAMSadProvider
WORKERGENID1.SAD_PROVIDER_URL=https://entrustsam-simulator.ilm.example.com
WORKERGENID1.SAD_PROVIDER_AUTH_TYPE=BASIC
WORKERGENID1.SAD_PROVIDER_USERNAME=******
WORKERGENID1.SAD_PROVIDER_PASSWORD=******
```
