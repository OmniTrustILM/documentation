---
sidebar_position: 1
---

# Deployment using Virtual Appliance

ILM virtual appliance is pre-built image of virtual operating system packed in Open Virtual Appliance (OVA) format for running ILM platform.
It is intended for the environments where no Kubernetes cluster is available or the Kubernetes cluster cannot be used for various reasons.

## Virtual appliance content

Virtual Appliance consist of:
* **[Debian](https://www.debian.org/)** Linux operating system with amd64 architecture
* **[RKE2](https://rke2.io)**, also known as RKE Government, which is Rancher's next-generation Kubernetes distribution
* **[Helm](https://helm.sh/)** package manager for Kubernetes to install and upgrade Helm charts
* **[PostgreSQL](https://www.postgresql.org/)** database server to persist platform data
* **ILM Virtual Appliance Tools** as a set of scripts to simplify operations with the virtual appliance
* **SSH server** and default system user that can be used to access console and login into virtual appliance

Virtual appliance does not contain ILM platform containers by default. Containers are downloaded and deployed after the configuration of the virtual appliance is applied.

:::info[ILM container access]
Because of different availability and public/private access to containers, the virtual appliance by default does not contain pre-downloaded containers and images. All required and available containers and images are downloaded once the virtual appliance is configured with the repository and access credentials.
:::

## Virtual appliance requirements

| Resource | Optimum | Minimum |
|----------|---------|---------|
| CPU      | 8 cores | 4 cores |
| RAM      | 16 GB   | 12 GB   |
| disk     | 50 GB   | 20 GB   |

By *minimum* requirements we mean resources which are needed for ILM with all configurable componets and kubernetes installation and for basic evaluation of its features.

:::tip[Resource management]
Resources can be scaled up or down based on the needs of the platform. The resources needed for the ILM platform differs based on the number of managed objects, implemented use-cases, and required connectors.
:::

## Download and import image

To get the virtual appliance running in your environment for further  installation  and configuration, you must:
1. Download virtual appliance [image](https://threekeycz-my.sharepoint.com/:f:/g/personal/jan_tomasek_3key_company/EvTNcHQYa4BInbGsK-YSGHkB7BTKvI9JCZJJaQx2KC6eBw).
2. Optionally verify SHA256 hash of the image.
3. Import virtual appliance image to your virtual infrastructure.

For testing purposes, you can use:
- [Oracle VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- [VMware Workstation Player](https://www.vmware.com/content/vmware/vmware-published-sites/us/products/workstation-player/workstation-player-evaluation.html.html)
- [Parallels Desktop](https://www.parallels.com/)
- or any other virtualization tools capable of importing virtual images in **OVA** format

:::warning[Importing virtual appliance]
Import of virtual appliance is not covered by this documentation. Please refer to instructions of your virtualization SW vendor.
:::
