---
sidebar_position: 5
---

# Certificate Discovery

One of the most important tasks in managing the PKI Infrastructure is to know where the certificates are deployed and what is their state. `Certificate Discovery` allows discovering the certificates in various sources.

The `Certificate Discovery` works with the help of the `Connector` that is implementing the `Discovery Provider` `Function Groups`.

:::info
The `Connector` implementing the `Discovery Provider` `Function Group` has its own `Attributes` for the inputs related to the discovery process.
:::

The logic of the `Certificate Discovery` is implemented by the `Core` and specific discovery process by the `Connector`.

## Discovery Process

The following steps explain the process of `Certificate Discovery`:

1. `Client` defines the `Connector` to initiate the `Certificate Discovery`
2. Get the list of `Attributes` for the selected `Connector` and `Kind`
3. Provide the proper values for the input `Attributes`
4. Initiate `Certificate Discovery`

Once the `Core` receives the discovery request, `Attributes` are forwarded to the `Connector`. The `Core` is checking the `Connector` for the status of the discovery process. When the discovery is completed, `Core` collects all `Certificates`.
Afterwards, discovery is switched to `Processing` state. In this phase, assigned triggers during discovery creation are evaluated on newly discovered certificates. For any matched ignore trigger, certificate is ignored from processing and not added to the certificate inventory. For all other matched triggers, its corresponding actions are performed. Currently, triggers can be assigned for discovery event `Finished`.


## Operations

The `Certificate Discovery` allows you to perform the following operations:

| Operation | Description                                                                                                                            |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------|
| Create    | You can create a new discovery with any desired `Connector` that implements `Discovery Provider` `Function Group`.                     |
| List      | List of all discovery processes that has been initiated through the platform. The information includes the `Connector` and the `Kind`. |
| Details   | Provides details about the `Certificate Discovery`.                                                                                    |

## Discovery Status

| Status      | Description                                                             |
|-------------|-------------------------------------------------------------------------|
| In Progress | The discovery process has not finished yet                              |
| Processing  | The discovery process has finished and found certificates are processed |
| Completed   | The process has already finished and certificates are processed         |
| Failed      | Some errors have occurred                                               | 
| Warning     | The discovery process did not finish in maximum time of 6 hours         | 
