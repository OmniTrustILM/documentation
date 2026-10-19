// Turn the resolved catalog plus the download manifest into Docusaurus route descriptors.
//
// Kept separate from the plugin itself so the route shape can be tested without a Docusaurus
// context. Route props must be plain data: Docusaurus JSON-serializes them into its routes module.

import {buildScalarConfiguration} from '../lib/scalarConfig.mjs';

/**
 * Join the site base URL with a site-absolute path, without leaving a trailing slash.
 *
 * The site sets `trailingSlash: false`, so `/api/<id>/` and `/api/<id>` must resolve to the same
 * output file Redocusaurus produced before.
 */
function joinBase(baseUrl, absolutePath) {
    const joined = `${baseUrl.replace(/\/$/, '')}${absolutePath}`;
    return joined.length > 1 ? joined.replace(/\/$/, '') : joined;
}

/**
 * @param {object} options
 * @param {import('../lib/apiCatalog.mjs').ResolvedApi[]} options.catalog
 * @param {{entries: Record<string, {title?: string, description?: string}>}} options.manifest
 * @param {string} options.runtimeSrc site-absolute path of the Scalar bundle
 * @param {string} options.baseUrl site base URL
 * @param {string} options.component absolute path of the route component
 * @param {Record<string, Set<string>|string[]>} [options.anchorsById] fragments each document offers
 */
export function buildApiRoutes({catalog, manifest, runtimeSrc, baseUrl, component, anchorsById = {}}) {
    const documents = manifest?.entries ?? {};

    return catalog.map((entry) => {
        const document = documents[entry.id] ?? {};
        const title = document.title || entry.label;

        return {
            id: entry.id,
            path: joinBase(baseUrl, entry.route),
            component,
            exact: true,
            title,
            description: document.description ?? '',
            runtimeSrc: joinBase(baseUrl, runtimeSrc),
            configuration: buildScalarConfiguration({...entry, title}, {baseUrl}),
            // Declared to Docusaurus' broken-anchor check. Scalar creates these in the browser, so
            // they are absent from the server-rendered HTML the check reads.
            anchors: [...(anchorsById[entry.id] ?? [])],
        };
    });
}
