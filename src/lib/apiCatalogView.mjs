/** Resolve a site-absolute path under Docusaurus' configured base URL. */
export function apiSitePath(baseUrl, absolutePath) {
    return `${baseUrl.replace(/\/$/, '')}${absolutePath}`.replace(/\/$/, '');
}

/**
 * Build the small, serializable API directory from already validated document metadata.
 * The specifications themselves stay separate assets loaded only by the selected reference.
 * @param {{catalog: import('./apiCatalog.mjs').ResolvedApi[], manifest?: {entries?: Record<string, {title?: string, description?: string}>}, baseUrl: string}} options
 */
export function buildApiCatalogView({catalog, manifest, baseUrl}) {
    return catalog.map((entry) => {
        const document = manifest?.entries?.[entry.id];
        return {
            id: entry.id,
            label: entry.label,
            group: entry.group,
            title: document?.title || entry.label,
            description: document?.description || '',
            version: entry.version,
            route: apiSitePath(baseUrl, entry.route),
            specUrl: apiSitePath(baseUrl, entry.assetPath),
        };
    });
}

/**
 * Search is an intersection of words, optionally restricted to one catalog group.
 * @param {ReturnType<typeof buildApiCatalogView>} entries
 * @param {{query?: string, group?: string}} filters
 */
export function filterApiCatalog(entries, {query = '', group = ''} = {}) {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return entries.filter((entry) => {
        if (group && entry.group !== group) return false;
        const text = [entry.id, entry.label, entry.title, entry.description, entry.group].join(' ').toLowerCase();
        return words.every((word) => text.includes(word));
    });
}
