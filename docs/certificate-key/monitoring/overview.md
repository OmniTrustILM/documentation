---
sidebar_position: 1
---

# Monitoring Overview

The CZERTAINLY platform is composed of multiple components, each deployed as a Pod within a Kubernetes environment. Each deployment typically defines its own health check probes, commonly using a TCP check on port `8080` with HTTP GET request to the `/health/readiness` endpoint. However, some components utilize different health check mechanisms. For example, the `api-gateway` component (powered by Kong) uses a command-based health check: `kong health`.

## Basic Monitoring Approach

As a first layer of monitoring, Kubernetes' native health and status monitoring can be utilized to verify that all Pods within the `czertainly` namespace are in a healthy and running state. This provides a basic assurance that the platform components are up and functioning at the container orchestration level.

While this level of monitoring helps detect immediate container or deployment failures, it is recommended to extend this with more application-aware and service-level monitoring, including:
  * Readiness and liveness probes per Pod
  * Logs and metrics collection from critical services
  * External endpoint availability monitoring (e.g., via /health/readiness)
  * Custom health checks for components that do not expose HTTP-based endpoints



As first level of monitoring you can use your kuberenetes monitoring and simply make sure PODs in CZERTAINLY namesapce are alive. This need to more elaborate.