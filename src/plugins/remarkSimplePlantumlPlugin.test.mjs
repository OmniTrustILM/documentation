import {test} from 'node:test';
import assert from 'node:assert/strict';
import plugin from './remarkSimplePlantumlPlugin.mjs';
import {normalizePuml} from '../lib/normalizePuml.mjs';
import {plantumlFilename} from '../lib/plantumlHash.mjs';

const VALUE = '@startuml\na -> b\n@enduml';

/** @param {object} node @param {string} name */
function attribute(node, name) {
    return node.attributes.find((a) => a.name === name)?.value;
}

test('rewrites a plantuml code node into an object embedding the hashed svg', async () => {
    const node = {type: 'code', lang: 'plantuml', value: VALUE, meta: 'A sequence diagram'};
    await plugin()({type: 'root', children: [node]});

    assert.equal(node.type, 'mdxJsxFlowElement');
    assert.equal(node.name, 'object');
    assert.equal(attribute(node, 'type'), 'image/svg+xml');
    assert.equal(attribute(node, 'data'), `/img/plantuml/${plantumlFilename(normalizePuml(VALUE))}`);
});

test('embeds as an object so diagram hyperlinks stay clickable', () => {
    // An <img>-referenced SVG renders non-interactively: the [[…]] links into the API reference
    // would be dead. This is the whole reason the node is not an image.
    const source = plugin.toString();
    assert.ok(!source.includes("'image'"), 'the plugin must not emit an image node');
});

test('labels the diagram for assistive technology and as fallback content', async () => {
    const node = {type: 'code', lang: 'plantuml', value: VALUE, meta: 'A sequence diagram'};
    await plugin()({type: 'root', children: [node]});

    assert.equal(attribute(node, 'aria-label'), 'A sequence diagram');
    assert.deepEqual(node.children, [{type: 'text', value: 'A sequence diagram'}]);
});

test('falls back to a generic label when the block has no meta', async () => {
    const node = {type: 'code', lang: 'plantuml', value: VALUE};
    await plugin()({type: 'root', children: [node]});

    assert.equal(attribute(node, 'aria-label'), 'Diagram');
});

test('carries a class so the stylesheet can size the diagram', async () => {
    const node = {type: 'code', lang: 'plantuml', value: VALUE};
    await plugin()({type: 'root', children: [node]});

    assert.equal(attribute(node, 'className'), 'plantumlDiagram');
});

test('clears the code-node fields so nothing renders as source', async () => {
    const node = {type: 'code', lang: 'plantuml', value: VALUE, meta: 'x'};
    await plugin()({type: 'root', children: [node]});

    assert.equal(node.value, undefined);
    assert.equal(node.lang, undefined);
    assert.equal(node.meta, undefined);
});

test('addresses the same file scripts/render-diagrams.mjs writes', async () => {
    // Both sides hash normalized source, so a block that omits the @start/@end pair still points
    // at the asset the renderer produced for it.
    const bare = {type: 'code', lang: 'plantuml', value: 'a -> b\n'};
    await plugin()({type: 'root', children: [bare]});

    assert.equal(
        attribute(bare, 'data'),
        `/img/plantuml/${plantumlFilename(normalizePuml('a -> b\n'))}`,
    );
});

test('leaves non-plantuml code nodes untouched', async () => {
    const node = {type: 'code', lang: 'js', value: 'const x = 1;'};
    await plugin()({type: 'root', children: [node]});
    assert.equal(node.type, 'code');
});

test('leaves a plantuml block with no content untouched', async () => {
    const node = {type: 'code', lang: 'plantuml', value: ''};
    await plugin()({type: 'root', children: [node]});
    assert.equal(node.type, 'code');
});
