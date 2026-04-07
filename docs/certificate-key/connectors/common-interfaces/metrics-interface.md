---
sidebar_position: 12
---

# Metrics Interface

## Overview

Connector NG exposes a `Metrics` interface that provides standard [Prometheus](https://prometheus.io/docs/instrumenting/exposition_formats/) / [OpenMetrics](https://openmetrics.io/) metrics. These metrics can be scraped by observability solutions and collectors (Prometheus, Grafana Agent, OpenTelemetry Collector, etc.).

This interface is optional for all Connector NG implementations. If implemented, each connector must support at least one exposition format — Prometheus text, OpenMetrics, or both.

When a connector supports the [OpenMetrics](https://openmetrics.io/) exposition format, it must advertise the `openMetrics` [feature flag](info-interface.md#feature-flags) in its `Info` interface response.

## Endpoint

`GET /v1/metrics`

### Content negotiation

The connector responds in the format that best matches the client's `Accept` header, limited to the formats it supports.

| Client `Accept` header                                        | `openMetrics` feature flag present? | Response `Content-Type`                                       |
|---------------------------------------------------------------|-------------------------------------|---------------------------------------------------------------|
| `application/openmetrics-text; version=1.0.0; charset=utf-8` | Yes                                 | `application/openmetrics-text; version=1.0.0; charset=utf-8` |
| `application/openmetrics-text; version=1.0.0; charset=utf-8` | No                                  | `text/plain; version=0.0.4; charset=utf-8`                   |
| `text/plain; version=0.0.4; charset=utf-8`                   | Any                                 | `text/plain; version=0.0.4; charset=utf-8`                   |
| _(none / `*/*`)_                                             | Any                                 | connector's preferred supported format                        |

When a client requests OpenMetrics from a connector that does not advertise the `openMetrics` feature flag, the connector falls back to Prometheus text format instead of returning `406 Not Acceptable`.

### Response codes

| Response code             | Description                                              |
|---------------------------|----------------------------------------------------------|
| `200 OK`                  | Metrics returned successfully                            |
| `503 Service Unavailable` | Metrics cannot be produced due to a transient failure    |

## Naming and label rules

Following Prometheus naming conventions ensures interoperability with standard observability tooling:

- **Metric names**: `snake_case`, starting with a letter. Add unit suffix: `_seconds`, `_bytes`, `_total` (counters), `_ratio`.
- **Metric types**:
  - `counter` — monotonically increasing, always ends in `_total`
  - `gauge` — value that goes up and down (e.g., queue depth, in-flight requests)
  - `histogram` — latency and size distributions with configurable buckets (preferred for latency)
  - `summary` — avoid for cross-instance aggregation; prefer histograms
- **Labels**: use small, stable cardinality. Good: `method`, `route`, `status`. Avoid: `user_id`, `request_id`, or any free-form strings.

## Required metrics

All Connector NG implementations **must** expose the following metrics:

| Metric                                | Type      | Unit     | Required labels                         | Description                                                                                          |
|---------------------------------------|-----------|----------|-----------------------------------------|------------------------------------------------------------------------------------------------------|
| `app_build_info`                      | gauge     | 1        | `version`, `commit`, `runtime`          | Constant info metric set to 1. Identifies the running build. One timeseries per process.            |
| `process_start_time_seconds`          | gauge     | seconds  | —                                       | Unix epoch timestamp when the process started.                                                       |
| `process_cpu_seconds_total`           | counter   | seconds  | —                                       | Cumulative user + system CPU time of the process.                                                    |
| `process_resident_memory_bytes`       | gauge     | bytes    | —                                       | Resident set size (RSS) of the process.                                                              |
| `http_requests_total`                 | counter   | requests | `method`, `route`, `status`             | Count of completed incoming HTTP requests. Use templated route (e.g., `/users/{id}`).               |
| `http_request_duration_seconds`       | histogram | seconds  | `method`, `route`                       | Latency of incoming requests. Observed on request completion.                                        |
| `http_server_in_flight_requests`      | gauge     | requests | `route`                                 | Number of currently in-flight (being processed) requests.                                            |
| `http_client_requests_total`          | counter   | requests | `method`, `target`, `status`            | Count of outbound HTTP calls made by the connector. `target` is a low-cardinality logical name.      |
| `http_client_request_duration_seconds`| histogram | seconds  | `method`, `target`                      | Latency of outbound HTTP calls. Observed on completion.                                              |
| `connector_events_total`              | counter   | events   | `event`, `outcome` (`success`\|`error`) | Domain-level counter for the connector's main unit of work (e.g., certificates issued, keys signed). |

### Recommended histogram buckets

| Histogram                               | Recommended buckets (seconds)                            |
|-----------------------------------------|----------------------------------------------------------|
| `http_request_duration_seconds`         | 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10 |
| `http_client_request_duration_seconds`  | 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10        |

## Example output

```
# HELP app_build_info Build info for the connector
# TYPE app_build_info gauge
app_build_info{version="3.4.1",commit="a1b2c3d",runtime="java-21"} 1

# HELP process_start_time_seconds Unix epoch when the process started
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1.725790882e+09

# HELP http_requests_total Total number of completed HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",route="/v1/authority",status="200"} 1024
http_requests_total{method="POST",route="/v1/authority",status="500"} 3

# HELP http_request_duration_seconds Latency of incoming HTTP requests
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="POST",route="/v1/authority",le="0.05"} 800
http_request_duration_seconds_bucket{method="POST",route="/v1/authority",le="0.5"} 1020
http_request_duration_seconds_bucket{method="POST",route="/v1/authority",le="+Inf"} 1024
http_request_duration_seconds_sum{method="POST",route="/v1/authority"} 51.2
http_request_duration_seconds_count{method="POST",route="/v1/authority"} 1024

# HELP connector_events_total Domain-level events counter
# TYPE connector_events_total counter
connector_events_total{event="certificate_issued",outcome="success"} 980
connector_events_total{event="certificate_issued",outcome="error"} 44
```
