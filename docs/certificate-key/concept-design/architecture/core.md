---
sidebar_position: 2
---

# Core

`Core` provides the basic functionality for the platform. It implements the logic for the certificate and cryptographic key lifecycle management and handles all related tasks. You can think about it as the brain of the platform.

There are 2 types of communication that the `Core` is responsible for:

- `Client` requesting management operations on top of certificates
- `Connector` that provides the functionality for specific technology

## Core Components

The `Core` is made up of multiple logical components that work together to deliver full-fledged functionality. See [Core Components](../overview.md#core-components) for the list of components and details.
