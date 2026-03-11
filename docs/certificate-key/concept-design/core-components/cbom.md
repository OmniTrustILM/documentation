## What is CBOM

**CBOM (Cryptographic Bill of Materials)** is a comprehensive inventory document that describes all cryptographic assets and materials within a system, application, or organization. It provides transparency and visibility into, enabling better security management, compliance, and risk assessment.

It is The International Standard for Bill of Materials (ECMA-424) which is a
specification maintained by The OWASP Foundation and Ecma International
Technical Committee for Software & System Transparency (TC54). See [CycloneDX](https://cyclonedx.org).

CBOMs are essential for:
- **Security auditing** - identifying weak or outdated cryptographic algorithms
- **Compliance** - meeting regulatory requirements for cryptographic asset tracking
- **Risk management** - understanding cryptographic dependencies and vulnerabilities
- **Post-quantum readiness** - preparing for quantum-safe cryptography migration
- **Lifecycle management** - tracking expiration and rotation of cryptographic materials

## CBOM Structure

A CBOM document follows a standardized structure containing metadata and asset information. As specification evolves, several version exists. CZERTAINLY supports [CycloneDX v1.6 JSON](https://cyclonedx.org/docs/1.6/json/)

### Basic details

| Attribute | Field | Description | Example |
|-----------|-------|-------------|---------|
| **Serial Number** | `serialNumber` | Unique identifier for the CBOM document | urn:uuid:6d9a8d9e-5c2f-4d56-9d2d-1d1c7b8b7a11 |
| **Version** | `version` | Version number of this CBOM document | 10 |
| **Spec version** | `specVersion` | Version of the CBOM specification | 1.6 |
| **Source** | `metadata.component.name` | Optional component name | example-payment-service |
| **Total assets** | N/A | Total number of cryptographic assets found | 8 |

### Asset Types

A CBOM can contain various types of cryptographic assets:

#### 1. Certificates
X.509 certificates used for authentication, encryption, and digital signatures.

**Properties:**
- Subject Distinguished Name (DN)
- Issuer Distinguished Name
- Serial Number
- Validity period (Not Before, Not After)
- Public key algorithm and parameters
- Signature algorithm
- Key usage and extended key usage
- Certificate fingerprints (SHA-1, SHA-256)
- Certificate state and validation status

#### 2. Cryptographic Keys
Public and private keys used in cryptographic operations.

**Properties:**
- Key algorithm (RSA, ECDSA, EdDSA, etc.)
- Key size/curve
- Key usage (signing, encryption, key agreement)
- Key format (PKCS#8, PKCS#12, JWK)
- Key location (HSM, software, cloud KMS)
- Key state and lifecycle status

#### 3. Algorithms
Cryptographic algorithms in use within the system.

**Properties:**
- Algorithm name (e.g., RSA, AES, SHA-256)
- Algorithm type (signing, encryption, hashing, key agreement)
- Algorithm parameters (key size, mode, padding)
- Security strength level
- Quantum-safe status

#### 4. Protocols
Cryptographic protocols and their configurations.

**Properties:**
- Protocol name (TLS, SSH,)
- Protocol version
- Supported cipher suites
- Authentication methods
- Key exchange mechanisms

#### 5. Secrets
Various secrets found on a system like:

- Passwords
- API Keys
- Client IDs and Client secrets
- Access Tokens

## CBOM in CZERTAINLY

CZERTAINLY generates and maintains CBOMs for all managed cryptographic assets. The platform:

- **Automatically discovers** cryptographic assets from various sources via CBOM Lens Discovery protocol
- **Continuously synchronized** CBOM documents are regularly pulled from Repository
- **Visualize** CBOM data for a compliance
- **Exports** raw CBOM in JSON formats

## Integration with CBOM Repository Service

Following diagram illustrates:

**Pull Mode:**
- Scheduled job initiates the sync
- Queries CBOM repository for entries after last sync timestamp
- Iterates through entries and stores them in the database
- Updates the sync timestamp for the next run

**Push Mode:**
- User uploads CBOM via REST API
- API stores it in CBOM repository
- Repository assigns/reuses serialNumber and version
- Returns the CBOM details to the user

```plantuml
@startuml CBOM Pull and Push Modes

!define RECTANGLE_COLOR #E8F5E9
!define ACTOR_COLOR #BBDEFB

title CBOM Synchronization - Pull and Push Modes

actor User as user #ACTOR_COLOR
participant "CZERTAINLY\nREST API" as api
participant "Scheduled Job" as scheduler
database "CZERTAINLY\nDatabase" as db
participant "CBOM Repository" as repo

== Pull Mode ==

activate scheduler
scheduler -> scheduler: Start sync job
scheduler -> scheduler: Get last sync timestamp

scheduler -> repo: GET /cbom/entries?after={timestamp}
activate repo
repo --> scheduler: Return CBOM entries\n(created after timestamp)
deactivate repo

loop For each CBOM entry
    scheduler -> db: Store CBOM record
    activate db
    db --> scheduler: Confirm stored
    deactivate db
end

scheduler -> db: Update last sync timestamp
scheduler -> scheduler: Schedule next run
deactivate scheduler

== Push Mode ==

user -> api: POST /cbom\n(Upload new CBOM)
activate api

api -> repo: Store CBOM
activate repo
repo -> repo: Reuse or assign new\nserialNumber and version
repo --> api: Return CBOM with\nserialNumber and version
deactivate repo

api --> user: Return CBOM details
deactivate api

note right of repo
  CBOM is now available
  in the repository and
  will be returned to
  other users/systems
end note

@enduml
```

### Configuration

To configure CBOM Repository integration:

1. Go to **Platform Settings**
2. Configure **CBOM Repository URL**

## See Also

- [CycloneDX v1.6 reference](https://cyclonedx.org/docs/1.6/json/)
- [Certificate](certificate.md)
- [Key](key.md)
- [Compliance Profile](compliance-profile.md)
- [Certificate Discovery](../../modules/certificate-discovery.md)
