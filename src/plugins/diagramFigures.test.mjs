import {test} from 'node:test';
import assert from 'node:assert/strict';
import plugin from './remarkSimplePlantumlPlugin.mjs';

test('uses the surrounding heading to caption a diagram and expose its full source SVG', async () => {
  const diagram = {type: 'code', lang: 'plantuml', value: 'a -> b'};
  const ast = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 2,
        children: [
          {type: 'text', value: 'Certificate '},
          {type: 'inlineCode', value: 'issuance'},
        ],
      },
      diagram,
    ],
  };
  await plugin()(ast);
  assert.equal(diagram.name, 'DiagramFigure');
  assert.equal(
    diagram.attributes.find((a) => a.name === 'label').value,
    'Certificate issuance diagram',
  );
  assert.match(
    diagram.attributes.find((a) => a.name === 'src').value,
    /^\/img\/plantuml\/[a-f0-9]+\.svg$/,
  );
});

test('prefers an authored diagram description over a surrounding heading', async () => {
  const diagram = {
    type: 'code',
    lang: 'plantuml',
    value: 'a -> b',
    meta: 'Issue a certificate through a connector',
  };
  await plugin()({type: 'root', children: [diagram]});
  assert.equal(diagram.name, 'DiagramFigure');
  assert.equal(
    diagram.attributes.find((a) => a.name === 'label').value,
    'Issue a certificate through a connector',
  );
});
