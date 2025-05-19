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

The problem can be resolved by removing `runAsUser` values from securityContext, see [czertainly.values.security.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.security.yaml)

## Resource limits

OpenShift instances are very often deployed with some default values of resources limits which are quite often very restrictive, like 40 mCPU per POD.

Those low default values of resources makes imposible to succesfully start CZERTAINLY platform. We provide [czertainly.values.resources.yaml](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/czertainly.values.resources.yaml) file which raises resource requests to about 3CPU and 10GB RAM.

## Ingress

Earlier versions of OpenShift did not support Ingress, newer do, however this guide wasn't upgraded yet.

OpenShift offers Routes instead if Ingress. They have some limitations like imposibility to do mTLS in way which CZERTAINLY platform requires. For this reason we configure [Route as passthrought](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/openshift-route.yaml) and and terminate TLS on [dedicated NGINX](https://github.com/semik/CZERTAINLY-OpenShift/blob/develop/nginx-ingress-deployment.yaml).

TODO explain naming.

## Example of deployment on OpenShift

```
# todo secret for harbor

helm upgrade -n semik75-dev --install czertainly-tlm \
    oci://harbor.3key.company/czertainly-helm/czertainly \
    --values=./czertainly.values.openshift.base.yaml \
    --values=./czertainly.values.security.yaml \
    --values=./czertainly.values.resources.yaml \
    --values=./czertainly.values.private.yaml

kubectl apply -f nginx-ingress-deployment.yaml \
    -f nginx-ingress-configmap.yaml \
    -f nginx-ingress-service.yaml \
    -f openshift-route.yaml
```