// Find the API references that documentation links to.
//
// Docusaurus' broken-link handling checks that a markdown link to /api/<id> resolves to a route,
// and nothing more. It does not see PlantUML diagram links, which end up inside a rendered SVG, and
// it never checks fragments — so a link can point at a page that exists and still land nowhere.
// Collecting every form here lets the build check the ids and the fragments itself.

import {tagAnchor} from './scalarAnchors.mjs';

const PLANTUML_LINK = /\[\[([A-Za-z0-9-]+)\/?#/g;
const PLACEHOLDER_LINK = /%API_BASE_URL%([a-z0-9-]+)/g;
const MARKDOWN_LINK = /]\(\/api\/([a-z0-9-]+)/g;

/**
 * Every API id a page refers to, however it was written.
 * @param {string} text page source
 * @returns {string[]} ids, in first-seen order, without duplicates
 */
export function extractApiReferenceIds(text) {
    const ids = new Set();
    for (const pattern of [PLANTUML_LINK, PLACEHOLDER_LINK, MARKDOWN_LINK]) {
        for (const [, id] of text.matchAll(pattern)) {
            ids.add(id);
        }
    }
    return [...ids];
}

/**
 * Diagram link: [[<id>#<fragment>]], optionally with a stray slash before the "#".
 *
 * The slash has to go. Diagrams set `topurl` to `/api/`, so `[[core-auth/#…]]` requested
 * `/api/core-auth/#…`, and the site publishes `/api/core-auth` without a trailing slash — the
 * slashed form is a 404.
 */
const DIAGRAM_ANCHOR_LINK = /\[\[([A-Za-z0-9-]+)\/?#([^\]]+)]]/g;
/** Markdown link with a fragment: [text](/api/<id>#<fragment>), slash before "#" optional. */
const MARKDOWN_ANCHOR_LINK = /]\(\/api\/([A-Za-z0-9-]+)\/?#([^)]+)\)/g;
/**
 * Markdown link to a whole reference: [text](/api/<id>/).
 *
 * The trailing slash is the same 404 the diagram links had — the site publishes `/api/<id>`.
 */
const MARKDOWN_PAGE_LINK = /]\(\/api\/([A-Za-z0-9-]+)\/\)/g;

/** Redoc addressed an operation by id, with or without a leading tag segment. */
const REDOC_OPERATION_ANCHOR = /^(?:tag\/[^/]+\/)?operation\/(.+)$/;
/** A whole tag section, in either Redoc's casing or Scalar's slug. */
const TAG_ONLY_ANCHOR = /^tag\/([^/]+)$/;

/**
 * Translate one fragment into the form Scalar serves.
 * @returns {{anchor: string} | {unresolved: string}} the operationId, when it cannot be resolved
 */
function normalizeAnchor(id, anchor, anchorsById) {
    const operation = anchor.match(REDOC_OPERATION_ANCHOR);
    if (operation) {
        const operationId = operation[1];
        const resolved = anchorsById[id]?.[operationId];
        return resolved ? {anchor: resolved} : {unresolved: operationId};
    }

    const tagOnly = anchor.match(TAG_ONLY_ANCHOR);
    if (tagOnly) {
        // Slugifying is idempotent, so an already-converted anchor passes through unchanged.
        return {anchor: tagAnchor(tagOnly[1])};
    }

    // Already Scalar's tag/method/path form.
    return {anchor};
}

/**
 * Rewrite API links to the fragments Scalar serves.
 *
 * Covers both syntaxes documentation uses — PlantUML `[[…]]` diagram links and ordinary markdown
 * links — and both fragment kinds, a whole tag section and a single operation.
 *
 * Links are converted in place rather than translated during the build: the PlantUML pipeline
 * hashes diagram source to name its rendered SVG, and the remark plugin and the renderer must see
 * byte-identical text or the image reference dangles. What is in the file is what is published.
 *
 * @param {string} text page source
 * @param {Record<string, Record<string, string>>} anchorsById id -> operationId -> fragment
 * @returns {{text: string, rewritten: number, unresolved: Array<{id: string, operationId: string}>}}
 */
export function rewriteLegacyOperationLinks(text, anchorsById) {
    const unresolved = [];
    let rewritten = 0;

    /** @param {(id: string, anchor: string) => string} format */
    const convert = (whole, id, anchor, format) => {
        const result = normalizeAnchor(id, anchor, anchorsById);
        if (result.unresolved) {
            unresolved.push({id, operationId: result.unresolved});
            return whole;
        }
        const next = format(id, result.anchor);
        if (next !== whole) rewritten += 1;
        return next;
    };

    let next = text.replace(DIAGRAM_ANCHOR_LINK, (whole, id, anchor) =>
        convert(whole, id, anchor, (i, a) => `[[${i}#${a}]]`));

    next = next.replace(MARKDOWN_ANCHOR_LINK, (whole, id, anchor) =>
        convert(whole, id, anchor, (i, a) => `](/api/${i}#${a})`));

    next = next.replace(MARKDOWN_PAGE_LINK, (whole, id) => {
        rewritten += 1;
        return `](/api/${id})`;
    });

    return {text: next, rewritten, unresolved};
}

/** Every API link on a page, in either syntax. */
const ANY_API_LINK = /(?:\[\[([A-Za-z0-9-]+)(\/?)#([^\]]+)]]|]\(\/api\/([A-Za-z0-9-]+)(\/?)(?:#([^)]+))?\))/g;

/**
 * @typedef {object} ApiLink
 * @property {string} id API the link points at
 * @property {string|null} anchor fragment, without the "#", or null for a whole-reference link
 * @property {boolean} trailingSlash whether the id is followed by a slash, which the site 404s on
 */

/**
 * Every API link a page contains, however it was written.
 * @param {string} text @returns {ApiLink[]}
 */
export function extractApiLinks(text) {
    return [...text.matchAll(ANY_API_LINK)].map((m) => {
        const [, diagramId, diagramSlash, diagramAnchor, mdId, mdSlash, mdAnchor] = m;
        return diagramId
            ? {id: diagramId, anchor: diagramAnchor, trailingSlash: diagramSlash === '/'}
            : {id: mdId, anchor: mdAnchor ?? null, trailingSlash: mdSlash === '/'};
    });
}

/**
 * Links whose fragment does not exist in the document, or whose URL shape the site 404s on.
 *
 * @param {Array<{file: string, text: string}>} pages
 * @param {Record<string, Set<string>>} anchorsById id -> every fragment that document offers
 * @returns {Array<{file: string, id: string, anchor: string|null, reason: string}>}
 */
export function findBrokenApiLinks(pages, anchorsById) {
    return pages.flatMap(({file, text}) =>
        extractApiLinks(text).flatMap((link) => {
            const known = anchorsById[link.id];
            if (!known) return [];   // unknown ids are reported by findUnknownApiReferences
            if (link.trailingSlash) {
                return [{...link, file, reason: 'trailing slash — /api/<id>/ is a 404'}];
            }
            if (link.anchor && !known.has(link.anchor)) {
                return [{...link, file, reason: 'fragment does not exist in the document'}];
            }
            return [];
        }));
}

/** The base a diagram must prefix its [[…]] links with. */
export const DIAGRAM_TOP_URL = '/api/';

const TOP_URL = /skinparam\s+topurl\s+(\S+)/g;

/**
 * Diagram bases that are not the site-relative one.
 *
 * A diagram's links are only as portable as its `topurl`. An absolute
 * `https://docs.otilm.com/api/` sends a reader on localhost or a preview build to production, and
 * `%API_BASE_URL%` is never expanded here at all — the renderer reads raw markdown, so the remark
 * replacement that handles page content does not apply.
 *
 * @param {Array<{file: string, text: string}>} pages
 * @returns {Array<{file: string, topUrl: string}>}
 */
export function findNonRelativeDiagramBases(pages) {
    return pages.flatMap(({file, text}) =>
        [...text.matchAll(TOP_URL)]
            .filter(([, topUrl]) => topUrl !== DIAGRAM_TOP_URL)
            .map(([, topUrl]) => ({file, topUrl})));
}

/**
 * Ids that documentation links to but the catalog does not publish.
 * @param {Array<{file: string, text: string}>} pages
 * @param {Iterable<string>} publishedIds
 * @returns {Array<{file: string, id: string}>}
 */
export function findUnknownApiReferences(pages, publishedIds) {
    const published = new Set(publishedIds);
    return pages.flatMap(({file, text}) =>
        extractApiReferenceIds(text)
            .filter((id) => !published.has(id))
            .map((id) => ({file, id})));
}
