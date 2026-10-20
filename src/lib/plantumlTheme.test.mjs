import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyPlantumlSvgTheme} from './plantumlTheme.mjs';

test('themes SVG paint attributes and inline styles without changing dimensions or API links', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="641px" height="230px" viewBox="0 0 641 230"><rect fill="#FFFFFF" style="stroke: #7d8795;stroke-width:1.5"/><a href="/api/core-certificate#tag/Certificate/operation/detail"><text fill="#1F2937">Certificate</text></a></svg>';
  const output = applyPlantumlSvgTheme(svg);
  assert.match(output, /width="641px" height="230px" viewBox="0 0 641 230"/);
  assert.match(output, /href="\/api\/core-certificate#tag\/Certificate\/operation\/detail"/);
  assert.match(output, /fill="var\(--ilm-puml-paper, #FFFFFF\)"/);
  assert.match(output, /stroke: var\(--ilm-puml-line, #7d8795\);stroke-width:1.5/);
  assert.match(output, /<text fill="var\(--ilm-puml-text, #1F2937\)">Certificate<\/text>/);
  assert.match(output, /@media \(prefers-color-scheme: dark\)/);
  assert.match(output, /--ilm-puml-paper:#171717/);
  assert.match(output, /--ilm-puml-text:#f5f5f5/);
});

test('adapts audited semantic fills and their text rather than leaving white text on pale surfaces', () => {
  const output = applyPlantumlSvgTheme('<svg><rect fill="#E1F5E0"/><rect fill="LightCoral"/><rect style="fill:#FFF8E1"/><text fill="#2E7D32">Approved</text><text fill="#C62828">Rejected</text></svg>');
  assert.match(output, /fill="var\(--ilm-puml-success-fill, #E1F5E0\)"/);
  assert.match(output, /fill="var\(--ilm-puml-danger-fill, LightCoral\)"/);
  assert.match(output, /fill:var\(--ilm-puml-warning-fill, #FFF8E1\)/);
  assert.match(output, /--ilm-puml-success-fill:#183522/);
  assert.match(output, /--ilm-puml-danger-fill:#4c2528/);
  assert.match(output, /--ilm-puml-success-text:#91d5a6/);
  assert.match(output, /--ilm-puml-danger-text:#ffb4ab/);
});

test('preserves unknown explicit colors, gradients, white text and encoded link fragments', () => {
  const output = applyPlantumlSvgTheme('<svg><rect fill="#5A2367" stroke="url(#gradient)"/><text fill="#fff">Custom surface</text><a xlink:href="/api/core-key#tag/Keys/operation/get%3Ekey"><text fill="#000">Key</text></a><path style="fill:none;stroke:#5a2367;opacity:.5"/></svg>');
  assert.match(output, /fill="#5A2367" stroke="url\(#gradient\)"/);
  assert.match(output, /<text fill="#fff">Custom surface<\/text>/);
  assert.match(output, /xlink:href="\/api\/core-key#tag\/Keys\/operation\/get%3Ekey"/);
  assert.match(output, /style="fill:none;stroke:#5a2367;opacity:.5"/);
  assert.match(output, /<text fill="var\(--ilm-puml-text, #000\)">Key<\/text>/);
});

test('injects one self-contained style and remains unchanged when applied twice', () => {
  const output = applyPlantumlSvgTheme('<?xml version="1.0"?><svg width="10" height="20"><rect fill="#F1F1F1"/></svg>');
  assert.equal(applyPlantumlSvgTheme(output), output);
  assert.equal((output.match(/<style\b/g) ?? []).length, 1);
  assert.doesNotMatch(output, /@import|<link\b|filter\s*:/i);
  assert.match(output, /<\?xml version="1.0"\?><svg width="10" height="20"><style/);
});

test('rejects content without an SVG root instead of silently producing an unthemed asset', () => {
  assert.throws(() => applyPlantumlSvgTheme('not an SVG'), /SVG root/);
});

test('recognizes paint whitespace while preserving unrelated inline style properties', () => {
  const output = applyPlantumlSvgTheme("<svg><rect fill=' #FFFFFF ' style='stroke: #7D8795 ;stroke-dasharray:4 2'/></svg>");
  assert.match(output, /fill='var\(--ilm-puml-paper,  #FFFFFF \)'/);
  assert.match(output, /stroke: var\(--ilm-puml-line, #7D8795 \);stroke-dasharray:4 2/);
});
