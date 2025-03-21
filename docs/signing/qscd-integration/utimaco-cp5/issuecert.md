---
sidebar_position: 7
---

# Issue and Import Certificate

Once the private key is generate an authorized, the Certificate Signing Request can be generated and send to Certification Authority to issue Certificate.

1. Generate CSR:
```bash
cxitool logonpass=USR_0000,user1 group=SLOT_0000 spec=10 exportp10=requestCert-testkey01.p10
```

2. Issue certificate according the procedure defined by the TSP.

3. Once the certificate is issued, you can import it using the `p11tool2`:
```bash
p11tool2 Slot=0 LoginUser=user1 CertAttr=CKA_LABEL="testkey01",CKA_ID=0x525342 PubKeyAttr=CKA_LABEL="testkey01",CKA_ID=0x525342 ImportCert=/opt/utimaco/testkey01.crt
```

:::info
For more information on how to use `cxitool`, refer to the **cxitool Manual**.
For more information on how to use `p11tool2`, refer to the **PKCS#11 p11tool2 Reference Manual**.
:::
