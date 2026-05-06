---
sidebar_position: 0
---

# Overview

The architecture of the platform follows microservice approach.
Each component and each part of the platform is a microservice. Using that approach, the platform is able to scale and maintain the services as needed.

## Architecture diagram


![Czertainly ingredients](../../../assets/platform-ingredients.png)

The above diagram explains briefly the architecture of the platform. The platform provides client interfaces to communicate with the `Core`.

The `Core` is the brain of the platform and is responsible for application logic and communication with authorized `Connector`. `Connector` is the implementation of the technology. `Connector` implements the logic which is specific to the technology and provides a consistent results for the `Core`.

Each `Interface` in the platform is designed to be a REST API with OpenAPI specification. This ensures that the platform is easy to use and maintain, extensible, flexible, and technology independent. 

## Sample process flow

The step below illustrates the process flow of processing request by the platform:

| Step # | Description                                                                                                                                                                                                     |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1      | `Client` triggers a request to the `Core`.                                                                                                                                                                      |
| 2      | `Core` receives the request and applies the logic to process the request. If needed, the `Core` communicates with the appropriate `Connector` for further technology specific processing.                       |
| 3      | `Connector` process the request and translates the response to a format `Core` can understand.                                                                                                                  |
| 4      | Once the `Core` gets the data from the `Connector`, it performs some designated operations based on the implemented logic. Once these operations are completed the `Core` returns the response to the `Client`. |
