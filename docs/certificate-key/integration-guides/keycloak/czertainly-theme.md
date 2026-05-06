---
sidebar_position: 9
---

# Add CZERTAINLY Theme

Optionally, you can apply custom CZERTAINLY theme to Keycloak.
CZERTAINLY theme will make the login page for the users to be authenticated by Keycloak look like the login page for the users to be authenticated by the built-in authentication server.

The CZERTAINLY Keycloak theme is available:
- on [GitHub](https://github.com/3KeyCompany/CZERTAINLY-Keycloak-Theme) with complete source
- as docker container on [Docker Hub](https://hub.docker.com/r/3keycompany/czertainly-keycloak-theme)

## Install theme

Assuming using the official Keycloak container images `quay.io/keycloak/keycloak`, the CZERTAINLY Keycloak theme can be installed in the Kubernetes environment using `initContainers` that will make it available to Keycloak during boot, for example:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keycloak-deployment
  labels:
    app: keycloak
  namespace: keycloak
spec:
  replicas: 1
  selector:
    matchLabels:
      app: keycloak
  template:
    metadata:
      labels:
        app: keycloak
    spec:
      initContainers:
        - name: init-theme
          image: 3keycompany/czertainly-keycloak-theme:0.1.0
          command:
            - /bin/sh
            - -c
            - |
              cp -a /themes/. /data/
          volumeMounts:
            - mountPath: /data
              name: shared-disk
      containers:
        - name: keycloak
          image: quay.io/keycloak/keycloak:19.0.2
          args: ["start-dev", "--import-realm"]
          ports:
            - name: http
              containerPort: 8080
          readinessProbe:
            httpGet:
              path: /realms/master
              port: 8080
          volumeMounts:
            - mountPath: /opt/keycloak/themes
              name: shared-disk
              readOnly: true
      volumes:
        - name: shared-disk
          emptyDir: {}
```

## Apply theme

Once the theme is installed, it can be applied to the CZERTAINLY client by setting the **Login theme** to `czertainly`, see [Login settings](https://www.keycloak.org/docs/latest/server_admin/#login-settings) in the Keycloak documentation.

:::info[Keycloak themes]
For more information about custom themes, refer to [Keycloak Themes](https://www.keycloak.org/docs/latest/server_development/#_themes) documentation.
:::