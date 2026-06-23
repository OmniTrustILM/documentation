---
sidebar_position: 1
---

# Overview

This document outlines the steps necessary to be taken to integrate ILM with the [cert-manager](https://cert-manager.io/) `czertainly-issuer`.

This integration guide was tested with:
- Kubernetes 1.19+
- cert-manager 1.7.0+

## cert-manager

cert-manager is a Kubernetes add-on to automate the management and issuance of TLS certificates from various issuing sources. It will ensure certificates are valid and up to date periodically, and attempt to renew certificates at an appropriate time before expiry.

## cert-manager Issuer

The cert-manager issuer is a custom resource definition (CRD) that allows you to issue certificates from the ILM platform using the cert-manager interface.

## Integration

The following steps should be done to successfully integrate with cert-manager:

| #     | Reference                                                   | Short description                                              |
|-------|-------------------------------------------------------------|----------------------------------------------------------------|
| **1** | [Install the cert-manager issuer](./install-czertainly-issuer.md) | Install the cert-manager issuer controller in the Kubernetes cluster |
| **2** | [Create the issuer resource](./create-czertainly-issuer.md)       | Create the issuer resource                                           |
| **3** | [Create Certificate](./create-certificate.md)                     | Create a certificate using the issuer                                |

## Useful resources

The following resources can be useful when integrating with cert-manager:

| Resource                                                                                                                                  | Description                             |
|-------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| [cert-manager](https://cert-manager.io/)                                                                                                  | cert-manager project website            |
| [cert-manager installation guide](https://cert-manager.io/docs/installation/)                                                             | cert-manager installation guide         |
| [cert-manager Certificate resource](https://cert-manager.io/docs/concepts/certificate/)                                                   | cert-manager Certificate resource guide |
| [cert-manager issuer repository](https://github.com/OmniTrustILM/cert-manager-issuer)                                              | cert-manager issuer repository            |
| [cert-manager issuer Helm chart](https://github.com/OmniTrustILM/cert-manager-issuer/tree/main/deploy/charts/czertainly-issuer) | cert-manager issuer Helm chart repository |
