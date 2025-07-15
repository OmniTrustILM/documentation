---
sidebar_position: 5
---

# OpenShift

OpenShift is a Red Hat edition of Kubernetes. It has some differences from the general Kubernetes distribution, such as RKE2. When respecting these, it is possible to deploy and run the CZERTAINLY platform there.

## UID ranges

OpenShift uses UID isolation between namespaces. This isolation means that PODs in different namespaces can't run under the same UID. You can learn about assigned ranges by running the following command: `oc describe project <project-name`.

CZERTAINLY Helm Charts before version 2.15.0 were using hardcoded UIDs for running containers which were not compatible with OpenShift. It is now fixed in CZERTAINLY Helm Charts version 2.15.1 and later.

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
  --values=./czertainly.values.resources.yaml \
  --values=./czertainly.values.private.yaml

# install NGINX to terminate mTLS
oc apply -f nginx-ingress-deployment.yaml \
  -f nginx-ingress-configmap.yaml \
  -f nginx-ingress-service.yaml \
  -f openshift-route.yaml

# now you can test your CZERTAINLY deployment, don't forget to add /administrator/ after hostname :)
```