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
| Discovery                         | Initiates a discovery based on its definition                    | [DiscoveryCertificateTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/DiscoveryCertificateTask.java)                     |
| Certificate status update         | Update certificate status, validation, and compliance            | [UpdateCertificateStatusTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/UpdateCertificateStatusTask.java)               |
| Update Intune revocation requests | Manages updates of revocation requests in Intune                 | [UpdateIntuneRevocationRequestsTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/UpdateIntuneRevocationRequestsTask.java) |
| CBOM synchronization              | Synchronizes CBOMs from the CBOM Repository every hour           | [CbomSyncTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CbomSyncTask.java)                                                             |
| CBOM reconciliation               | Stores the CBOMs the hourly runs missed, every Sunday            | [CbomReconcileTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CbomReconcileTask.java)                                                   |
| CBOM skipped documents retention  | Removes old permanently skipped CBOM documents every day         | [CbomSyncSkipRetentionTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CbomSyncSkipRetentionTask.java)                                   |
| Crypto asset PQC re-evaluation    | Re-evaluates outdated PQC verdicts of crypto assets every hour   | [CryptoAssetPqcSweepTask](https://github.com/OmniTrustILM/core/blob/main/src/main/java/com/otilm/core/tasks/CryptoAssetPqcSweepTask.java)                                       |

The task type of a job is the name in the Reference column. The CBOM tasks are described in [CBOM](../core-components/cbom.md#synchronization), the re-evaluation in [Post-Quantum Readiness](./post-quantum-readiness.md#re-evaluation).

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

Only the CBOM tasks and the crypto asset PQC re-evaluation can skip a run, for example when there is nothing to do, or when the CBOM Repository is not configured or cannot be reached. A skipped run leaves no entry in the history; the job records when it last skipped a run and why.

A job also records the state of its schedule, such as `Scheduled` or `Paused`, and when the scheduler last fired it and will fire it next.

### Discovery jobs

A discovery job creates a [discovery](../modules/discovery.md) each time it runs, and its execution reports how that discovery ended:

| Discovery ends as                                    | Execution status |
|------------------------------------------------------|------------------|
| `Completed` or `Warning`                             | Succeeded        |
| `Cancelled` by a user                                | Cancelled        |
| `Failed`, or `Cancelled` for any other reason        | Failed           |

The other causes of `Cancelled` are listed in [Discovery status](../modules/discovery.md#discovery-status). None of them was asked for, so the execution fails.

A discovery job's execution stays open until its discovery ends. A stopped discovery keeps it open until it is resumed and ends, or until the stop expires and the discovery is cancelled. While an execution is open, the scheduled job cannot be deleted.

When the discovery cannot be created, the execution fails and says why. A discovery whose `Connector` refuses its configuration ends `Failed`, and so does the execution. A one-time discovery job is removed from the scheduler after an execution that succeeded or was cancelled, and stays in the scheduler after one that failed.

### Incremental and full discovery jobs

A discovery job can run with a [discovery window](../modules/discovery.md#discovery-window), when its `Connector` supports one. Each execution then discovers only what was created or changed since a start point:

- **Since the last successful run** starts from the time the job fired for its last successful execution, and runs full on its first execution, so a one-time job with this window always runs full. See [How the platform finds the start point](../modules/discovery.md#how-the-platform-finds-the-start-point).
- **Lookback** starts the same duration before every execution, whatever the earlier executions did. Choose a duration longer than the interval between executions, or what was created between them is missed.

Each job follows only its own history. Two jobs that discover the same target do not share a start point, so they can run side by side with different windows. A common pattern is a frequent incremental job that keeps the inventory current, and a less frequent full job that catches what an [incremental discovery does not detect](../modules/discovery.md#what-an-incremental-discovery-does-not-detect):

| Job | Window | Cron expression | Runs |
|-----|--------|-----------------|------|
| `Example CA - new certificates` | Since the last successful run | `0 0 * ? * *` | Every hour |
| `Example CA - full` | Full | `0 0 2 ? * SUN` | Every Sunday at 02:00 UTC |

Create the two jobs from the same discovery settings, changing only the window, the job name and the cron expression. When both are due at once, they run as two separate discoveries.

Only the cron expression of a scheduled job can be changed. To change its window, delete the job and schedule it again; the new job starts with a full execution when its window is Since the last successful run.

The Scheduler stands as an essential component within the platform, enabling the systematic execution of management and automation tasks. By mastering the concepts of Scheduled Tasks, Cron Expressions, and Execution History, users gain a thorough understanding of how to utilize this feature effectively.
