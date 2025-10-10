---
sidebar_position: 12
---

# Certificate

The `Certificate` holds the information about the certificate and its lifecycle. It represents the certificate in a human-readable format. `Certificate` holds the following information of any certificate:

- Human understandable parsed certificate content
- Base64 certificate content
- Certificate state
- Certificate validation status
- Certificate compliance status
- Metadata including discovery information

In addition to the above details, the following are mapped to the `Certificate` for the ease of management,

- Certificate owner
- Binding `RA Profile`
- `Entity`
- `Group` it belongs to


## Hybrid Certificate

In addition to classic X.509 certificates with public key, CZERTAINLY also supports hybrid certificates with alternative extensions. Hybrid certificates are important for migration to post-quantum technology. They contain two public keys - the one with classical public key like RSA or ECDSA and an alternative public key with quantum-safe algorithm. When the hybrid CA signs certificate, the signed certificate will also have corresponding alternative signature extension that is created using corresponding alternative private key. The alternative extensions are specified in [ITU-T X509 (10/2019)](https://www.itu.int/rec/T-REC-X.509-201910-I/en).

## Certificate state

Certificate status represents stage of certificate lifecycle and transition to different state depends on certificate operations (e.g. issue, revoke, etc.) and/or events (approval expired, certificate revoked externally).

Certificate can be in following states:

| Status                                     | Description                                                              | Transition                                                                                                                                                                         |
|--------------------------------------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Requested`                                | The `Certificate` is created (requested) and ready to be issued.         | Initial state in case user requests certificate.                                                                                                                                   |
| `Pending Approval`                         | The `Certificate` action is waiting to be approved.                      | When certificate action needs to be approved.                                                                                                                                      |
| `Pending Issue` (***Not yet supported***)  | The `Certificate` action is waiting to be issued at authority.           | When certificate is requested to be issued by authority (already approved) and waiting to be approve issuance on authority side.                                                   |
| `Pending Revoke` (***Not yet supported***) | The `Certificate` action is waiting to be revoked at authority.          | When certificate is requested to be revoked by authority (already approved) and waiting to be approve revocation on authority side.                                                |
| `Rejected`                                 | The `Certificate` issuance approval request was rejected.                | When approval for certificate issue action was rejected or expired.                                                                                                                |
| `Failed`                                   | The `Certificate` request issuance failed.                               | When certificate fails to be issued by authority caused by error or invalid request.                                                                                               |
| `Issued`                                   | The `Certificate` is issued.                                             | Initial state in case certificate is uploaded or discovered.<br />When certificate is successfully issued.<br/> When certificate revocation failed state returns back to `Issued`. |
| `Revoked`                                  | The `Certificate` is revoked.                                            | When certificate is successfully revoked.                                                                                                                                          |                                                                                                                 |

Certificate state transition diagram is as follows:

```plantuml
@startuml
hide empty description

state "Pending Approval" as PendingApproval
state "Pending Issue" as PendingIssue
state "Pending Revoke" as PendingRevoke

  [*] --> Requested
  [*] --> Issued
  Requested --> Failed
  Requested --> PendingApproval
  Requested --> PendingIssue
  Requested --> Issued
  PendingApproval --> Rejected
  PendingApproval --> PendingIssue
  PendingApproval --> PendingRevoke
  PendingApproval --> Issued
  PendingApproval --> Revoked
  PendingIssue --> Failed
  PendingIssue --> Issued
  PendingRevoke --> Revoked
  PendingRevoke --> Issued
  Issued --> PendingApproval
  Issued --> PendingRevoke
  Issued --> Revoked
  Rejected --> [*]
  Failed --> [*]
  Issued --> [*]
  Revoked --> [*]
@enduml
```

### Archived Certificate

Certificate can be marked as archived. When certificate is archived, it will not be validated, and cannot be managed. It is intended for certificates that are not going to be used anymore and should be tracked only for historical reasons, eventually removed from the inventory.

Archived certificate can be unarchived to again allow all operations for the certificate.

## Certificate validation status

Certificate validation status represents the result of the certificate validation process in time. It is periodically checked by system scheduled job to keep up-to-date certificate validation status. The validation status is calculated based on the validation result of the certificate and its chain.

The following validation statuses are supported:

| Status       | Description                                                                          |
|--------------|--------------------------------------------------------------------------------------|
| `NotChecked` | The `Certificate` validation was not run yet.                                        |
| `Failed`     | The `Certificate` validation process failed.                                         |
| `Inactive`   | The `Certificate` is not yet active (before its validation period starts).           |
| `Valid`      | The `Certificate` is valid according to validation described [below](#validation).   |
| `Invalid`    | The `Certificate` is invalid according to validation described [below](#validation). |
| `Revoked`    | The `Certificate` is revoked.                                                        |
| `Expiring`   | The `Certificate` is marked as expiring when its expiry is in less than 30 days.     |
| `Expired`    | The `Certificate` is expired.                                                        |

The `Certificate` status transition diagram is as follows:

```plantuml
@startuml
hide empty description

state "Not Checked" as NotChecked

[*] --> NotChecked
NotChecked --> Failed
NotChecked --> Inactive
NotChecked --> Valid
NotChecked --> Invalid
NotChecked --> Expiring
NotChecked --> Expired
NotChecked --> Revoked
Failed --> Inactive
Failed --> Valid
Failed --> Invalid
Failed --> Expiring
Failed --> Expired
Failed --> Revoked
Inactive --> Valid
Inactive --> Revoked
Valid --> Invalid
Valid --> Revoked
Valid --> Expiring
Invalid --> Valid
Invalid --> Revoked
Invalid --> Expired
Revoked --> Invalid
Revoked --> Expired
Expiring --> Invalid
Expiring --> Revoked
Expiring --> Expired
Failed --> [*]
Expired --> [*]
Invalid --> [*]
Revoked --> [*]

@enduml
```

## Validation

Certificate validation is a complex process that ensures the security and trustworthiness of digital certificates in various applications, including secure web browsing, email encryption, and digital signatures.
It plays a crucial role in establishing secure and authenticated communication over the internet.

In `CZERTAINLY` platform, certificate validation is periodically checked by system scheduled job to keep up-to-date certificate status.
To achieve that, crucial part of validation algorithm is to update and construct certificate chain (path). Currently, only `X.509` certificates are supported.
Therefore, following description of certificate validation is valid for `X.509` certificate type.

### Certificate chain

Certificate chain is constructed by following algorithm:
1. Add certificates to chain by recursively following the issuer certificate reference stored in DB.
2. If last certificate is self-signed certificate (presumed root CA), return certificate chain with indication that chain is complete.
3. Search for issuer certificate in inventory by issuer subject DN. If more candidates are present, take first where verification of certificate signature with its public key is successful.
4. If no candidate in inventory found, check if Authority Information Access (AIA) extension is available and try to download certificate from URL from AIA extension
5. Construct certificate chain further by repeating step 3 and 4 until no more certificates are available from both sources
6. Return available certificate chain with indication that chain is complete when last certificate is self-signed

```plantuml
@startuml

start

:construct chain from DB;
while (last cert is not self-signed?)
 :search issuer in inventory;
 if (found?) then (no)
  :download from AIA extension;
  if (downloaded?) then (no)
   :isComplete = false;
   break
  endif
 endif
endwhile (isComplete = true)

:return chain with isComplete flag;

stop

@enduml
```

### Validation algorithm

Construct the certificate chain and validate certificates from root CA to subject certificate as following based on [RFC5280](https://datatracker.ietf.org/doc/html/rfc5280#section-6):

1. **Check the completeness of chain**
2. **Verify signature of certificate** using issuer public key - [Section 6.1.3 (a)(1)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.3). If certificate has alternative signature, it is validated as well - according to tge [ITU-T X509 (10/2019) Clause 7.2.2](https://www.itu.int/rec/T-REC-X.509-201910-I/en). 
3. **Check certificate validity** by comparing `notBefore` and `notAfter` dates with current date - [Section 6.1.3 (a)(2)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.3)
4. **Consult Revocation Authorities** - [Section 6.1.3 (a)(3)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.3)
   - if OCSP is available, then do the OCSP check
   - if CRL information is available, then do the CRL check
   - if no revocation information source is available, show warning that the revocation was not checked, was not available, or related reason.
5. **Check if certificate issuer DN equals to issuer subject DN** - [Section 6.1.3 (a)(4)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.3)
6. **Check basic constraints**
   - if certificate is version 3 and not end certificate, check if basic constraint extension is present and CA flag is set to true - [Section 6.1.4 (k)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.4)
   - if certificate is CA, check path length greater than zero and less than its issuer - [Section 6.1.4 (l)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.4)
7. **Check key usage** of CA certificate [Section 6.1.4 (n)](https://datatracker.ietf.org/doc/html/rfc5280#section-6.1.4)

### Validation check types

Certificate validation algorithm consists of different validation check types. `Certificate` is validated by different criteria to provide partial validation result.

The following validation checks are performed for `Certificate`:

| # | Validation check       | Description                                                                                                               | Result                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|---|------------------------|---------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Certificate chain      | Check the completeness of chain (certificate validation path) and validity of issuer certificate                          | <span class="badge badge--success">VALID</span> if chain is complete.<br/><span class="badge badge--danger">INVALID</span> if certificate in validation path is missing or issuer certificate is invalid or revoked.                                                                                                                                                                                                                       |
| 2 | Signature verification | Check the signature of `Certificate` using public key of the issuer certificate.                                          | <span class="badge badge--secondary">NOT CHECKED</span> if issuer is missing.<br/><span class="badge badge--success">VALID</span> if signature verified and if applicable, alternative signature is verified.<br/><span class="badge badge--danger">FAILED</span> if signature verification fails or, if applicable, alternative signature validation fails.                                                                               |
| 3 | Certificate validity   | Check certificate validity based on `notBefore` and `notAfter` dates of the certificate.                                  | <span class="badge badge--secondary">INACTIVE</span> in case `notBefore` >= current date.<br/><span class="badge badge--danger">EXPIRED</span> in case `notAfter` \<= current date.<br/><span class="badge badge--warning">EXPIRING</span> in case the `notAfter` is less than 30 days from current date.<br/><span class="badge badge--success">VALID</span> if `notBefore` < current date.                                               |
| 4 | OCSP check             | Check status using OCSP URL available in the certificate extension `AuthorityInformationAccess`.                          | <span class="badge badge--secondary">NOT CHECKED</span> if issuer is missing or certificate does not contain AIA extension or OCSP URL is not present.<br/><span class="badge badge--danger">FAILED</span> if not possible to retrieve OCSP URL or valid content from URL.<br /><span class="badge badge--success">VALID</span> if OCSP returns `good`.<br/><span class="badge badge--danger">REVOKED</span> if the OCSP return `revoked`. |
| 5 | CRL check              | Check status using CRL URL available in the certificate attribute `CRLDistributionPoints` or from CRL stored in database. | <span class="badge badge--secondary">NOT CHECKED</span> if issuer is missing or certificate does not contain its extension.<br/><span class="badge badge--success">VALID</span> in case CRL is available, valid, and the certificate is not on the list.<br/><span class="badge badge--danger">REVOKED</span> in case CRL is available, valid, and the certificate is on the list.                                                         |
| 6 | Basic Constraints      | Check the basic constraints if extension is present.                                                                      | <span class="badge badge--danger">INVALID</span> if certificate is version 3, not end certificate and does not have CA flag set or path length is greater than its issuer.<br/><span class="badge badge--danger">FAILED</span> if cannot check if certificate is CA (not version 3)<br/><span class="badge badge--success">VALID</span> otherwise.                                                                                         |
| 7 | Certificate Key Usage  | Check if certificate key can be used to verify signatures. Applicable for CA certificates.                                | <span class="badge badge--secondary">NOT CHECKED</span> if certificate is not CA.<br/><span class="badge badge--success">VALID</span> if certificate has `keyCertSign` bit set in key usage extension.<br/><span class="badge badge--danger">INVALID</span> otherwise.                                                                                                                                                                     |

The above is true for a single `Certificate`, but all certificates in the certificate chain are validated the same way.

### Validation result evaluation

After certificate is checked with individual validation check types, check results are then used as input for calculating result certificate validation status.
Certificate validation checks results and result validation status are then stored and saved.

Calculation of result status is as follows:

```plantuml
@startuml

start

if (chain check VALID?) then (yes)
  if (signature check VALID?) then (yes)
    if (validity check INACTIVE or EXPIRED?) then (yes)
      if (OCSP or CRL check REVOKED?) then (yes)
        if (validity check EXPIRING?) then (yes)
          :**Expiring**;
        else (no)
          :**Valid**;
        endif
      else (no)
        :**Revoked**;
      endif
    else (no)
      :**Inactive** or **Expired**;
    endif
  else (no)
    :**Invalid**;
  endif
else (no)
 :**Invalid**;
endif

stop

@enduml
```

### Certificate revocation lists handling

When validating certificate and checking for revocation by existence of certificate in authority CRL, whole CRL needs to be downloaded and processed.
To prevent downloading CRL each time when doing revocation validation check (even multiple times when certificates are issued by same authority), CRL and its entries are stored in database.

When certificate is checked for revocation:
- check if `cRLDistributionPoints` extension is set, if not we do not check CRL revocation and check result is <span class="badge badge--secondary">NOT CHECKED</span>
- check if exists CRL in database by certificate issuer DN and issuer serial number, if does not exist or current UTC time is past its `Next Update` timestamp, download it from CRL URL, process it and store its all entries in DB.
- update CRL information - CRL number, next update timestamp and last revocation date from last processed entry
- check if certificate has `freshestCRL` extension present and using delta CRL ([more info in RFC](https://datatracker.ietf.org/doc/html/rfc5280#section-5.2.4)). If yes, process as follows:
   - check in CRL if last processed delta is still valid by its `Next update` timestamp
   - if not valid or not set, download delta CRL and check its validity (compare CRL issuer with issuer stored in CRL entity). If they are not same, revocation check is <span class="badge badge--danger">FAILED</span>.
   - if DeltaCRLIndicator base CRL number is not equal to one from CRL entity, redownload full CRL (new one was probably published), if received again old one, revocation check is <span class="badge badge--danger">FAILED</span>.
   - if delta CRL number is greater than one in DB entity, process its entries which revocation date is >= revocation date of last processed entry. Update entries in following manner:
      - when entry by serial number is not present, add new one
      - when entry by serial number is present, probably reason changed so update its revocation reason and date
      - when entry by serial number is present and revocation reason is `REMOVE_FROM_CRL`, remove this entry
   - update delta CRL information - CRL number, next update timestamp and last revocation date from last processed entry
- CRL is updated with newest entries and certificate can be searched in its entries by serial number

## Attributes

`Certificate` attributes hold information related to the platform. Once a certificate request is submitted platform creates the `Certificate` with a specific identification, defines certificate type, and assigns validity status. `Certificate` attributes also include connection to the other part of platform components.

## Metadata

Metadata provides any additional information about the `Certificate` that can be technology specific.
Metadata can be used for further processing of the `Certificate` by different components and modules of the platform.
