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

As first level of monitoring you can use your kuberenetes monitoring and simply make sure PODs in CZERTAINLY namesapce are alive.

## Commponents and their health endpoints

The CZERTAINLY platform includes several components that can be monitored. Some are mandatory, while others are optional and can be enabled based on your deployment needs. Below is a table summarizing the components, their public health check URLs if available, local URLs which are relative to the CZERTAINLY Core POD, and finally expected valid output patterns.

| Component                       | Optional | URL                                                | Local URL                                                             | Valid output            |
|---------------------------------|----------|----------------------------------------------------|-----------------------------------------------------------------------|-------------------------|
| CZERTAINLY Core                 | no       | `https://$hostname/api/v1/health/liveness`         | `http://localhost:8080/api/v1/health/liveness`                        | `^{"status":"UP"}$`     |
| CZERTAINLY Frontend             | yes      | `https://$hostname/administrator`                  | `http://fe-administrator-service:8080/`                               | `CZERTAINLY`            |
| CZERTAINLY Opa                  | no       | n/a                                                | `http://localhost:8181/health?bundle=true`                            | `^{}$`                  |
| API Gateway                     | no       | n/a                                                | `http://api-gateway-service:8100/status/ready`                        | `{"message":"ready"}'`  |
| Auth                            | no       | n/a                                                | `http://auth-service:8080/health`                                     | `^Healthy$`             |
| Auth OPA policies               | no       | n/a                                                | `http://auth-opa-policies-service:8080/`                              | `.*Welcome to nginx!.*` |
| Keycloak                        | yes      | `https://$hostname/kc/realms/master`               | `http://keycloak-internal-service:8080/kc/realms/master`              | `"realm":"master"`      |
| Scheduler Service               | no       | n/a                                                | `http://scheduler-service-service:8080/health/readiness`              | `^{"status":"UP"}$`     |
| Utils                           | yes      | n/a                                                | `http://utils-service-service:8080/health/readiness`                  | `^{"status":"UP"}$`     |
| | | | |
| Common Credential Provider      | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://common-credential-provider-service:8080/health/readiness`     | `^{"status":"UP"}$`     |
| Cryptosense Discovery Connector | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://cryptosense-discovery-provider-service:8080/health/readiness` | `^{"status":"UP"}$`     |
| CT-Logs-Discovery-Provider      | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://ct-logs-discovery-provider-service:8080/health/readiness`     | `^{"status":"UP"}$`     |
| EJBCA-NG-Connector              | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://ejbca-ng-connector-service:8080/health/readiness`             | `^{"status":"UP"}$`     |
| Email-Notification-Provider     | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://email-notification-provider-service:8080/health/readiness`    | `^{"status":"UP"}$`     |
| Keystore-Entity-Provider        | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://fe-administrator-service:8080/health/readiness`               | `^{"status":"UP"}$`     |
| Network Discovery Provider      | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://network-discovery-provider-service:8080/health/readiness`     | `^{"status":"UP"}$`     |
| PyADCS-Connector                | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://pyadcs-connector-service:8080/health/readiness`               | `^{"status":"UP"}$`     |
| Software-Cryptography-Provider  | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://software-cryptography-provider-service:8080/health/readiness` | `^{"status":"UP"}$`     |
| Webhook-Notification-Provider   | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://webhook-notification-provider-service:8080/health/readiness`  | `^{"status":"UP"}$`     |
| X509-Compliance-Provider        | yes      | `https://$hostname/api/v1/connectors/$uuid/health` | `http://x509-compliance-provider-service:8080/health/readiness`       | `^{"status":"UP"}$`     |

The `$hostname` is the hostname of your CZERTAINLY instance, which should be public URL if you want to monitor it from outside of your cluster. If you are monitoring it from inside the cluster, you can use the internal service names.

The `$uuid` in the URLs for connectors should be replaced with the actual UUID of the connector you want to monitor. You can find the UUID of each connector in the CZERTAINLY platform, using API call [/api/v1/connectors](https://docs.czertainly.com/api/core-connector#tag/Connector-Management/operation/listConnectors) /typically in the connector's configuration or details page.

We provide shell and python examples for how to check the health of these components programmatically. These examples can be adapted to your monitoring tools or scripts. The examples are available in the [    CZERTAINLY-API-examples/health](https://github.com/3KeyCompany/CZERTAINLY-API-examples/blob/develop/health/) GitHub repository.
