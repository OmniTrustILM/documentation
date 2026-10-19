// Work out the fragment Scalar gives each operation, so documentation can link straight to it.
//
// Redoc addressed an operation by its operationId (#tag/Authority-Management/operation/createAuthorityInstance).
// Scalar addresses it by tag, method and path (#tag/authority-management/POST/v1/authorities). Both
// forms are derivable from the OpenAPI document, so links can be written in one and published in
// the other.

const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

/**
 * Scalar's slug function, reproduced exactly.
 *
 * Punctuation is dropped rather than replaced, so "Statistics/Dashboard" becomes
 * "statisticsdashboard" — which matters, because a slash would otherwise split the fragment.
 *
 * @param {string} text
 */
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Fragment for one operation, without the leading "#".
 * @param {string} tag @param {string} method @param {string} path
 */
export function operationAnchor(tag, method, path) {
    return `tag/${slugify(tag)}/${method.toUpperCase()}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Fragment for a tag section, without the leading "#". @param {string} tag */
export function tagAnchor(tag) {
    return `tag/${slugify(tag)}`;
}

/**
 * Every fragment a document offers: one per tag section and one per operation.
 * @param {Record<string, any>} document parsed OpenAPI document
 * @returns {Set<string>}
 */
export function buildDocumentAnchors(document) {
    const anchors = new Set(Object.values(buildOperationAnchors(document)));

    for (const pathItem of Object.values(document?.paths ?? {})) {
        if (!pathItem || typeof pathItem !== 'object') continue;
        for (const [method, operation] of Object.entries(pathItem)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) continue;
            for (const tag of operation?.tags ?? []) {
                if (typeof tag === 'string') anchors.add(tagAnchor(tag));
            }
        }
    }

    return anchors;
}

/**
 * Map every operationId in a document to its Scalar fragment.
 *
 * An operation is filed under its first tag, which is where Scalar puts it in the sidebar.
 * Operations without an operationId or without a tag cannot be addressed this way and are skipped.
 *
 * @param {Record<string, any>} document parsed OpenAPI document
 * @returns {Record<string, string>} operationId -> fragment
 */
export function buildOperationAnchors(document) {
    const anchors = {};

    for (const [path, pathItem] of Object.entries(document?.paths ?? {})) {
        if (!pathItem || typeof pathItem !== 'object') continue;

        for (const [method, operation] of Object.entries(pathItem)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) continue;
            const tag = operation?.tags?.[0];
            const operationId = operation?.operationId;
            if (typeof tag !== 'string' || typeof operationId !== 'string') continue;

            anchors[operationId] = operationAnchor(tag, method, path);
        }
    }

    return anchors;
}
