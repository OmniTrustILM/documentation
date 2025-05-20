# OpenShift

OpenShift is a RedHat edition of Kubernetes, it has some differences from general type of Kubernetes distribution like RKE2, when respecting them it is possible deploy and run CZERTAINLY platform there.

## UID ranges

OpenShift uses UID isolation between namespaces. This means that PODs in diferent namespace can't run under same UID. You can learn about asigned ranges:
```
$ oc describe project semik75-dev
Name:		semik75-dev
...
Annotations:
...
		openshift.io/sa.scc.supplemental-groups=1011740000/10000
		openshift.io/sa.scc.uid-range=1011740000/10000
```

UID assigned by `USER` command inside container images are ignored by OpenShift. CZERTAINLY Helm Charts respects those UIDs and defines them in `securityContext` but this conflicts with OpenShift security limits and containers fails to get shedulled with error message:
`.containers[0].runAsUser: Invalid value: 70: must be in the ranges: [1011740000, 1011749999]`.

The problem can be resolved by removing `runAsUser` values from securityContext, this can be achieved by setting this key to null value, like this:
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
Complete example value file can be found in [czertainly.values.security.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.security.yaml)

## Resource limits

OpenShift instances are very often deployed with very low default values of resources limits, like 40 mCPU per POD.

Those low default values of resources makes imposible to succesfully start CZERTAINLY platform. We provide some suggestions in offical values for every POD creating CZERTAINLY. Those suggestions are provided per POD in form of comment inside each respective values file. For example: [czertainly/values.yaml](https://github.com/CZERTAINLY/CZERTAINLY-Helm-Charts/blob/main/charts/czertainly/values.yaml#L249).

Complete example with mimimum resource limits is provided in [czertainly.values.resources.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.resources.yaml). The complete resource requests are pushed down to about 3CPU and 10GB RAM which allow basic functionality of CZERTAINLY platform. This is not enough for production usage, but it is enough for RedHat OpenShift developer sandbox which is free to use.

## Ingress

Earlier versions of OpenShift did not support Ingress, newer do, however this guide wasn't upgraded, yet.

OpenShift offers Routes instead if Ingress. They have some limitations like imposibility to do mTLS in way which CZERTAINLY platform requires. For this reason we configure [Route as passthrought](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/openshift-route.yaml) and and terminate TLS on [dedicated NGINX POD](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/nginx-ingress-deployment.yaml) which works like ingress for CZERTAINLY.

The hostname of instance CZERTAINLY is created as contaction on '\$\{route.metadata.name\}-\$\{cluster-default-domain\}'. For example in free tier of OpenShift Developer sandbox a user get default domain _apps.rm3.7wse.p1.openshiftapps.com_ which is prefixed with _username-dev_. Complete hostname results in _czertainly-semik75-dev.apps.rm3.7wse.p1.openshiftapps.com_.Your situation might vary, but in general is good idea to deploy route as provided in this guide and than back check hostname which is being added by your cluster after deployment.

## Example of deployment on OpenShift

```
git clone https://github.com/semik/CZERTAINLY-OpenShift.git
cd CZERTAINLY-OpenShift

# create secret for accessing private images in harbor.3key.company (typicaly not required)
oc create secret docker-registry harbor-secret \
--docker-server=harbor.3key.company \
--docker-username=<uid> \
--docker-password=<password> \
--docker-email=<registerd-email>

# create route first
oc apply -f openshift-route.yaml
# retreive info about hostname
oc get route czertainly -o jsonpath='{.spec.host}' ; echo ''

# create your own private values and fill them with valid content
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

# now you can test your CZERTAINLY deployment, dont forget add /administrator/ after hostname :)
```