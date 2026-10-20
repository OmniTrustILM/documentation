// Published component versions and the pins for the remote-content syncs. Bumped on release.

/** Core, connector, messaging and protocol OpenAPI documents. */
export const apiVersion = '2.20.0';

/** Helm chart, used by docusaurus-plugin-remote-content. */
export const chartVersion = '2.20.0';

/** CSC component OpenAPI document, versioned independently of the platform. */
export const cscVersion = '1.7.0';

/** Kubernetes Operator, substituted into docs as %OPERATOR_VERSION%. */
export const operatorVersion = '1.1.0';

/** Command-line interface, substituted into docs as %CLI_VERSION%. */
export const cliVersion = '1.1.0';

// Immutable refs for the remote-content syncs: the release tag for the operator and cli,
// and, for the development environment, which publishes no releases, the commit that last
// changed its synced docs. Never point one of these at a branch — a branch pin makes the
// committed output silently disagree with what the next download produces.
export const operatorDocsRef = 'v1.1.0';
export const cliDocsRef = 'v1.1.0';
export const devenvDocsRef = 'a0c329790f17e625d1544e5dd859dd9cbea88f07';
