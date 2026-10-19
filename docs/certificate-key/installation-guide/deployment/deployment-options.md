---
sidebar_position: 1
---

# Deployment Options

Choosing a deployment option is the first installation step. The option you choose determines what you have to provide, how you install the platform, and how you upgrade it later — so make this choice before you prepare anything else.

## Comparing the options

The three options differ in how much of the stack comes with the deployment and in what happens on day 2, after the platform is running. The Kubernetes Operator and the Helm chart both run on a Kubernetes cluster that you provide; the virtual appliance needs no cluster at all.

| Option | Description | Recommended for | Reference |
|---|---|---|---|
| **Kubernetes Operator** (recommended) | A `Platform` custom resource describes the whole platform; the operator reconciles it continuously and can manage the database, messaging and identity provider for you. | Any current Kubernetes cluster (1.28 or newer). Continuous reconciliation, guarded upgrades, GitOps. | [Deployment using the Kubernetes Operator](deployment-operator/overview.md) |
| **Helm chart** | The umbrella chart renders the platform's manifests; you supply the database and re-run `helm upgrade` to change anything. | Existing Helm-based delivery pipelines. | [Deployment using Helm](deployment-helm/overview.md) |
| **Virtual appliance** | A turnkey appliance image that brings the platform online without a container platform. | Environments with no Kubernetes cluster. | [Deployment using Virtual Appliance](deployment-appliance/overview.md) |

## Deployment using the Kubernetes Operator

The Kubernetes Operator is the recommended option for any current Kubernetes cluster (1.28 or newer). You describe the desired platform once, as a `Platform` custom resource, and the operator keeps the cluster matching that description: it renders and applies the platform workloads and the edge, and — where you ask it to — provisions and operates the database, the messaging broker and the identity provider through their own upstream operators. Infrastructure you already run stays external and is referenced instead.

Because the description is a custom resource, it fits a GitOps pipeline without a templating step, and upgrades are guarded: the operator checks what a version move requires before it starts and refuses moves it cannot make safely.

Start with [Deployment using the Kubernetes Operator](deployment-operator/overview.md); its [Installation](deployment-operator/installation.md) page lists the prerequisites for this option and takes you through the installation.

## Deployment using Helm

The Helm chart suits an established Helm-based delivery pipeline. The umbrella chart renders the platform's manifests from your values file; you provide and operate the database, while messaging ships in-cluster by default and an identity provider can be enabled in-cluster or referenced externally. Every change — configuration or version — is another `helm upgrade` run against an updated values file.

Start with [Deployment using Helm](deployment-helm/overview.md). This option expects a database and a set of trusted certificates to exist before you install; see [Shared infrastructure](../introduction.md#shared-infrastructure).

## Deployment using a virtual appliance

The virtual appliance is for environments with no container platform at all. It is a turnkey image that brings the platform and the infrastructure it needs online together, and it is administered through its own interface rather than through Kubernetes.

Start with [Deployment using Virtual Appliance](deployment-appliance/overview.md).
