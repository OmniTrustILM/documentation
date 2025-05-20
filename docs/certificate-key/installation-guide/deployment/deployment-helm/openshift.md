---
sidebar_position: 5
---

# OpenShift

OpenShift is a Red Hat edition of Kubernetes. It has some differences from the general Kubernetes distribution, such as RKE2. When respecting these, it is possible to deploy and run the CZERTAINLY platform there.

## UID ranges

OpenShift uses UID isolation between namespaces. This isolation means that PODs in different namespaces can't run under the same UID. You can learn about assigned ranges:
```
$ oc describe project semik75-dev
Name:       semik75-dev
...
Annotations:
...
 openshift.io/sa.scc.supplemental-groups=1011740000/10000
 openshift.io/sa.scc.uid-range=1011740000/10000
```

OpenShift ignores the UID assigned by the `USER` command inside container images. CZERTAINLY Helm Charts respects those UIDs and defines them in `securityContext`, but this conflicts with OpenShift security limits, and containers fail to get scheduled with the error message:
`.containers[0].runAsUser: Invalid value: 70: must be in the ranges: [1011740000, 1011749999]`.

The problem can be resolved by removing `runAsUser` values from securityContext; this can be achieved by setting this key to a null value, like this:
```
schedulerService:
 image:
 securityContext:
 runAsUser: null
 curl:
 image:
 securityContext:
 runAsUser: null
```
A complete example value file can be found in [czertainly.values.security.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.security.yaml)

## Resource limits

OpenShift instances are often deployed with very low default resource limits, like 40 mCPU per POD.

Those low default values of resources make it impossible to start the CZERTAINLY platform successfully. We provide some suggestions in official values for every POD that is creating CZERTAINLY. Those suggestions are provided per POD in the form of comments inside each respective values file. For example: [czertainly/values.yaml](https://github.com/CZERTAINLY/CZERTAINLY-Helm-Charts/blob/main/charts/czertainly/values.yaml#L249).

A complete example with minimum resource limits is provided in [czertainly.values.resources.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.resources.yaml). The complete resource requests are pushed down to about 3CPU and 10GB RAM which allow basic functionality of CZERTAINLY platform. This is not enough for production usage, but it is enough for RedHat OpenShift developer sandbox which is free to use.

## Ingress

Earlier versions of OpenShift did not support ingress; newer versions do; however, this guide hasn't been upgraded yet.

OpenShift offers Routes instead of ingress. They have some limitations, like the imposibility to do mTLS in way which CZERTAINLY platform requires. For this reason we configure [Route as passthrought](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/openshift-route.yaml) and and terminate TLS on [dedicated NGINX POD](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/nginx-ingress-deployment.yaml) which works like ingress for CZERTAINLY.

The hostname of instance CZERTAINLY is created as a concatenation on '\$\{route.metadata.name\}-\$\{cluster-default-domain\}'. For example, in the free tier of OpenShift Developer sandbox, a user gets the default domain like _apps.rm3.7wse.p1.openshiftapps.com_, which is prefixed with _username-dev_. Complete hostname results in _czertainly-semik75-dev.apps.rm3.7wse.p1.openshiftapps.com_. Your situation might vary, but in general, it is a good idea to deploy the route as provided in this guide and then back the hostname, which is being added by your cluster after deployment.

## Example of deployment on OpenShift

```
git clone https://github.com/semik/CZERTAINLY-OpenShift.git
cd CZERTAINLY-OpenShift

# create a secret for accessing private images in harbor.3key.company (typically not required)
oc create secret docker-registry harbor-secret \
  --docker-server=harbor.3key.company \
  --docker-username=<uid> \
  --docker-password=<password> \
  --docker-email=<registerd-email>

# create route first
oc apply -f openshift-route.yaml
# retreive info about hostname
oc get route czertainly -o jsonpath='{.spec.host}' ; echo ''

# create your private values and fill them with valid content
cp czertainly.values.private.example czertainly.values.private.yaml

# install CZERTAINLY
helm upgrade -n semik75-dev --install czertainly-tlm \
  oci://harbor.3key.company/czertainly-helm/czertainly \
  --values=./czertainly.values.openshift.base.yaml \
  --values=./czertainly.values.security.yaml \
  --values=./czertainly.values.resources.yaml \
  --values=./czertainly.values.private.yaml

# install NGINX to terminate mTLS
kubectl apply -f nginx-ingress-deployment.yaml \
  -f nginx-ingress-configmap.yaml \
  -f nginx-ingress-service.yaml \
  -f openshift-route.yaml

# now you can test your CZERTAINLY deployment, don't forget to add /administrator/ after hostname :)
```