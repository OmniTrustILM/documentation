---
sidebar_position: 4
---

# Entrust SAM Sample OneTime Configuration

The following is a sample configuration of the `EntrustSAMOneTimeCryptoToken` that authenticates to EJBCA to issue a certificate:

```
# Type of worker
WORKERGENID1.TYPE=PROCESSABLE

# Name for other workers to reference this worker
WORKERGENID1.NAME=EntrustSAMOneTimeCryptoTokenWithEJBCA

# EntrustSAMOneTimeCryptoToken need already configured EntrustSAMCryptoToken
WORKERGENID1.IMPLEMENTATION_CLASS=com.czertainly.signserver.module.sam.onetime.entrust.EntrustSAMOneTimeCryptoWorker
WORKERGENID1.CRYPTOTOKEN=EntrustSAMCryptoToken

# Configuration to access EJBCA and issue certificates
WORKERGENID1.OTHER_SIGNERS=EJBCAClientKeyStore
WORKERGENID1.TLSCLIENTKEY=ra_signserver_02
WORKERGENID1.CA_CONNECTOR_IMPLEMENTATION_CLASS=com.czertainly.signserver.module.sam.onetime.caconnector.EjbcaWSSAMCAConnector
WORKERGENID1.EJBCAWSURL=https://lab01.ilm.example.com:8453/ejbca
WORKERGENID1.KEYGEN_ALGORITHM=RSA
WORKERGENID1.KEYGEN_SPECIFICATION=2048
WORKERGENID1.ENDENTITYPROFILE=DemoDocumentSigningEndEntityProfile
WORKERGENID1.CANAME=DemoClientSubCA
WORKERGENID1.CERTSIGNATUREALGORITHM=SHA256WithRSA
WORKERGENID1.USERNAME_PATTERN=onetime-${TRANSACTION_ID}
WORKERGENID1.SUBJECTDN_PATTERN=CN=${AUTHORIZED_USERNAME},UID=${TRANSACTION_ID}

# Truststore for the connection with the EJBCA
WORKERGENID1.TRUSTSTOREPATH=/opt/primekey/truststore.jks
WORKERGENID1.TRUSTSTORETYPE=JKS
WORKERGENID1.TRUSTSTOREPASSWORD=******
```
