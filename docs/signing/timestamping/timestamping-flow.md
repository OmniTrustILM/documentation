---
sidebar_position: 3
---

# Timestamping Request Flow

This page documents the end-to-end path of a managed static-key RFC 3161 timestamp request through ILM Core. Only the **TIMESTAMPING × MANAGED (static key)** combination is engine-implemented; all other workflow/scheme cells exist as model types but have no engine wiring (see [Timestamping Overview](./overview.md)).

---

## Sequence diagram

The diagram below shows every stage a request passes through, from the moment it arrives at the TSP endpoint to the moment the RFC 3161 response is returned to the caller. Authentication is folded into the sequence because it happens in the HTTP filter layer — before any business logic runs.

```plantuml
@startuml
skinparam sequence {
    ArrowColor #1573B5
    ActorBorderColor #1573B5
    ParticipantBorderColor #1573B5
    ParticipantBackgroundColor #E1F5E0
    NoteBackgroundColor #F7F7F7
}
autonumber

actor Client
participant "TSP Endpoint" as Core
participant "TSP & Signing\nProfiles" as Profiles
participant "Time Quality\nRegister" as TQ
participant "Certificate\nValidator" as Cert
participant "Serial Number\nGenerator" as Serial
participant "Signature Formatter\nConnector" as Fmt
participant "Cryptographic\nToken" as Token
participant "Signing Record" as Rec

Client -> Core: TimeStampReq (POST)
Core -> Core: Authenticate
Core -> Core: Parse request
Core -> Profiles: Look up & authorize\nTSP + Signing Profile
Core -> Profiles: Validate request\n(hash alg, policy OID)
Core -> Profiles: Resolve profile\n(cert, key, chain, connector)
Core -> TQ: getStatus()
TQ --> Core: OK / DEGRADED
Core -> Cert: validate certificate
Cert --> Core: OK / NOK
Core -> Serial: generate()
Serial --> Core: serial number
Core -> Core: Capture genTime
Core -> Fmt: formatDtbs()
Fmt --> Core: DTBS
Core -> Token: sign(DTBS)
Token --> Core: signature
Core -> Fmt: formatSigningResponse()
Fmt --> Core: TimeStampToken
Core -> Rec: recordSigning()
Rec --> Core: written (per policy)
Core --> Client: TimeStampResp\n(granted / rejection)
@enduml
```

---

## Stage-by-stage walkthrough

### 1. Authentication (TspAuthenticationFilter)

Authentication is enforced by `TspAuthenticationFilter` — a Spring `OncePerRequestFilter` registered exclusively on the `/v1/protocols/tsp/**` security filter chain before any business-layer code runs. The filter orchestrates three collaborators:

- **TspRouteResolver** resolves the TSP Profile from the URL path. If no matching profile is found, the request is rejected with HTTP 401 before any credential is examined.
- **TspAuthenticator strategies** run in fixed priority order: `ClientCertificateAuthenticator` (mTLS, checked first), `BearerTokenAuthenticator` (JWT Bearer), `BasicPasswordAuthenticator` (HTTP Basic). The first authenticator whose `canHandle()` returns `true` claims the request. If the selected method is not listed in the TSP Profile's `allowedAuthenticationMethods`, the request is rejected with HTTP 401.
- **TspChallengeWriter** writes the `WWW-Authenticate` response header listing the methods the profile accepts.

`BasicPasswordAuthenticator` uses `CredentialVerificationCache` to skip the fingerprint comparison on hot-path repeat requests. A detailed treatment of the three credential types, the credential cache, and the secret-mapping model is covered in [Authentication & Authorization](./authentication-authorization.md).

### 2. Request parsing and TSP/Signing Profile lookup (TspControllerImpl → TsaServiceImpl)

`TspControllerImpl.timestamp()` passes the raw `byte[]` body to `TspRequestParser.parse()`, which decodes the ASN.1 `TimeStampReq` into a `TspRequest` value object (hash algorithm, hashed message, optional nonce, optional policy OID, `includeSignerCertificate` flag, and any request extensions).

`TsaServiceImpl.processTspRequestForTspProfile()` then:
1. Looks up the `TspProfileModel` by name and logs the profile reference.
2. Calls `permissionEvaluator.tspProfileTimestamping()` — an OPA policy check that verifies the authenticated principal has the TIMESTAMP action on the TSP Profile resource. An `AccessDeniedException` is caught in the controller and rendered as the same generic `BAD_REQUEST` rejection as a non-existent profile (enumeration defence: callers cannot distinguish missing from forbidden).
3. Fetches the linked `SigningProfileModel`, verifies it is enabled and has the TSP protocol active, and fetches its TSP profile.

