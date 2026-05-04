---
sidebar_position: 1
---

# Integration Guide

:::info
This integration guide is intended for **development and testing purposes**. The Software Cryptography Provider stores cryptographic keys in software (backed by a PostgreSQL database) and should not be used in production environments. For production use cases, consider hardware security module (HSM) based connectors.
:::

This document outlines the steps to deploy and connect the Software Cryptography Provider to the platform. Once connected, the platform can create and manage cryptographic keys, and perform cryptographic operations such as signing, verification, encryption, and decryption.

This integration guide was tested with:
- Software Cryptography Provider version 2.x

## What is Software Cryptography Provider

The Software Cryptography Provider is a Cryptography Provider connector that implements key management and cryptographic operations in software. It is intended for development and testing scenarios where a hardware security module is not available.

Supported key algorithms:

| Algorithm | Type | Supported operations |
|-----------|------|----------------------|
| RSA (1024, 2048, 4096-bit) | Classical | Sign, Verify, Encrypt, Decrypt |
| ECDSA (secp192r1–secp521r1) | Classical | Sign, Verify |
| ML-DSA / CRYSTALS-Dilithium | Post-quantum | Sign, Verify |
| SLH-DSA | Post-quantum | Sign, Verify |
| FALCON 512/1024 | Post-quantum | Sign, Verify |
| ML-KEM | Post-quantum | Encrypt, Decrypt |

:::note[Symmetric keys]
The Software Cryptography Provider does not support symmetric key algorithms.
:::

## Prerequisites

Before you begin, ensure you have:
- Docker installed and running
- A PostgreSQL 12+ instance accessible from the connector container
- The platform running and accessible

## Deploy the connector

The Software Cryptography Provider is distributed as a Docker image. Use the following command to start the connector:

```bash
docker run -d \
  --name software-cryptography-provider \
  -p 8080:8080 \
  -e JDBC_URL=jdbc:postgresql://<host>:<port>/<database> \
  -e JDBC_USERNAME=<db-user> \
  -e JDBC_PASSWORD=<db-password> \
  docker.io/czertainly/czertainly-software-cryptography-provider:latest
```

Replace the following placeholders:

| Placeholder | Description |
|-------------|-------------|
| `<host>` | PostgreSQL host |
| `<port>` | PostgreSQL port (default: `5432`) |
| `<database>` | Database name |
| `<db-user>` | Database username |
| `<db-password>` | Database password |

Optional environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_SCHEMA` | `softcp` | Database schema name |
| `PORT` | `8080` | Port the connector listens on |
| `TOKEN_DELETE_ON_REMOVE` | `false` | Whether to delete all keys when a token is removed |

Verify the connector is running:

```bash
curl http://localhost:8080/v1/info
```

The response should return connector metadata including name and version.

## Register connector in the platform

Before creating a token, the connector must be registered in the platform:

- In the platform, navigate to **Connectors** in the sidebar
- Click **Add connector**
- Enter the connector URL: `http://<connector-host>:8080`
- Click **Connect** — the platform will discover the connector and display its capabilities
- Review the connector details and click **Save**

The connector should appear in the list with status **Connected** and type **Cryptography Provider**.

## Create Token instance

A Token represents the logical container for cryptographic keys within the connector.

- Navigate to **Inventory → Tokens** in the sidebar
- Click **Add token**
- Fill in the required fields:
  - **Name** — a unique name for the token (for example, `soft-token-test`)
  - **Cryptography Provider** — select the registered Software Cryptography Provider connector
  - **Kind** — select `SOFT`
- Click **Create**

The token will appear in the list with status `INACTIVE`.

## Activate Token instance

The token must be activated before any key management or cryptographic operations can be performed.

- Open the token details page
- Click **Activate**
- Confirm the activation

The token status should change to `ACTIVE`.

:::warning
If the token status shows `DISCONNECTED` or `ERROR`, verify that the connector is running and accessible from the platform.
:::

## Create Token Profile

A Token Profile defines the key management policies and permitted operations for keys created under this token.

- Navigate to **Profiles → Token Profiles** in the sidebar
- Click **Add token profile**
- Fill in the required fields:
  - **Name** — a unique name (for example, `soft-token-profile-test`)
  - **Token** — select the token created in the previous step
  - Configure key usage policies as required
- Click **Save**

## Create a cryptographic key

- Navigate to **Keys** in the sidebar
- Click **Create key**
- Fill in the required fields:
  - **Name** — a unique name for the key
  - **Token Profile** — select the token profile created in the previous step
  - **Key Algorithm** — select the desired algorithm (for example, `RSA`)
  - **Key Size** — select the key size (for example, `2048`)
- Click **Create**

The key will appear in the Keys inventory with two components:
- **Private Key** — available operations: Sign, Decrypt
- **Public Key** — available operations: Verify, Encrypt

Enable the required key usages on each component before use.

## Perform cryptographic operations

### Sign and Verify

To sign data:
- Open the key details page
- Go to the **Private Key** tab
- Click **Sign Data**
- Enter the data to sign in the **File content** field
- Select **RSA Signature Scheme** (recommended: `PSS`) and **Digest Algorithm** (recommended: `SHA-256`)
- Click **Sign** — a `signature.sign` file will be downloaded

To verify the signature:
- Go to the **Public Key** tab
- Click **Verify Signature**
- Enter the original data in the **File content** field
- Upload the `signature.sign` file
- Click **Verify** — a `verification-result.json` file will be downloaded with the result:

```json
{"verifications":[{"result":true}]}
```

### Encrypt and Decrypt

Encrypt and Decrypt operations are available through the REST API only and are not exposed in the platform UI.

API endpoints:
- `POST /v1/operations/tokens/{tokenInstanceUuid}/tokenProfiles/{tokenProfileUuid}/keys/{uuid}/items/{keyItemUuid}/encrypt`
- `POST /v1/operations/tokens/{tokenInstanceUuid}/tokenProfiles/{tokenProfileUuid}/keys/{uuid}/items/{keyItemUuid}/decrypt`

For API reference, see [Cryptographic Operations API](/api/core-cryptographic-operations).

## Issue a certificate using a token key

The cryptographic key created in the token can be used as the signing key during certificate issuance. The platform will automatically generate a CSR using the private key stored in the token.

- Navigate to **Certificates** in the sidebar
- Click **Issue certificate**
- When selecting the key source, choose the key from the token inventory
- Complete the certificate request — the platform calls `generateCsr` internally using the token key

This allows organizations to issue certificates backed by keys managed in a dedicated cryptographic provider rather than generating ephemeral keys during issuance.

## Constraints

| Constraint | Notes |
|------------|-------|
| Symmetric keys not supported | Only asymmetric key algorithms are available |
| Not suitable for production | Keys are stored in software (PostgreSQL); use an HSM connector for production |
| Encrypt/Decrypt not available in UI | These operations require direct API calls |

