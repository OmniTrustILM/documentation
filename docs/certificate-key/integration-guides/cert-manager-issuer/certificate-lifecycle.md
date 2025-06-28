---
sidebar_position: 10
---

# Certificate Lifecycle

The CZERTAINLY Issuer will automatically manage the lifecycle of the certificate, including renewal and revocation, according to the configuration specified in the `Certificate` resource. The lifecycle management is controlled by the cert-manager, which will periodically check the status of the certificate and trigger operations as needed.

### Certificate issuance

The initial issuance of the certificate is triggered by the cert-manager controller, and the CZERTAINLY Issuer starts to communicate with the CZERTAINLY platform to issue the certificate, storing the identifier of the issued certificate in the `Certificate` annotations `czertainly-issuer.czertainly.com/certificate-uuid`.

This identifier is used later to manage the certificate lifecycle, including renewal and rekey operations.

The following represents the certificate issuance process:

```plantuml
    @startuml
    autonumber
    
    Issuer -> Server : Issue Certificate using CertificateRequest and configuration
    Server -> Issuer : Return registered Certificate resource UUID
    
    ref over Issuer, Server
        Poll and resolve the Certificate status
    end ref
```

### Certificate renewal

When the certificate should be renewed (e.g., when it is close to expiration), the cert-manager will automatically trigger the renewal process. cert-manager will create a new `CertificateRequest` resource, which contains the annotations `czertainly-issuer.czertainly.com/certificate-uuid` taken from the original `Certificate` resource. The CZERTAINLY Issuer will then use this UUID to identify the certificate to be linked with the process.

Based on the private key rotation policy defined in the `Certificate` resource, the CZERTAINLY Issuer will either renew the certificate with the same public key or rekey it with a new public key. The renewal process is similar to the initial issuance, and the CZERTAINLY Issuer will communicate with the CZERTAINLY platform to renew the certificate.

The following represents the certificate renewal process:

```plantuml
    @startuml
    autonumber
    
    Issuer -> Issuer : Get the Certificate UUID
    Issuer -> Issuer : Check whether the private key is rotated
    
    alt Private key is not rotated
        Issuer -> Server : Request renewal of Certificate with UUID using CertificateRequest
    else Private key is rotated
        Issuer -> Server : Request rekey of Certificate with UUID using CertificateRequest
    end
    note right
        Renewal or rekey of the certificate is linked
        to the original certificate using the UUID.
    end note
    
    Server -> Issuer : Return new registered Certificate resource UUID
    
    ref over Issuer, Server
        Poll and resolve the Certificate status
    end ref
```

## Certificate polling process

The CZERTAINLY Issuer will periodically poll the CZERTAINLY platform for the status of the certificate. This is done to ensure that the certificate lifecycle is managed correctly, and any changes in the certificate status are reflected in the `Certificate` resource.

The following represents the certificate polling process:

```plantuml
    @startuml
    autonumber
    
    Issuer -> Server : Get Certificate by UUID
    Server -> Issuer : Return Certificate data
    
    alt Certificate status is Pending
        Issuer -> Issuer : Wait for the next poll interval
        Issuer -> Server : Get Certificate by UUID
        Server -> Issuer : Return updated Certificate data
    end
    
    alt Certificate status is Failed
        Issuer -> Server : Get the Certificate failure reason from history
        Server -> Issuer : Return failure reason if available
        Issuer -> Issuer : Request permanently failed
    end
    
    alt Certificate status is Rejected
        Issuer -> Server : Get the rejected reason from approval data
        Server -> Issuer : Return the rejected reason if available
        Issuer -> Issuer : Request rejected permanently
    end
    
    alt Certificate status is Issued
        Issuer -> Issuer : Match the public key in the certificate and certificate request
        Issuer -> Issuer : Write annotations with the certificate UUID to Certificate resource
        Issuer -> Issuer : Write issued certificate
    end
```