### 3. Request validation (TspRequestValidator)

`TspRequestValidator.validate()` enforces the workflow-level rules declared on the `ManagedTimestampingWorkflow`:

- **Hash algorithm** — if `allowedDigestAlgorithms` is non-empty, the request's hash algorithm must be in the set; otherwise rejects with `BAD_ALG`.
- **Policy OID** — if `allowedPolicyIds` is non-empty and the request specifies a policy OID, it must match one of the allowed OIDs; otherwise rejects with `UNACCEPTED_POLICY`.

### 4. Profile resolution (StaticKeyManagedTimestampingResolver)

`SigningProfileResolverFactory.resolve()` selects `StaticKeyManagedTimestampingResolver` (the only resolver whose `supports()` returns `true` for a `ManagedTimestampingWorkflow`). The resolver dereferences all UUIDs stored on the profile model at request time — the resolved form is never cached:

- **Signing certificate and chain** — retrieved via `CertificateService`; the chain is decoded into a `CertificateChain` value object.
- **Key items** — retrieved via `CryptographicKeyService`.
- **Time Quality Configuration** — retrieved via `TimeQualityConfigurationService`; if none is configured, `LocalClockTimeQualityConfiguration.INSTANCE` is used (always reports `OK`).
- **Signature Formatter Connector** — retrieved via `ConnectorService`.

The result is a `ResolvedManagedTimestampingProfile` consumed by `ManagedTimestampEngine`.

### 5. Time quality check (TimeQualityRegister)

`ManagedTimestampEngine.process()` is the core orchestrator. Its first action is to call `timeQualityRegister.getStatus(timeQualityConfiguration)`.

`TimeQualityRegisterImpl.getStatus()` branches on the configuration type:

- **LocalClockTimeQualityConfiguration** — always returns `OK` (no external NTP reference required).
- **ExplicitTimeQualityConfiguration** — checks four conditions in order: the register must have a result for the configuration UUID; the result must not be stale (age ≤ `accuracy`); the TQM-reported status must be `OK`; and optionally the leap-second guard and monotonic drift detector must not be triggered.

If the status is anything other than `OK`, the engine immediately returns a `TspResponse.rejected(TIME_NOT_AVAILABLE, …)` and no token is assembled. The Time Quality Monitor that populates this register is documented in the [Time Quality Monitor](./time-quality-monitor.md) page.

### 6. Signing certificate validation (StaticKeyManagedSigningCertificateValidator)

`SigningCertificateValidatorFactory.getValidator()` selects `StaticKeyManagedSigningCertificateValidator`. Its `validate()` call checks that the signing certificate satisfies the TIMESTAMPING eligibility rules (extended key usage, validity, key usage) for the configured qualification level (qualified or non-qualified). An `NOK` result returns `TspResponse.rejected(SYSTEM_FAILURE, …)`.

### 7. Serial number generation (SnowflakeSerialNumberGenerator)

`serialNumberGenerator.generate()` produces a unique `BigInteger` using the Snowflake/Sonyflake layout:

