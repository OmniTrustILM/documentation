---
sidebar_position: 6
---

# Approvals

Approvals serve as an optional component in ensuring that certain operations and requests are authorized by the appropriate personnel prior to execution. 

Approvals guarantee that specific actions, such as requesting or revoking a certificate, receive validation from the designated individuals before they are carried out. This mechanism ensures that the requested action is sanctioned only when it garners approval from the authorized parties.

It's important to note that approvals are handled at the platform level and are distinct from the implementation of individual connectors.

The approval process is orchestrated through an entity known as the [`Approval Profile`](../core-components/approval-profile.md). This profile defines the sequential steps involved in obtaining an approval and designates the responsible approvers for each step.

Upon initiation of an approval request, the platform triggers notifications to the approvers specified in the corresponding Approval Profile. These approvers possess the authority to either grant or decline the approval request. Additionally, they can provide accompanying comments to elaborate on their decision.

The approval process reaches its conclusion when the request is either approved, rejected, or it expires due to a lack of action.

## Supported operations

The `Approval Profile` can be associated with a specific `RA Profile` to enable approval processes for various certificate management operations, including:
- Certificate issuance
- Certificate renewal
- Certificate rekeying
- Certificate revocation

Once a request is submitted, the linked `Approval Profile` governs the ensuing approval process. Notably, changes to the approval process are prohibited once the process has commenced. If modifications are necessary, the request must be canceled, followed by resubmission.

## Accessing approval requests

Access to the list of approval requests is restricted to authenticated users. This list provides comprehensive details about each approval request assigned to the user. The information encompasses:
- `Approval Profile` particulars
- Details about the requester
- Current status of the approval request
- Associated resource and action
- Dates of approval request creation and closure
- Approval steps, including the involved approvers and their decisions

Administrators possess the capability to view the entire catalog of approval requests, with the ability to override the status of these requests if circumstances warrant. It is important to note that any overrides are meticulously recorded within the system, facilitating auditing procedures.
