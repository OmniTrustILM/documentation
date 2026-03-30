---
sidebar_position: 1
---

# Overview

This document outlines the steps necessary to integrate CZERTAINLY with HashiCorp Vault. Depending on the use case, you may need to configure the PKI secrets engine for certificate lifecycle management, the KV secrets engine for secret management, or both.

This integration guide was tested on:
- Vault version 1.14.0+

## HashiCorp Vault

[HashiCorp Vault](https://www.vaultproject.io/) is a tool for securely accessing secrets. A secret is anything that you want to tightly control access to, such as API keys, passwords, certificates, and more. Vault provides a unified interface to any secret, while providing tight access control and recording a detailed audit log.

Vault provides a PKI secrets engine that generates X.509 certificates on demand. The PKI secrets engine generates dynamic X.509 certificates based on configured roles. The certificates are signed by the Vault's internal CA or an external CA.

:::info[Vault installation]
This guide assumes that you have already installed and configured HashiCorp Vault. If you haven't done so, refer to the [HashiCorp Vault documentation](https://learn.hashicorp.com/tutorials/vault/getting-started-install) for installation and configuration instructions.

For more information about the PKI secrets engine, refer to the [Vault PKI secrets engine documentation](https://www.vaultproject.io/docs/secrets/pki).
:::

## Integration

### Certificate Lifecycle Management (PKI)

The following steps are required to integrate HashiCorp Vault with CZERTAINLY for certificate lifecycle management using the PKI secrets engine:

| #     | Reference                                                 | Short description                                 |
|-------|-----------------------------------------------------------|---------------------------------------------------|
| **1** | [Enable PKI Secrets Engine](./enable-pki-engine.md)       | Enable and configure the PKI secrets engine       |
| **2** | [Create ACL Policy](./create-acl-policy.md)               | Create ACL policy with permissions for CZERTAINLY |
| **3** | [Enable Authentication Methods](./enable-auth-methods.md) | Enable authentication methods that can be used    |

### Secret Management (KV)

The following steps are required to integrate HashiCorp Vault with CZERTAINLY for secret management using the KV secrets engine:

| #     | Reference                                                       | Short description                                                       |
|-------|-----------------------------------------------------------------|-------------------------------------------------------------------------|
| **1** | [Enable KV Secrets Engine](./enable-kv-secrets-engine.md)       | Enable and configure the KV secrets engine (version 1 or version 2)    |
| **2** | [Create ACL Policy](./create-acl-policy.md)                     | Create ACL policy with KV permissions for CZERTAINLY                   |
| **3** | [Enable Authentication Methods](./enable-auth-methods.md)       | Enable authentication methods that can be used                         |
