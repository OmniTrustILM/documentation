// @ts-check
import {plantumlFilename} from '../lib/plantumlHash.mjs';
import {normalizePuml} from '../lib/normalizePuml.mjs';

/**
 * Rewrite each ```plantuml``` code block into an <object> embedding the build-time rendered static SVG.
 * Filename uses the SAME hash as scripts/render-diagrams.mjs, so the reference and the emitted asset always agree.
 *
 * The embed is an <object> rather than an <img> on purpose. Diagrams carry [[…]] links into the API
 * reference, and a browser renders SVG referenced by <img> in a restricted, non-interactive mode
 * where those hyperlinks do nothing. <object> renders the SVG as a document, so the links work.
 */
const plugin = () => {
    return async (ast) => {
        const {visit} = await import('unist-util-visit');
        visit(ast, 'code', (node) => {
            if (node.lang !== 'plantuml' || !node.value) return;

            const filename = plantumlFilename(normalizePuml(node.value));
            const label = node.meta || 'Diagram';

            node.type = 'mdxJsxFlowElement';
            node.name = 'object';
            node.attributes = [
                {type: 'mdxJsxAttribute', name: 'type', value: 'image/svg+xml'},
                {type: 'mdxJsxAttribute', name: 'data', value: `/img/plantuml/${filename}`},
                {type: 'mdxJsxAttribute', name: 'className', value: 'plantumlDiagram'},
                {type: 'mdxJsxAttribute', name: 'aria-label', value: label},
            ];
            // Shown if the SVG cannot be loaded, and read as the accessible description.
            node.children = [{type: 'text', value: label}];
            node.value = undefined;
            node.meta = undefined;
            node.lang = undefined;
        });
    };
};

export default plugin;
