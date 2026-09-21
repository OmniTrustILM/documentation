---
sidebar_position: 5
---

# OpenShift

OpenShift is a Red Hat edition of Kubernetes. It has some differences from the general Kubernetes distribution, such as RKE2. When respecting these, it is possible to deploy and run the CZERTAINLY platform there.

## UID ranges

OpenShift uses UID isolation between namespaces. This means that pods in different namespaces cannot run under the same UID. You can check the UID/GID range assigned to a namespace using the following command: `oc describe project <project-name`.

Prior to version **2.15.0**, CZERTAINLY Helm charts used **hardcoded UIDs** (typically UID `10001`) to run containers. This approach was not compatible with OpenShift, which by default requires UIDs/GIDs to fall within the range assigned to the specific namespace.

This issue has been resolved in CZERTAINLY 2.15.0 and later, where dynamic UIDs are supported.

However, there's still an incompatibility in the `messagingService` component, which defines an `fsGroup` in the `podSecurityContext`:
```yaml
messagingService:
  podSecurityContext:
    fsGroup: 999
```

This setting ensures that the storage provisioner changes the group ownership of all files on the volume to GID 999, for example, [LongHorn operates this way](https://longhorn.io/docs/1.9.0/nodes-and-volumes/volumes/pvc-ownership-and-permission/).
Unfortunately, this is not compatible with OpenShift and may result in the following error:
```
Warning  FailedCreate  3m44s (x17 over 7m50s)  ... spec.securityContext.fsGroup: Invalid value: []int64{999}: 999 is not an allowed group...]
```
As a workaround, you can remove the `fsGroup` setting `messagingService.podSecurityContext.fsGroup: null` in your private values file. You can also use provided [czertainly.values.security.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.security.yaml).

## Resource limits

OpenShift instances are often deployed with very low default resource limits, like 40 mCPU per Container.

Those low default values of resources make it impossible to start the CZERTAINLY platform successfully. We provide some suggestions in official values for every POD that is creating CZERTAINLY. Those suggestions are provided per POD in the form of comments inside each respective values file. For example: [czertainly/values.yaml](https://github.com/CZERTAINLY/CZERTAINLY-Helm-Charts/blob/main/charts/czertainly/values.yaml#L249).

A complete example with minimum resource limits is provided in [czertainly.values.resources.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.resources.yaml). The complete resource requests are pushed down to about 3CPU and 10GB RAM, which allow basic functionality of the CZERTAINLY platform. This is not enough for production usage, but it is enough for RedHat OpenShift developer sandbox, which is free to use.

## Ingress

Earlier versions of OpenShift did not support ingress; newer versions do; however, this guide hasn't been upgraded yet.

OpenShift offers Routes instead of Ingress. They have some limitations, like the impossibility to do mTLS in a way which CZERTAINLY platform requires. For this reason, we configure [Route as passthrough](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/openshift-route.yaml) and terminate TLS on [dedicated NGINX POD](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/nginx-ingress-deployment.yaml), which works like an ingress for CZERTAINLY.

The hostname of instance CZERTAINLY is created as a concatenation of '\$\{route.metadata.name\}-\$\{cluster-default-domain\}'. For example, in the free tier of OpenShift Developer sandbox, a user gets the default domain like _apps.rm3.7wse.p1.openshiftapps.com_, which is prefixed with _username-dev_. Complete hostname results in _czertainly-semik75-dev.apps.rm3.7wse.p1.openshiftapps.com_. Your situation might vary, but in general, it is a good idea to deploy the route as provided in this guide and then back the hostname, which is being added by your cluster after deployment.

## Example of deployment on OpenShift

```
git clone https://github.com/semik/CZERTAINLY-OpenShift.git
cd CZERTAINLY-OpenShift

# Create a secret for accessing private images in harbor.3key.company (typically not required)
oc create secret docker-registry harbor-secret \
  --docker-server=harbor.3key.company \
  --docker-username=<uid> \
  --docker-password=<password> \
  --docker-email=<registerd-email>

# Create route first
oc apply -f openshift-route.yaml
# retrieve info about hostname
oc get route czertainly -o jsonpath='{.spec.host}' ; echo ''

# Create your private values and fill them with valid content
cp czertainly.values.private.example czertainly.values.private.yaml

# Install CZERTAINLY
helm upgrade -n semik75-dev --install czertainly-tlm \
  oci://harbor.3key.company/czertainly-helm/czertainly \
  --values=./czertainly.values.openshift.base.yaml \
  --values=./czertainly.values.resources.yaml \
  --values=./czertainly.values.security.yaml \
  --values=./czertainly.values.private.yaml

# Install NGINX to terminate mTLS
oc apply -f nginx-ingress-deployment.yaml \
  -f nginx-ingress-configmap.yaml \
  -f nginx-ingress-service.yaml \
  -f openshift-route.yaml

# Now you can test your CZERTAINLY deployment, don't forget to add /administrator/ after hostname :)
```