---
sidebar_position: 5
---

# Generate and Authorize Private Key

This is a sample steps in orde to generate and authorize new RSA private key using the `cxitool` and `p11tool2`.
You need to have your KAK available and stored in a file in order to initialize and authorize the private key.

1. Generate RSA key pair using the `p11tool2`:
```bash
p11tool2 Slot=0 LoginUser=user1 PubKeyAttr=CKA_LABEL="testkey01",CKA_ID=0x525342 PrvKeyAttr=CKA_LABEL="testkey01",CKA_ID=0x525342 GenerateKeyPair=RSA
```

2. Identify the `specifier` of the generated RSA private key using the `cxitool`:
```bash
cxitool logonpass=USR_0000,user1 group=SLOT_0000 listkeys
```

3. Initialize the generated RSA private key with the KAK:
```bash
cxitool logonpass=USR_0000,user1 group=SLOT_0000 spec=10 keyfile=/opt/utimaco/KAK.key,00000000 InitializeKey
```

4. Authorize the generated RSA private key with the KAK:
```bash
cxitool logonpass=USR_0000,user1 group=SLOT_0000 spec=10 keyfile=/opt/utimaco/DemoCompany.key,00000000 AuthorizeKey
```

:::info
For more information on how to use `cxitool`, refer to the **cxitool Manual**.
For more information on how to use `p11tool2`, refer to the **PKCS#11 p11tool2 Reference Manual**.
:::
