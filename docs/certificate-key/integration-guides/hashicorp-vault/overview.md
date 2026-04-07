---
sidebar_position: 1
---

# Overview

This document outlines the steps necessary to integrate the platform with HashiCorp Vault. Depending on the use case, you may need to configure the PKI secrets engine for certificate lifecycle management, the KV secrets engine for secret management, or both.

This integration guide was tested on:
- Vault version 1.14.0+

## HashiCorp Vault

[HashiCorp Vault](https://www.vaultproject.io/) is a tool for securely accessing secrets. A secret is anything that you want to tightly control access to, such as API keys, passwords, certificates, and more. Vault provides a unified interface to any secret, while providing tight access control and recording a detailed audit log.

The platform integrates with the following Vault secrets engines:
- **PKI secrets engine** — generates dynamic X.509 certificates based on configured roles, signed by Vault's internal CA or an external CA
- **KV secrets engine** — stores and manages arbitrary secrets as key-value pairs, with optional versioning (KV v2)

:::info[Vault installation]
This guide assumes that you have already installed and configured HashiCorp Vault. If you haven't done so, refer to the [HashiCorp Vault documentation](https://learn.hashicorp.com/tutorials/vault/getting-started-install) for installation and configuration instructions.

For more information about the secrets engines, refer to the [Vault PKI secrets engine documentation](https://www.vaultproject.io/docs/secrets/pki) and the [Vault KV secrets engine documentation](https://developer.hashicorp.com/vault/docs/secrets/kv).
:::

## Integration

### Certificate Lifecycle Management (PKI)

The following steps are required to integrate HashiCorp Vault for certificate lifecycle management using the PKI secrets engine:

| #     | Reference                                                     | Short description                                 |
|-------|---------------------------------------------------------------|---------------------------------------------------|
| **1** | [Enable PKI Secrets Engine](./enable-pki-engine.md)           | Enable and configure the PKI secrets engine       |
| **2** | [Create PKI ACL Policy](./create-acl-policy-pki.md)           | Create ACL policy with required permissions       |
| **3** | [Enable Authentication Methods](./enable-auth-methods.md)     | Enable authentication methods that can be used    |

### Secret Management (KV)

The following steps are required to integrate HashiCorp Vault for secret management using the KV secrets engine:

| #     | Reference                                                         | Short description                                                    |
|-------|-------------------------------------------------------------------|----------------------------------------------------------------------|
| **1** | [Enable KV Secrets Engine](./enable-kv-secrets-engine.md)         | Enable and configure the KV secrets engine (version 1 or version 2)  |
| **2** | [Create KV ACL Policy](./create-acl-policy-kv.md)                 | Create ACL policy with required KV permissions                       |
| **3** | [Enable Authentication Methods](./enable-auth-methods.md)         | Enable authentication methods that can be used                       |
