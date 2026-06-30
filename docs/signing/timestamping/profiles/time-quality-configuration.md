---
sidebar_position: 3
---

# Time Quality Configuration

A Time Quality Configuration defines the parameters that govern how the Time Quality Monitor evaluates whether the system clock is trustworthy enough to produce a timestamp token. A Signing Profile references at most one Time Quality Configuration. When no configuration is associated with a profile, time quality enforcement is not applied.

For the entity-relationship diagram showing how Time Quality Configuration relates to Signing Profiles and other resources, see the [entity-relationship diagram on the Signing Profile page](./signing-profile.md#entity-relationship-diagram).

---

## Purpose

RFC 3161 timestamp tokens assert the time at which a document existed. Issuing a token with a miscalibrated or drifted clock would produce a meaningless or misleading assertion. A qualified electronic time stamp must, under eIDAS Art. 42(1)(b), be based on an accurate time source linked to UTC, and ETSI EN 319 421 sets out the corresponding time-source accuracy and calibration requirements for the TSP. The Time Quality Configuration encodes the thresholds that the Time Quality Monitor uses to classify clock state as either **OK** (within policy, tokens may be issued) or **DEGRADED** (outside policy, tokens are withheld).

The [Time Quality Monitor](../time-quality-monitor.md) page covers the monitoring lifecycle, status evaluation, and leap-second logging.

---

## Parameter semantics

### `accuracy`

A duration that serves two distinct purposes:

1. **Claimed precision.** It is the accuracy value embedded in the `Accuracy` field of issued `TSTInfo` structures, so it directly impacts the precision each timestamp token claims for itself.
2. **Result freshness window.** It is also the maximum age of a stored Time Quality result before that result is treated as stale. Core rejects a request when the last result it holds for the configuration is older than `accuracy` (`now > result.timestamp + accuracy`), returning `timeNotAvailable` — see [request flow](../timestamping-flow.md). Because the monitor refreshes the register every `ntpCheckInterval`, set `accuracy` comfortably larger than `ntpCheckInterval`, or every request will be rejected as stale.

Note that `accuracy` is **not** a clock-error threshold — the permissible clock drift is governed separately by [`maxClockDrift`](#maxclockdrift). Setting `accuracy` too loose degrades the usefulness of the tokens as evidence of time; setting it tighter than `ntpCheckInterval` starves the hot path of fresh results.

### `ntpServers`

The list of NTP server addresses (hostnames or IP addresses) that the monitor contacts during each check cycle, using SNTP (RFC 4330). Providing multiple servers enables cross-validation and guards against a single server being unreachable or returning a bad reference. The servers should be traceable to UTC, as required for the time source of a qualified time stamp (eIDAS Art. 42(1)(b)).

### `ntpCheckInterval`

The interval between successive measurement cycles. Shorter intervals improve responsiveness to clock anomalies at the cost of higher NTP traffic. Longer intervals reduce traffic but allow a drifting clock to stay in service longer before detection.

### `ntpSamplesPerServer`

The number of individual NTP packets sent to each server within a single cycle. Multiple samples per server reduce the effect of transient packet loss or network jitter on the computed offset estimate.

### `ntpCheckTimeout`

The overall time budget for a complete check cycle. Querying every configured server — each for its configured number of samples — runs under this single deadline. Any server whose samples have not completed when the deadline expires is treated as unreachable for that cycle and excluded from the aggregate, which can in turn push the cycle below `ntpServersMinReachable`.

### `ntpServersMinReachable`

The minimum number of NTP servers that must respond successfully within a cycle for the clock to be considered well-anchored. If fewer servers than this threshold are reachable, the monitor transitions to DEGRADED regardless of the measured drift.

### `maxClockDrift`

The maximum allowable difference between the NTP-derived reference time and the local clock reading — the operator's expression of the time-source accuracy tolerance required by ETSI EN 319 421. When the measured drift exceeds this value, the monitor transitions to DEGRADED and the Signing Profile will not issue new timestamp tokens until the condition clears.

### `leapSecondGuard`

When `true`, the monitor emits a throttled WARNING log whenever the aggregate leap indicator is `LeapInsert` (positive leap second pending) or `LeapDelete` (negative leap second pending). Status remains **OK**; timestamp issuance is not affected.

This flag does not cause DEGRADED. DEGRADED due to a leap-second condition fires independently — only when reachable servers simultaneously report both `LeapInsert` and `LeapDelete`, causing the aggregate to resolve to `LeapUnsync`. A single server reporting unsynchronised (`LI=3`) is excluded from aggregation before this calculation and cannot by itself produce `LeapUnsync`.

---

## Effect on timestamping

A Signing Profile references at most one Time Quality Configuration. When:

- The Signing Profile has a Time Quality Configuration associated **and** the monitor reports **DEGRADED** — the profile will not issue timestamp tokens.
- The Signing Profile has a Time Quality Configuration associated **and** the monitor reports **OK** — timestamp issuance proceeds normally.
- The Signing Profile has **no** Time Quality Configuration associated — time quality enforcement is not applied.

The [Time Quality Monitor](../time-quality-monitor.md) page describes how the monitor evaluates each parameter and how the resulting status is reported.

---

## Relationships summary

- A Time Quality Configuration may be referenced by zero or more Signing Profiles.
- Time Quality Configuration does not own or reference any other entities directly; it is a standalone configuration object.

See the [entity-relationship diagram on the Signing Profile page](./signing-profile.md#entity-relationship-diagram) for the full relationship map.

---

## Related pages

- [Time Quality Monitor](../time-quality-monitor.md) — how the monitor evaluates these parameters and reports status
- [Time Quality Messaging Contract](../time-quality-messaging.md) — how configurations are delivered to the monitor
- [Signing Profile](./signing-profile.md) — how a profile associates a Time Quality Configuration
