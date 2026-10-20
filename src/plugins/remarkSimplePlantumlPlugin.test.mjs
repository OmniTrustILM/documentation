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

test('rewrites a plantuml block into a labeled diagram reader with the rendered asset', async () => {
  const node = {type: 'code', lang: 'plantuml', value: VALUE, meta: 'A sequence diagram'};
  await plugin()({type: 'root', children: [node]});

  assert.equal(node.type, 'mdxJsxFlowElement');
  assert.equal(node.name, 'DiagramFigure');
  assert.equal(attribute(node, 'src'), `/img/plantuml/${plantumlFilename(normalizePuml(VALUE))}`);
});

test('labels the diagram for assistive technology and as fallback content', async () => {
  const node = {type: 'code', lang: 'plantuml', value: VALUE, meta: 'A sequence diagram'};
  await plugin()({type: 'root', children: [node]});

  assert.equal(attribute(node, 'label'), 'A sequence diagram');
  assert.deepEqual(node.children, []);
});

test('falls back to a generic label when the block has no meta', async () => {
  const node = {type: 'code', lang: 'plantuml', value: VALUE};
  await plugin()({type: 'root', children: [node]});

  assert.equal(attribute(node, 'label'), 'Trust lifecycle diagram');
});

test('uses the nearest heading as an accessible caption', async () => {
  const node = {type: 'code', lang: 'plantuml', value: VALUE};
  await plugin()({
    type: 'root',
    children: [{type: 'heading', children: [{type: 'text', value: 'Registration'}]}, node],
  });

  assert.equal(attribute(node, 'label'), 'Registration diagram');
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
    attribute(bare, 'src'),
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
