---
sidebar_position: 7
---

# Issue and Import Certificate

Once the assigned private key is generate, the Certificate Signing Request can be generated and send to Certification Authority to issue Certificate.

1. Generate CSR:

Use your favorite PKCS#11 tool to sign the CSR. For example, you can use the OpenSC `pkcs11-tool` to sign the CSR with assigned key:

```bash
pkcs11-tool --module /opt/nfast/toolkits/pkcs11/libcknfast.so --slot-index 1 --login --sign --mechanism SHA512_RSA_PKCS --id f826a841a8cd007975ccad83de96fac3b5995cf9 --input-file csr_to_be_signed --output-file signature
```

2. Issue certificate according the procedure defined by the TSP.

3. Once the certificate is issued, you can import it using your favorite PKCS#11 tool.
   
Example using the `pkcs11-tool`:

```bash
pkcs11-tool --module /opt/nfast/toolkits/pkcs11/libcknfast.so --slot-index 1 --login --write-object test-nshield-cmts-demo.der --type cert --id f826a841a8cd007975ccad83de96fac3b5995cf9 --label testassignedkey01
```

:::info
For more information on how to use `pkcs11-tool`, refer to the [OpenSC Wiki](https://github.com/OpenSC/OpenSC/wiki).
:::
