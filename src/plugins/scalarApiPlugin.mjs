import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {apiCatalog} from '../data/apiCatalog.mjs';
import {resolveApiCatalog} from '../lib/apiCatalog.mjs';
import {materializeApiSpecs} from '../../scripts/fetch-api-specs.mjs';
import {copyScalarRuntime, resolveScalarPackage} from '../../scripts/copy-scalar-runtime.mjs';
import {loadApiAnchorSets} from '../../scripts/api-anchors.mjs';
import {buildApiRoutes} from './scalarApiRoutes.mjs';

const HERE = path.resolve(fileURLToPath(import.meta.url), '..');
const ROOT = path.resolve(HERE, '../..');
const STATIC_DIR = path.join(ROOT, 'static');
const SPEC_DIR = path.join(STATIC_DIR, 'api-specs');
const ROUTE_COMPONENT = path.resolve(HERE, '../components/ScalarApiReference');

/**
 * Publish every API reference as a Scalar page.
 *
 * Scalar renders in the browser, so nothing here parses an OpenAPI document during static
 * generation — that is the whole point of the plugin. `loadContent` downloads the documents and
 * vendors the Scalar bundle into `static/`, which is safe because Docusaurus finishes loading all
 * plugin content before it configures the bundler that copies the static directory.
 *
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {{apiVersion: string, cscVersion: string}} versions
 */
export default function scalarApiPlugin(context, versions) {
    const catalog = resolveApiCatalog(apiCatalog, versions);

    return {
        name: 'scalar-api-reference',

        async loadContent() {
            const manifest = await materializeApiSpecs({catalog, outDir: SPEC_DIR});
            const {root} = resolveScalarPackage();
            const runtimeSrc = copyScalarRuntime({packageRoot: root, staticDir: STATIC_DIR});
            const anchorsById = loadApiAnchorSets({catalog});
            return {manifest, runtimeSrc, anchorsById};
        },

        async contentLoaded({content, actions}) {
            const routes = buildApiRoutes({
                catalog,
                manifest: content.manifest,
                runtimeSrc: content.runtimeSrc,
                anchorsById: content.anchorsById,
                baseUrl: context.baseUrl,
                component: ROUTE_COMPONENT,
            });

            await Promise.all(routes.map(async ({id, anchors, ...route}) => {
                // Split the anchor list out of the route props: it is only read while rendering its
                // own page, and inlining 48 of them would weigh down every page on the site.
                actions.addRoute({
                    ...route,
                    modules: {
                        anchors: await actions.createData(`anchors-${id}.json`, JSON.stringify(anchors)),
                    },
                });
            }));
        },
    };
}
