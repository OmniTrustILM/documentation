---
sidebar_position: 0
---

import DocCardList from '@theme/DocCardList';

# Configuration and Settings

The platform and its components are configured when they are deployed: with the Kubernetes Operator in the `Platform` resource, see [Platform options](../installation-guide/deployment/deployment-operator/custom-resources/platform-options.md), or with Helm in the chart values, see [Configurable parameters](../installation-guide/deployment/deployment-helm/configurable-parameters.md). Core settings that have no chart value or `Platform` field of their own, such as those of the [authentication and authorization caches](../concept-design/architecture/caching.md#configuration), are set as environment variables of Core.

Settings allows to configure subset of the platform setting during the runtime. The following settings are available:

<DocCardList/>