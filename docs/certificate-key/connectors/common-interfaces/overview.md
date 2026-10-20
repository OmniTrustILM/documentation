---
sidebar_position: 1
---

# Overview

`Connector` plays an important role in the platform, providing the functionality for a specific technology. For more information, see [`Connector` Architecture](../../concept-design/architecture/connector.md).

## Connector NG

Connector NG (New Generation) is the next evolution of the `Connector` architecture. Instead of `Function Groups` and `Kinds`, Connector NG uses **versioned interfaces** with optional **feature flags** to describe capabilities.

Key improvements in Connector NG:
- **Interface versioning** — each interface can have an independent version, allowing gradual evolution
- **Feature flags** — indicate optional capabilities beyond the API reference (e.g., `Stateless`, `Async Issue`, `CBOM output`)
- **Consistent error handling** — standardized `application/problem+json` responses conforming to [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457)
- **Kubernetes-native health probes** — dedicated liveness and readiness endpoints
- **Observability** — built-in metrics endpoint exposing Prometheus/OpenMetrics data

The following interfaces are mandatory for each Connector NG:

| Name                                               | Endpoint                          | Short description                                                                          |
|----------------------------------------------------|-----------------------------------|--------------------------------------------------------------------------------------------|
| [Info v2](info-interface.md#connector-ng)          | `GET /v2/info`                    | Connector identity, version, and list of implemented interfaces with versions and features |
| [Health v2](health-interface.md#connector-ng)      | `GET /v2/health`                  | Health status with Kubernetes liveness and readiness probes                                |
| [Attributes (per-operation)](attributes-interface.md#connector-ng) | Defined by each provider API | Per-operation attribute definitions without a separate validation endpoint                 |
| [Metrics](metrics-interface.md)                    | `GET /v1/metrics`                 | Prometheus/OpenMetrics metrics for observability                                           |

`Core` registers a Connector NG only when its Info response lists `info`, `health` and `metrics`, and at least one provider interface.

In addition, a Connector NG that exposes dynamic attribute content implements the **Attributes v2 API** — it is not required for registration:

| Name                                               | Endpoint                          | Short description                                                                          |
|----------------------------------------------------|-----------------------------------|--------------------------------------------------------------------------------------------|
| [Attributes v2 API](../../../contributors/attributes/callbacks.mdx#attributes-v2-callback-model) | `GET /v2/attributes` · `POST /v2/attributes/callback` | Definition registry plus a stateless `dependsOn` callback surface for resolving dynamic attribute content |

The two Attributes surfaces are distinct: the **per-operation** listing declares which attributes an
operation needs, while the **Attributes v2 API** (`connector.common.v2`) is the definition registry plus
dynamic-content callback surface.

Error handling across all Connector NG interfaces follows the [Error Handling](../error-handling.md) specification.

## Legacy Connectors

Legacy connectors use [Function Groups](../../concept-design/architecture/connector.md#function-group) and `Kinds` to describe their capabilities. The following interfaces are mandatory for each legacy `Connector`:

| Name                                  | Short description                                                                              |
|---------------------------------------|------------------------------------------------------------------------------------------------|
| [Info](info-interface.md)             | Information about the `Connector`, its `Function Groups`, supported `Kinds`, list of endpoints |
| [Health](health-interface.md)         | Status information about the `Connector` and its services                                      |
| [Attributes](attributes-interface.md) | `Attributes` definition of the `Connector` specific technology and its validation              |
