// Resolve the API catalog into routes, document URLs and navbar items.
//
// Everything here is pure: it turns the catalog data plus the published versions into the shapes
// the Docusaurus config, the plugin and the download script each need.

const DOCUMENT_BASE = 'https://api.otilm.com';
const SPEC_ASSET_ROOT = '/api-specs';
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VERSION_PATTERN = /^[\w.]+$/;

/** @param {string} id */
export function apiRoute(id) {
    return `/api/${id}/`;
}

/**
 * Site-absolute path of a downloaded document. The version segment keeps a release from being
 * served out of a browser or CDN cache that still holds the previous document.
 * @param {string} id @param {string} version
 */
export function specAssetPath(id, version) {
    return `${SPEC_ASSET_ROOT}/${version}/${id}.yaml`;
}

/** @param {string} id @param {string} document @param {string} version @param {boolean} isCsc */
function specUrl(id, document, version, isCsc) {
    const base = isCsc ? `${DOCUMENT_BASE}/csc/${version}` : `${DOCUMENT_BASE}/${version}`;
    return `${base}/${document}.yaml`;
}

/**
 * A version becomes both a URL segment and a directory name under static/, so it is checked
 * rather than trusted: a stray separator would write outside the documents directory.
 * @param {{apiVersion: string, cscVersion: string}} versions
 */
function assertVersions(versions) {
    for (const name of ['apiVersion', 'cscVersion']) {
        const value = versions[name];
        if (!value) {
            throw new Error(`${name} is required to resolve the API catalog`);
        }
        if (!VERSION_PATTERN.test(value)) {
            throw new Error(`${name} "${value}" may contain only word characters and dots`);
        }
    }
}

/** @param {[string, string, string?]} entry @param {string} groupLabel @param {Set<string>} seen */
function assertEntry([id, label], groupLabel, seen) {
    if (!id || !label) {
        throw new Error(`catalog group "${groupLabel}" has an entry without both an id and label`);
    }
    if (!ID_PATTERN.test(id)) {
        throw new Error(`API id "${id}" must be lowercase words separated by single hyphens`);
    }
    if (seen.has(id)) {
        throw new Error(`duplicate API id: ${id}`);
    }
    seen.add(id);
}

/**
 * @typedef {object} ResolvedApi
 * @property {string} id route segment and asset name
 * @property {string} label navbar label
 * @property {string} group navbar group label
 * @property {string} route site-absolute route, with a trailing slash
 * @property {string} version version the document is published under
 * @property {string} specUrl upstream document URL
 * @property {string} assetPath site-absolute path of the downloaded document
 */

/**
 * @param {import('../data/apiCatalog.mjs').CatalogGroup[]} groups
 * @param {{apiVersion: string, cscVersion: string}} versions
 * @returns {ResolvedApi[]}
 */
export function resolveApiCatalog(groups, versions) {
    assertVersions(versions);

    const seen = new Set();
    const groupLabels = new Set();
    return groups.flatMap((group) => {
        if (!group.entries?.length) {
            throw new Error(`catalog group "${group.label}" has no entries`);
        }
        // Navbar menus are keyed by label, so a repeated one would silently merge two groups.
        if (groupLabels.has(group.label)) {
            throw new Error(`duplicate catalog group label: ${group.label}`);
        }
        groupLabels.add(group.label);
        const isCsc = group.source === 'csc';
        const version = isCsc ? versions.cscVersion : versions.apiVersion;

        return group.entries.map((entry) => {
            assertEntry(entry, group.label, seen);
            const [id, label, document = `doc-openapi-${id}`] = entry;
            return {
                id,
                label,
                group: group.label,
                route: apiRoute(id),
                version,
                specUrl: specUrl(id, document, version, isCsc),
                assetPath: specAssetPath(id, version),
            };
        });
    });
}

/**
 * Navbar items in catalog order. A group with one entry becomes a plain link, so the single-API
 * groups keep rendering as links rather than one-item dropdowns.
 * @param {ResolvedApi[]} catalog
 */
export function buildApiNavbarItems(catalog) {
    const groups = new Map();
    for (const entry of catalog) {
        const items = groups.get(entry.group) ?? [];
        items.push({label: entry.label, to: entry.route});
        groups.set(entry.group, items);
    }

    return [...groups].map(([label, items]) => (
        items.length === 1
            ? {label, position: 'left', to: items[0].to}
            : {label, position: 'left', items}
    ));
}
