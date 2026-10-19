// Validate a downloaded OpenAPI document and pull out the metadata the API page needs.
//
// Scalar renders in the browser, so a document that is missing, truncated or actually an HTML error
// page produces a blank page at runtime rather than a build failure. Validating here keeps that
// failure at build time, where it is visible.

import {parse as parseYaml} from 'yaml';

/** @param {string} text @param {string} id */
function parseDocument(text, id) {
    if (!text.trim()) {
        throw new Error(`OpenAPI document for ${id} is empty`);
    }
    let parsed;
    try {
        parsed = parseYaml(text);
    } catch (cause) {
        throw new Error(`OpenAPI document for ${id} is not valid YAML: ${cause.message}`, {cause});
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`OpenAPI document for ${id} is not a YAML mapping`);
    }
    return parsed;
}

/** @param {unknown} value */
function isMapping(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** @param {Record<string, unknown>} document @param {string} id */
function assertShape(document, id) {
    const version = document.openapi ?? document.swagger;
    if (typeof version !== 'string' || !version.trim()) {
        throw new Error(`OpenAPI document for ${id} has no string "openapi" or "swagger" version`);
    }
    const info = document.info;
    if (!isMapping(info) || typeof info.title !== 'string' || !info.title.trim()) {
        throw new Error(`OpenAPI document for ${id} has no info.title`);
    }
    if (!isMapping(document.paths) && !isMapping(document.components)) {
        throw new Error(`OpenAPI document for ${id} has neither a "paths" nor a "components" mapping`);
    }
    return info;
}

/**
 * Reject references to other files.
 *
 * The document is mirrored on its own, so a relative reference would resolve against
 * /api-specs/<version>/ where nothing else lives, and an absolute one would send readers' browsers
 * to a third-party origin. Neither fails the build on its own — the page just renders wrong — so
 * the check happens here.
 *
 * @param {unknown} node @param {string} id
 */
function assertNoExternalRefs(node, id) {
    if (Array.isArray(node)) {
        for (const item of node) assertNoExternalRefs(item, id);
        return;
    }
    if (!isMapping(node)) {
        return;
    }
    for (const [key, value] of Object.entries(node)) {
        if (key === '$ref' && typeof value === 'string' && !value.startsWith('#')) {
            throw new Error(
                `OpenAPI document for ${id} has an external reference "${value}"; only ` +
                'internal "#/..." references can be published, because the document is mirrored alone',
            );
        }
        assertNoExternalRefs(value, id);
    }
}

/**
 * Validate a raw OpenAPI document and return the page metadata for it.
 *
 * The title and description reproduce what Redoc used to put in the page head, so switching
 * renderers does not silently rewrite 48 page titles into short navbar labels.
 *
 * @param {string} text raw document as downloaded
 * @param {string} id catalog id, used to name the document in errors
 * @returns {{title: string, description: string}}
 */
export function summarizeOpenapiDocument(text, id) {
    const document = parseDocument(text, id);
    const info = assertShape(document, id);
    assertNoExternalRefs(document, id);

    const description = typeof info.description === 'string' ? info.description : '';
    return {
        title: info.title.trim(),
        description: description.replace(/\s+/g, ' ').trim(),
    };
}
