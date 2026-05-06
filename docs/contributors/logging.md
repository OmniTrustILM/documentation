---
sidebar_position: 10
---

# Logging

Proper logging is essential for effective debugging, monitoring, and auditing. This guide outlines best practices for implementing logging in the CZERTAINLY codebase. Adhering to these practices ensures consistency and helps maintain high code quality.

:::info[Logging in CZERTAINLY services]
CZERTAINLY is a microservices-based platform, meaning that each service can have its own logging configuration, specific to its requirements. The logging configuration is managed centrally by the Core of the platform. Connectors and other services can implement their own logging configuration, but they should adhere to the guidelines outlined in this document, adjusted to their specific needs and language.
:::

## Logging information

CZERTAINLY uses the system, audit, or event logs for all logging activities. Contributors must follow the standard logging structure as outlined in the [Logging Documentation](../certificate-key/logging/overview.md).

## Logging levels

Choose the correct logging level for your log statements:

| Level | Purpose                                                    | Example                                                      |
|-------|------------------------------------------------------------|--------------------------------------------------------------|
| TRACE | Very fine-grained logs, usually for tracing program flow.  | `logger.trace("Entering method getCertificateById")`         |
| DEBUG | Information useful for debugging during development.       | `logger.debug("Fetching certificate with ID: {}", id)`       |
| INFO  | General operational messages.                              | `logger.info("Certificate issued successfully: {}", certId)` |
| WARN  | Potential issues that may not require immediate attention. | `logger.warn("Certificate expiry is nearing: {}", certId)`   |
| ERROR | Errors that impact functionality.                          | `logger.error("Failed to issue certificate: {}", exception)` |

## General guidelines for logging

### Use logger configuration

Obtain the logger instance for consistent logging:

```java
private static final Logger logger = LoggerFactory.getLogger(ClassName.class);
```

### Log at the correct level

Use the appropriate log level for each message. Avoid using a higher log level than necessary.

**Bad Example:**

```java
logger.error("Certificate issued successfully: {}", certId);
```

**Good Example:**

```java
logger.debug("This is a debug message.");
logger.info("Service started successfully.");
logger.warn("Resource usage is nearing the limit.");
logger.error("Failed to process the request due to {}", exception.getMessage());
```

### Avoid sensitive data in logs

Never log sensitive data like passwords, private keys, secrets, or personally identifiable information (PII).

**Bad Example:**

```java
logger.info("User credentials: {}", userCredentials);
```

### Use contextual logging

Always provide context in log messages to make them actionable and meaningful. Avoid generic or unclear messages.

**Bad Example:**

```java
logger.warn("Certificate is expiring soon.");
```

**Good Example:**

```java
logger.warn("Certificate {} is nearing expiry. Days remaining: {}", certId, daysRemaining);
```

### Avoid excessive logging

Do not over-log, especially in loops or frequently called methods.

**Bad Example:**

```java
for (int i = 0; i < items.size(); i++) {
    logger.debug("Processing item: {}", items.get(i));
}
```

**Good Example:**

```java
logger.info("Processing {} items", items.size());
```

### Do not use `System.out.println()`

Always use the logging framework instead of `System.out.println()` for logging messages.

**Bad Example:**

```java
System.out.println("This is a debug message");
```

**Good Example:**

```java
logger.debug("This is a debug message");
```

### Include exception information

Pass exceptions to the logger to include stack traces and error details.

**Bad Example:**

```java
logger.error("Failed to process request: {}", exception.getMessage());
```

**Good Example:**

```java
logger.error("Failed to process request", exception);
```

## Structured logging guidelines

Platform supports the following types of structured logs:

### Audit logging

Audit log records all activities and operations initiated by user actions. Therefore, audit logs should be enforced on API endpoints. The `AuditLogged` annotation should be used to log all user-initiated actions, for example:

```java
@AuditLogged(module = Module.CERTIFICATES, resource = Resource.CERTIFICATE, operation = Operation.LIST)
public CertificateResponseDto listCertificates(SearchRequestDto request) throws ValidationException {
    return certificateService.listCertificates(SecurityFilter.create(), request);
}
```

See [`AuditLogged`](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/java/com/czertainly/core/aop/AuditLogged.java) annotation definition for more details.

### Event logging

Event logs are used to record operation-related events. The event logs are not necessarily user-initiated, but are generated by the system. The `LoggerWrapper` class should be initialized to log events, for example:

```java
private static final LoggerWrapper logger = new LoggerWrapper(UserManagementServiceImpl.class, Module.AUTH, Resource.USER);
```

The [`LoggerWrapper`](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/java/com/czertainly/core/logging/LoggerWrapper.java) class is a wrapper around the `Logger` class and provides additional methods to log events.

In the example above, the `LoggerWrapper` is initialized for the `UserManagementServiceImpl` class, with module `AUTH` and resource `USER` parameters. This configuration ensures will log all events related to user management, for example when the user is successfully created:

```java
logger.logEvent(Operation.CREATE, OperationResult.SUCCESS, response.toLogData(), null);
```

### Structured log format

Audit and event logs should follow a structured format. Platform automatically generates the log message based on the provided parameters. The log message should be comply with the JSON schema. See [Log Record Structure](../certificate-key/logging/log-record-structure.md) for more details.

### Useful resources for structured logging

- List of [Modules](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/core/logging/enums/Module.java)
- List of [Resources](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/core/auth/Resource.java)
- List of [Operations](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/core/logging/enums/Operation.java)

## Logging Configuration

Logging configuration is centrally managed. Contributors should avoid altering the logging configuration unless necessary. Refer to the [Logging Settings](../certificate-key/settings/logging.md) for details.

## Reviewing Logs

Before submitting a pull request:
- Verify that all log messages are clear and actionable.
- Ensure sensitive data is excluded from logs.
- Test the application to confirm that logs provide the necessary context.
