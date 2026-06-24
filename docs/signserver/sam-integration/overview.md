---
sidebar_position: 1
---

# Introduction

**Signature Activation Module (SAM)** plays a crucial role to achieve security and user's sole control when private keys are managed on behalf of the users by a trusted service provider (aka remote signing). It is also one of the requirements of the eIDAS regulation in order to provide advanced or qualified remote signign service.

## What is SAM?

SAM is a remote signing component ensuring secure communication, verifying signature activation data, and managing the sole control of the private keys on behalf of the users with a cryptographic module (QSCD).

There are two main standards related to the remote signing, eIDAS compliant:

- **EN 419 241-1**: Trustworthy Systems Supporting Server Signing Part 1, General System Security Requirements.
- **EN 419 241-2**: Trustworthy Systems Supporting Server Signing Part 2, Protection Profile for QSCD for Server Signing. (generally known as Signature Activation Module (SAM))

## Which SAM is supported?

The SAM integration is designed to support various implementations of the SAM. The following SAMs are currently tested and supported:

- [Entrust SAM](./entrust-sam/overview.md)
- [Trident SAM](./trident-sam/overview.md)
