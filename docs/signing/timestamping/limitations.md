---
sidebar_position: 9
---

# Limitations

This page covers two categories of operational limits: the throughput and longevity constraints imposed by the serial-number generator, and the cascade behaviour that occurs when dependent resources are deleted while a Signing Profile still references them.

---

## Serial-number generation

Every RFC 3161 timestamp token requires a unique serial number. ILM generates these timestamp-token serial numbers using a Snowflake/Sonyflake-style 64-bit generator that produces monotonically increasing, structurally unique identifiers without coordination between instances.

### Bit layout

The 64-bit identifier is partitioned into three fields with no sign bit. Bit positions count from the most-significant end (bit 63) to the least-significant end (bit 0).

| Bits | Width | Field | Meaning |
|---|---|---|---|
| 63–24 | 40 | Timestamp | 10 ms ticks elapsed since the custom epoch `2026-02-01T00:00:00Z`; valid until approximately 2374 |
| 23–8 | 16 | Instance ID | Lower 16 bits of the container's private IPv4 address, or an explicit value set via the `SIGNING_INSTANCE_ID` environment variable |
| 7–0 | 8 | Sequence counter | Per-tick counter; incremented for each serial issued within the same 10 ms window; resets to 0 on each new tick |
| — | 64 | Total | Hex-aligned; fits within the 160-bit serial number limit mandated by RFC 5280 and referenced by RFC 3161 |

### Throughput ceiling

The 8-bit sequence counter allows up to 256 serial numbers per 10 ms tick, giving a throughput ceiling of **25,600 tokens per second per instance** (256 × 100 ticks/second). This ceiling is per-instance; horizontally scaled deployments multiply it by the number of replicas, provided each replica carries a distinct Instance ID.

### Clock-regression handling

The generator protects against three failure modes:

- **Sequence overflow** — when the 8-bit counter exhausts within a single 10 ms tick, the generator spin-waits for the next tick (maximum 10 ms). This wait is negligible relative to a typical timestamp request round-trip.
- **Backward clock jump** — if the system clock regresses, the generator spin-waits for the clock to catch up. If the regression exceeds **100 ms**, the request is rejected with `timeNotAvailable` rather than waiting indefinitely. No serial numbers are issued during the wait period.
- **Timestamp overflow** — if the 40-bit tick counter would overflow (would occur in approximately year 2374), the request is rejected with `systemFailure`.

### Year ceiling

The 40-bit timestamp field can represent 2^40 − 1 = 1,099,511,627,775 ticks. At 10 ms per tick, this covers approximately 348.6 years. Starting from the epoch `2026-02-01T00:00:00Z`, the field overflows around the year **2374**.

### Instance ID collisions

The Instance ID field is 16 bits wide, supporting values 0–65,535. When derived automatically from the container's private IPv4 address, only the lower 16 bits of the address are used. In deployments where the pod CIDR is wider than `/16`, multiple pods may share the same lower 16 address bits, producing duplicate serial numbers. For production deployments, set the `SIGNING_INSTANCE_ID` environment variable explicitly on each replica to a unique value.

---

## Dependent-resource deletion

A Signing Profile binds a number of other resources — its TSA signing certificate, Token Profile, RA Profile, delegated-signer and signature-formatter connectors, Time Quality Configuration, and TSP Profile (see the [entity-relationship diagram on the Signing Profile page](./profiles/signing-profile.md#entity-relationship-diagram)). While any of these is still referenced, the platform **will not let it be deleted**: attempting to remove a resource that a Signing Profile (or one of its versions) depends on is rejected, so a profile can never be left pointing at something that no longer exists. The same protection extends one step further — a Token Instance cannot be removed while Token Profiles still depend on it.

To retire one of these resources, first update or delete every Signing Profile (version) that references it, then delete the resource.

Deleting the Signing Profile itself is likewise guarded: it is rejected while any TSP Profile still names it as its default, or while any signing records exist against it (any version). Once those are cleared and the profile is deleted, its version history is removed with it.
