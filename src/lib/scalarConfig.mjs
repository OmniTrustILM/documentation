// Build the Scalar configuration for one API reference page.
//
// Every value is plain data: Docusaurus JSON-serializes route props, so a function-valued option
// would be silently dropped between the plugin and the browser.

/** @param {string} baseUrl @param {string} assetPath */
function withBaseUrl(baseUrl, assetPath) {
    return `${baseUrl.replace(/\/$/, '')}${assetPath}`;
}

/**
 * @param {{id: string, label: string, assetPath: string, title?: string}} entry
 * @param {{baseUrl: string}} site
 */
export function buildScalarConfiguration(entry, {baseUrl}) {
    return {
        url: withBaseUrl(baseUrl, entry.assetPath),
        title: entry.title || entry.label,

        // Redoc was a read-only reference. Keeping it that way avoids inviting readers to type
        // credentials into a documentation page or to drive traffic at the demo deployment.
        hideTestRequestButton: true,
        hideClientButton: true,

        // Scalar's own product surface: the Developer Tools bar and the "Ask AI" agent.
        // Only showDeveloperTools is set — showToolbar is a deprecated alias for it and logs a
        // console warning on every mount.
        showDeveloperTools: 'never',
        agent: {disabled: true, hideAddApi: true},

        telemetry: false,
        hideDarkModeToggle: true,
        documentDownloadType: 'direct',
        _integration: 'docusaurus',
    };
}
