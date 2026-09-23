---
sidebar_position: 9
---

# Limitations

This page covers the deployment limits you need to account for before using the PKCS#11 connector in production.

## Use one connector replica

Use one connector replica for a token.

Two connector replicas can receive the same key-creation request at the same time. Both can observe that the key is absent and both can create it. Later requests then find more than one key under the same identifier.

Set the deployment strategy to `Recreate`. A rolling update can otherwise overlap the old and new pod even when `replicas` is set to `1`.

## Keep each proxy inside the connector pod

Each `Config Profile` needs its own proxy sidecar and port.

Do not publish a proxy through a Service, Ingress, or host port. The connector passes the HSM PIN to the sidecar when it opens a logged-in session.

Use a `NetworkPolicy` to prevent other workloads from reaching proxy ports through the pod IP.

## Finalize commercial vendor images yourself

The distributed sidecar base contains no commercial vendor library.

You must obtain the vendor software under your own agreement, finalize the sidecar image, and store the result in a private registry you control.

Do not put vendor configuration, trust material, or partition secrets in the image.

## Treat nShield storage as key material

Entrust nShield writes a wrapped client-side key blob for every generated key.

The volume mounted at `/var/lib/pkcs11-vendor` must persist across pod replacement. Protect, restrict, and back it up like the Security World Secret used to seed it.

All replicas must see the same key store. Use `ReadWriteMany` storage when more than one pod can mount it.

## Account for source-address enrollment

Entrust nShield authorizes each client address. A rescheduled pod can appear from a new address, depending on the cluster network.

Make the cluster egress identity predictable or update the appliance authorization when the visible source address changes.

## Do not use SoftHSM for production keys

SoftHSM stores keys in ordinary files. The complete sidecar image also starts with test PINs.

Use SoftHSM only for evaluation, development, and automated testing.

## Restart after startup-only changes

Vendor libraries read some settings only when the sidecar starts. These include Utimaco `CommandTimeout` and vendor connection configuration.

Changing the mounted Secret triggers a new pod through the Kubernetes Operator. When another deployment method is used, restart the pod explicitly.
