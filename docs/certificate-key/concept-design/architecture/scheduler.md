---
sidebar_position: 7
---

# Scheduler

The Scheduler is a core component responsible for orchestrating the timely execution of management and automation tasks. It serves as the control center for running tasks, handling task queues, and maintaining an organized history of task executions. To achieve these tasks, we utilize the [Quartz Scheduler](http://www.quartz-scheduler.org/) as the underlying implementation.

A scheduled task is characterized by parameters, each contributing to its effective execution:
- **Name**: A descriptive label assigned to the task.
- **Task Type**: Specifies the nature of the task to be executed.
- **One Time Only**: Determines if the task is intended for a single execution.
- **System Job**: Identifies whether the task is a system job, thus preventing unauthorized modifications.
- **Enabled**: Indicates if the task is active and ready for execution.
- **Last Execution Status**: Provides information about the outcome of the latest execution.
- **Cron Expression**: A specialized syntax that defines when the task should be executed.

## Supported task types

The Scheduler supports a range of task types, catering to various aspects of the platform's functionality

| Task type                         | Description                                                      | Reference                                                                                                                                                                       |
|-----------------------------------|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Certificate discovery             | Initiates the certificate discovery process based on definitions | [DiscoveryCertificateTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/DiscoveryCertificateTask.java)                     |
| Certificate status update         | Update certificate status, validation, and compliance            | [UpdateCertificateStatusTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/UpdateCertificateStatusTask.java)               |
| Update Intune revocation requests | Manages updates of revocation requests in Intune                 | [UpdateIntuneRevocationRequestsTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/UpdateIntuneRevocationRequestsTask.java) |
| CBOM synchronization              | Synchronizes CBOM documents from the CBOM Repository every hour and onboards their cryptographic assets; see [CBOM](../core-components/cbom.md#synchronization) | [CbomSyncTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CbomSyncTask.java) |
| CBOM reconciliation               | Reads the whole CBOM Repository listing every Sunday to store what the hourly runs missed; see [CBOM](../core-components/cbom.md#sync-runs) | [CbomReconcileTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CbomReconcileTask.java) |
| CBOM skipped documents retention  | Removes permanently skipped CBOM documents past their retention from the skipped documents list every day; see [CBOM](../core-components/cbom.md#retention) | [CbomSyncSkipRetentionTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CbomSyncSkipRetentionTask.java) |
| PQC verdict re-evaluation         | Re-evaluates stale post-quantum readiness verdicts every hour; see [Post-Quantum Readiness](../modules/post-quantum-readiness.md#re-evaluation-sweep) | [CryptoAssetPqcSweepTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CryptoAssetPqcSweepTask.java) |

The four CBOM and cryptographic asset tasks are registered by the platform as system jobs: they can be disabled and enabled again, but their schedule cannot be edited and they cannot be deleted.

## Task execution mechanism

Tasks within the Scheduler are executed based on a defined cron expression. A cron expression is a string comprising 6 or 7 fields, each indicating different aspects of the schedule. These fields include seconds, minutes, hours, day of month, month, day of week, and optionally, the year.

The cron expression allows for special characters such as `*`, `-`, `,`, `/`, `L`, `W`, and `?` to define intricate execution patterns.

| Field name   | Mandatory                                     | Allowed values   | Allowed special characters |
|--------------|-----------------------------------------------|------------------|----------------------------|
| Seconds      | <span class="badge badge--success">Yes</span> | 0-59             | `* / , -`                  |
| Minutes      | <span class="badge badge--success">Yes</span> | 0-59             | `* / , -`                  |
| Hours        | <span class="badge badge--success">Yes</span> | 0-23             | `* / , -`                  |
| Day of month | <span class="badge badge--success">Yes</span> | 1-31             | `* / , - ? L W`            |
| Month        | <span class="badge badge--success">Yes</span> | 1-12 or JAN-DEC  | `* / , -`                  |
| Day of week  | <span class="badge badge--success">Yes</span> | 0-6 or SUN-SAT   | `* / , - ? L W`            |
| Year         | <span class="badge badge--danger">No</span>   | empty, 1970–2099 | `* / , -`                  |

### Special characters meaning

The following special characters are allowed:

| Character | Description           |
|-----------|-----------------------|
| `*`       | all values            |
| `?`       | no specific value     |
| `-`       | range of values       |
| `,`       | value list separator  |
| `/`       | step values           |
| `L`       | last day of the month |
| `W`       | weekday               |

For more detailed explanations and additional examples, consult the [Cron Trigger Tutorial](http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html).

## Task execution history

The Scheduler meticulously maintains a history of task executions, capturing essential details such as:

- Start time of execution
- End time of execution
- Duration of execution
- Execution status

Additionally, the execution history may encompass supplementary information and references to objects that were processed by the task.

The Scheduler stands as an essential component within the platform, enabling the systematic execution of management and automation tasks. By mastering the concepts of Scheduled Tasks, Cron Expressions, and Execution History, users gain a thorough understanding of how to utilize this feature effectively.
