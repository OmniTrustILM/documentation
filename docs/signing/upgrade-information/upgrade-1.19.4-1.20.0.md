---
sidebar_position: 10
---

# From 1.19.4 To 1.20.0

In release version `1.20.0` the following changes were made:

## Raw Signer

Introduced [Raw Signer](../raw-signer/overview.md), a new module for raw signature operations based on precomputed hash with support for both single and batch signing capabilities, including specialized Entrust batch signing.

The Raw Signer module allows users to perform signature operations on pre-hashed data, providing flexibility and efficiency for scenarios where the data to be signed is already hashed. This module supports various signature algorithms and integrates with existing key management systems, enabling seamless signing workflows.
