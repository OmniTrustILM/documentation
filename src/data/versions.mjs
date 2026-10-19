// Published component versions and the pins for the remote-content syncs. Bumped on release.

/** Core, connector, messaging and protocol OpenAPI documents. */
export const apiVersion = '2.19.0';

/** Helm chart, used by docusaurus-plugin-remote-content. */
export const chartVersion = '2.19.0';

/** CSC component OpenAPI document, versioned independently of the platform. */
export const cscVersion = '1.7.0';

/** Kubernetes Operator, substituted into docs as %OPERATOR_VERSION%. */
export const operatorVersion = '1.0.0';

/** Command-line interface, substituted into docs as %CLI_VERSION%. */
export const cliVersion = '1.0.0';

// Immutable refs for the remote-content syncs. Until each repository cuts a release
// containing its synced docs, these are the merge SHAs of the documentation PRs; the
// operator and cli release runbooks then move them to 'v' + operatorVersion and
// 'v' + cliVersion. Never point one of these at a branch — a branch pin makes the
// committed output silently disagree with what the next download produces.
export const operatorDocsRef = '40ccbc3379993af1c8de31e56d1d216bffce3b7d';
export const cliDocsRef = '5e2d526f83ff0fd0acc4737476640654a31c85f3';
export const devenvDocsRef = '873df7f2c90a72c521f071e31f6e7450c4a0ffb9';
