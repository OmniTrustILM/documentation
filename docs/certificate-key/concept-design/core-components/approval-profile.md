---
sidebar_position: 22
---

# Approval Profile

The `Approval Profile` stands as a fundamental cornerstone within the platform, orchestrating the seamless execution of approval processes for various supported operations. The following offers an in-depth exploration of the `Approval Profile` and its essential components, ensuring users possess a comprehensive understanding of its function and significance.

`Approval Profile` has the following parameters:

| Parameter      | Description                                                                                                                                    |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Name           | The distinctive label assigned to the `Approval Profile`                                                                                       |
| UUID           | The universally unique identifier uniquely representing the `Approval Profile`                                                                 |
| Description    | A concise yet informative explanation detailing the purpose and characteristics of the `Approval Profile`                                      |
| Expiry         | A time-based parameter expressed in hours, denoting the duration before an approval request automatically expires in the absence of any action |
| Approval Steps | A list of sequential approval steps that collectively define the progression of the approval process                                           |

## Approval steps

`Approval Profile` can define multiple approval steps that are executed in sequence from the first to the last step.
Each approval step defines the following:

| Parameter          | Description                                                                                                                                        |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Description        | A textual representation clarifying the intention and focus of the specific approval step                                                          |
| Approver Type      | A classification system encompassing `User`, `Group`, and `Role`, facilitating the assignment of the appropriate approvers to the given step       |
| Required Approvals | Applicable solely to non-`User` approver types, this parameter signifies the cumulative number of approvals needed to advance the approval process |
| User/Group/Role    | Depending on the designated approver type, this section identifies the specific entity entrusted with the approval for the corresponding step      |

An intrinsic attribute of the `Approval Profile` is its dynamic versioning system. As alterations are introduced, the version of the Approval Profile is incremented. This mechanism ensures meticulous tracking of approval process modifications, catering to both existing and new approval requests.

Authenticated users benefit from the capability to view a comprehensive list of approval requests assigned to them, including the associated statuses. This feature enhances transparency and accountability within the approval workflow.

By comprehending the nuances of the `Approval Profile` and its interconnected components, users are empowered to efficiently navigate and leverage approval processes for optimal authorization workflows.