- 40-bit 10 ms tick since a fixed epoch
- 16-bit instance ID (lower 16 bits of the container's private IPv4, or an explicit override)
- 8-bit per-tick sequence counter

Throughput ceiling is 25,600 tokens per second per instance. The generator protects against sequence overflow (waits up to 10 ms for the next tick) and backward clock jumps (rejects if the measured drift exceeds 100 ms, surfaced as `ClockDriftException` → `TIME_NOT_AVAILABLE`). Serial numbers conform to the 160-bit RFC 3161 field limit. Limitations of this scheme are covered in the [Limitations](./limitations.md) page.

`clockSource.wallTimeInstant()` captures `genTime` immediately after the serial number is issued, ensuring both values reflect the same clock sample.

### 8. Formatter phase 1 — formatDtbs (TimestampingConnectorSignatureFormatterClient)

`StaticKeyManagedTimestampTokenGenerator.generate()` handles the two-phase token assembly. Phase 1 calls `formatter.formatDtbs()`, which delegates to `TimestampingConnectorSignatureFormatterClient`. This class builds a `TimestampingFormatDtbsRequestDto` from the request fields (hash, nonce, policy OID, extensions, serial number, genTime, accuracy, certificate chain, signature algorithm, formatter attributes) and sends it to the configured Signature Formatter Connector over HTTP.

The connector encodes the CMS `SignedAttributes` (computed over the `TSTInfo`) and returns the DER bytes — the exact data to be signed. The connector and its two-phase calling convention are described on the [Timestamp Formatter Connector](./timestamp-formatter-connector.md) page.

### 9. Signing (CryptographicOperationServiceSigner)

`signerFactory.create()` resolves a `CryptographicOperationServiceSigner` pre-loaded with the key item UUID, token instance UUID, token profile UUID, and signing operation attributes. `signer.sign(dtbs)` calls `CryptographicOperationInternalService.signDataWithoutEventHistory()`, which routes the signing operation to the cryptographic token provider. The managed key never leaves the token; Core receives only the raw signature bytes.

`signer.getSignatureAlgorithm()` is called before phase 1 so the same algorithm is supplied to both formatter calls.

### 10. Formatter phase 2 — formatSigningResponse

`formatter.formatSigningResponse()` sends the DTBS bytes and the raw signature to the Signature Formatter Connector. The connector replays the `TSTInfo` encoding, injects the real signature into the CMS `SignedData` structure, and returns the fully assembled `TimeStampToken` bytes.

The engine parses these bytes into a `TimeStampToken` object (via BouncyCastle `CMSSignedData`). If `validateTokenSignature` is set on the profile, the engine verifies the signature against the signing certificate using `JcaSimpleSignerInfoVerifierBuilder` before proceeding. A verification failure returns `TspResponse.rejected(SYSTEM_FAILURE, …)`.

### 11. Signing record (SigningRecordStrategyFactory)

`recordSigning()` wraps the record write in a try/catch: a failure is logged but does not affect the response. The `SigningProfileModel`'s record policy determines which `SigningRecordStrategy` the factory selects:

- **IMMEDIATE** — synchronous write on the request thread before returning.
- **DEFERRED_DURABLE** — written to a durable outbox (AMQP-backed) and drained asynchronously.
- **BEST_EFFORT** — enqueued in an in-memory queue; dropped under backpressure.

The [Signing Records](./signing-records.md) page covers the record schema, retrieval API, and retention policy.

### 12. Response

`TspControllerImpl` calls `TspResponseBuilder.fromEngineResponse()` to encode the `TspResponse` into a `TimeStampResp` byte array and returns it as `HTTP 200 application/timestamp-reply`. RFC 3161 status codes (granted, rejection, waiting) are carried inside the response body — the HTTP status code is always 200 for any conforming TSP exchange.

Authorization denials and resource-not-found errors are both mapped to `TspFailureInfo.BAD_REQUEST` with a generic message so callers cannot distinguish a missing profile from a forbidden one.

---

## Error outcomes

| Stage | Failure type | RFC 3161 failure code |
|---|---|---|
| Authentication | Method not allowed, bad credentials | HTTP 401 (before RFC 3161 encoding) |
| Authorization | OPA denial | `badRequest` (enumeration defence) |
| TSP/Signing Profile not found or disabled | `NotFoundException` / disabled check | `badRequest` |
| Request validation | Bad hash algorithm | `badAlg` |
| Request validation | Disallowed policy OID | `unacceptedPolicy` |
| Profile resolution | Certificate/key/connector not found | `systemFailure` |
| Time quality | Status is DEGRADED | `timeNotAvailable` |
| Certificate validation | Eligibility check failed | `systemFailure` |
| Serial number | Clock drift > 100 ms | `timeNotAvailable` |
| Serial number | Tick overflow | `systemFailure` |
| Formatter (either phase) | Connector communication error | `systemFailure` |
| Token signature verification | Verification failure | `systemFailure` |
| Signing record | Write failure | (not propagated — token already granted) |

---

## Related pages

- [Signing Profile](./profiles/signing-profile.md) — workflow and scheme configuration
- [TSP Profile](./profiles/tsp-profile.md) — authentication methods, linked signing profile
- [Time Quality Configuration](./profiles/time-quality-configuration.md) — NTP reference, accuracy, leap-second guard
- [Timestamping Overview](./overview.md) — signing workflow/scheme taxonomy and component architecture

Pages that expand on topics touched here:

- [Authentication & Authorization](./authentication-authorization.md) — credential types, cache, secret mapping
- [Signing Records](./signing-records.md) — schema, retrieval, retention
- [Time Quality Monitor](./time-quality-monitor.md) — TQM sidecar, AMQP contract
- [Timestamp Formatter Connector](./timestamp-formatter-connector.md) — connector operation and the two-phase DTBS/response calling convention
- [Limitations](./limitations.md) — serial number throughput and overflow
