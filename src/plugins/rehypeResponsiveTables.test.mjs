import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import responsiveTables from './rehypeResponsiveTables.mjs';

async function render(markdown) {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(responsiveTables)
      .use(rehypeStringify)
      .process(markdown),
  ).replaceAll(/>\s+</g, '><');
}

test('removes blank Markdown headers while retaining every body cell and link', async () => {
  const html = await render(
    '# Community\n\n| | |\n|---|---|\n| [GitHub](https://github.com/OmniTrustILM/ilm) | Contribute |',
  );
  assert.doesNotMatch(html, /<thead>/);
  assert.match(
    html,
    /<tbody><tr><td><a href="https:\/\/github.com\/OmniTrustILM\/ilm">GitHub<\/a><\/td><td>Contribute<\/td><\/tr><\/tbody>/,
  );
});

test('preserves meaningful headers, empty body cells and column alignment', async () => {
  const html = await render('| Name | Value |\n|---|---:|\n| First | |');
  assert.match(html, /<thead><tr><th>Name<\/th><th align="right">Value<\/th><\/tr><\/thead>/);
  assert.match(html, /<td align="right"><\/td>/);
});

test('keeps a header row when only one heading cell is blank', async () => {
  assert.match(await render('| | Value |\n|---|---|\n| Key | Result |'), /<thead>/);
});

test('gives every table a keyboard-accessible overflow region named by its heading', async () => {
  const html = await render(
    '## Connector **interfaces**\n\n| Name | Value |\n|---|---|\n| A | B |',
  );
  assert.match(
    html,
    /<div class="tableViewport" role="region" aria-label="Connector interfaces table" tabindex="0"><table>/,
  );
});

test('uses a useful fallback label before a heading and leaves normal prose alone', async () => {
  assert.match(await render('| Name |\n|---|\n| A |'), /aria-label="Documentation table"/);
  assert.equal(await render('Simple text.'), '<p>Simple text.</p>');
});

test('also wraps authored MDX tables and preserves merged cells and content', async () => {
  const {evaluate} = await import('@mdx-js/mdx');
  const runtime = await import('react/jsx-runtime');
  const {createElement} = await import('react');
  const {renderToStaticMarkup} = await import('react-dom/server');
  const {default: Content} = await evaluate(
    '## Signer properties\n\n<table><tbody><tr><td colSpan="2">Shared settings</td></tr></tbody></table>',
    {...runtime, rehypePlugins: [responsiveTables]},
  );
  const html = renderToStaticMarkup(createElement(Content));
  assert.match(
    html,
    /<div class="tableViewport" role="region" aria-label="Signer properties table" tabindex="0"><table>/,
  );
  assert.match(html, /<td colSpan="2">Shared settings<\/td>/i);
});
