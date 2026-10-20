import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {findMissingApiArtifacts, findApiPageContentIssues} from './verify-api-build.mjs';
import {findUnknownApiReferences} from '../src/lib/apiLinks.mjs';
import {normalizePuml} from '../src/lib/normalizePuml.mjs';
import {plantumlFilename} from '../src/lib/plantumlHash.mjs';

const CATALOG = [
  {
    id: 'core-auth',
    version: '2.19.0',
    route: '/api/core-auth/',
    assetPath: '/api-specs/2.19.0/core-auth.yaml',
  },
  {
    id: 'csc-component',
    version: '1.7.0',
    route: '/api/csc-component/',
    assetPath: '/api-specs/1.7.0/csc-component.yaml',
  },
];
const RUNTIME = '/scalar/standalone-1.64.0.js';

/** @param {string[]} present paths, relative to the build directory */
function buildDir(present) {
  const dir = mkdtempSync(path.join(tmpdir(), 'build-'));
  for (const relative of present) {
    const full = path.join(dir, relative);
    mkdirSync(path.dirname(full), {recursive: true});
    writeFileSync(full, 'x');
  }
  return dir;
}

const COMPLETE = [
  'api.html',
  'api/core-auth.html',
  'api/csc-component.html',
  'api-specs/2.19.0/core-auth.yaml',
  'api-specs/1.7.0/csc-component.yaml',
  'scalar/standalone-1.64.0.js',
];

test('reports a diagram SVG that was not copied into the published build', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir(COMPLETE), catalog: CATALOG, runtimeSrc: RUNTIME,
    pages: [{file: 'guide.md', text: '```plantuml\nA -> B : Hello\n```'}],
  });
  assert.equal(missing.length, 1);
  assert.match(missing[0], /plantuml.*\.svg/);
});

test('verifies actual published diagram links rather than just their source declarations', () => {
  const directory = buildDir(COMPLETE);
  const source = 'skinparam topurl /api/\nClient -> Core [[core-auth#tag/auth/GET/v1/auth/{uuid}]]: Authenticate';
  const filename = plantumlFilename(normalizePuml(source));
  const diagramDirectory = path.join(directory, 'img/plantuml');
  mkdirSync(diagramDirectory, {recursive: true});
  const file = path.join(diagramDirectory, filename);
  const options = {buildDir: directory, catalog: CATALOG, runtimeSrc: RUNTIME,
    pages: [{file: 'guide.md', text: `\`\`\`plantuml\n${source}\n\`\`\``}]};
  writeFileSync(file, '<svg viewBox="0 0 300 100"><a target="_top" href="/api/core-auth#tag/auth/GET/v1/auth/{uuid}"><text>Authenticate</text></a></svg>');
  assert.deepEqual(findMissingApiArtifacts(options), []);
  writeFileSync(file, '<svg viewBox="0 0 300 100"><text>Authenticate</text></svg>');
  const missing = findMissingApiArtifacts(options);
  assert.equal(missing.length, 1);
  assert.match(missing[0], /link/i);
});

test('reports nothing when every artifact was emitted', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir(COMPLETE),
    catalog: CATALOG,
    runtimeSrc: RUNTIME,
  });
  assert.deepEqual(missing, []);
});

test('accepts a directory-style page as well as a flat one', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir([
      'api/index.html',
      'api/core-auth/index.html',
      'api/csc-component/index.html',
      'api-specs/2.19.0/core-auth.yaml',
      'api-specs/1.7.0/csc-component.yaml',
      'scalar/standalone-1.64.0.js',
    ]),
    catalog: CATALOG,
    runtimeSrc: RUNTIME,
  });
  assert.deepEqual(missing, []);
});

test('catches an API page that was never generated', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir(COMPLETE.filter((p) => p !== 'api/csc-component.html')),
    catalog: CATALOG,
    runtimeSrc: RUNTIME,
  });
  assert.deepEqual(missing, ['/api/csc-component/']);
});

test('catches a document that was not downloaded', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir(COMPLETE.filter((p) => !p.endsWith('core-auth.yaml'))),
    catalog: CATALOG,
    runtimeSrc: RUNTIME,
  });
  assert.deepEqual(missing, ['/api-specs/2.19.0/core-auth.yaml']);
});

test('catches a missing Scalar runtime', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir(COMPLETE.filter((p) => !p.startsWith('scalar/'))),
    catalog: CATALOG,
    runtimeSrc: RUNTIME,
  });
  assert.deepEqual(missing, [RUNTIME]);
});

test('reports every missing artifact, not just the first', () => {
  const missing = findMissingApiArtifacts({
    buildDir: buildDir([]),
    catalog: CATALOG,
    runtimeSrc: RUNTIME,
  });
  assert.equal(missing.length, 6);
});

test('catches a catalog entrance that was never generated', () => {
  assert.deepEqual(
    findMissingApiArtifacts({
      buildDir: buildDir(COMPLETE.filter((file) => file !== 'api.html')),
      catalog: CATALOG,
      runtimeSrc: RUNTIME,
    }),
    ['/api'],
  );
});

function renderedPages({
  directory = false,
  omitCatalogLink = false,
  omitDownload = false,
  omitHeading = false,
} = {}) {
  const dir = buildDir([]);
  const pages = {
    api: `<main><h1>API reference</h1><a href="/preview/api/core-auth">Auth API</a>${omitCatalogLink ? '' : '<a href="/preview/api/csc-component">CSC API</a>'}</main>`,
    'api/core-auth': `${omitHeading ? '' : '<h1>Auth API</h1>'}<a href="/preview/api">All APIs</a>${omitDownload ? '' : '<a href="/preview/api-specs/2.19.0/core-auth.yaml">Download</a>'}`,
    'api/csc-component':
      '<h1>CSC API</h1><a href="/preview/api">All APIs</a><a href="/preview/api-specs/1.7.0/csc-component.yaml">Download</a>',
  };
  for (const [route, html] of Object.entries(pages)) {
    const file = path.join(dir, directory ? `${route}/index.html` : `${route}.html`);
    mkdirSync(path.dirname(file), {recursive: true});
    writeFileSync(file, html);
  }
  return dir;
}

test('verifies server-rendered navigation and specification fallback under a non-root base URL', () => {
  for (const directory of [false, true]) {
    assert.deepEqual(
      findApiPageContentIssues({
        buildDir: renderedPages({directory}),
        catalog: CATALOG,
        baseUrl: '/preview/',
      }),
      [],
    );
  }
});

test('catches a published API missing from the server-rendered catalog', () => {
  const issues = findApiPageContentIssues({
    buildDir: renderedPages({omitCatalogLink: true}),
    catalog: CATALOG,
    baseUrl: '/preview/',
  });
  assert.deepEqual(issues, ['/api: no link to /preview/api/csc-component']);
});

test('requires each API destination inside the catalog main even when the navbar links to it', () => {
  const dir = renderedPages({omitCatalogLink: true});
  const file = path.join(dir, 'api.html');
  writeFileSync(
    file,
    `<nav><a href="/preview/api/csc-component">CSC API</a></nav>${readFileSync(file, 'utf8')}`,
  );
  assert.deepEqual(
    findApiPageContentIssues({buildDir: dir, catalog: CATALOG, baseUrl: '/preview/'}),
    ['/api: no link to /preview/api/csc-component'],
  );
});

test('reports a catalog without a server-rendered main', () => {
  const dir = renderedPages();
  const file = path.join(dir, 'api.html');
  writeFileSync(file, readFileSync(file, 'utf8').replaceAll(/<\/?main>/g, ''));
  assert.deepEqual(
    findApiPageContentIssues({buildDir: dir, catalog: CATALOG, baseUrl: '/preview/'}),
    ['/api: no server-rendered main'],
  );
});

test('accepts a catalog main with case-insensitive tags and multiline attributes', () => {
  const dir = renderedPages();
  const file = path.join(dir, 'api.html');
  writeFileSync(
    file,
    readFileSync(file, 'utf8')
      .replace('<main>', '<MAIN\n class="catalog">')
      .replace('</main>', '</MAIN >'),
  );
  assert.deepEqual(
    findApiPageContentIssues({buildDir: dir, catalog: CATALOG, baseUrl: '/preview/'}),
    [],
  );
});

test('catches a reference without an independently usable specification download', () => {
  const issues = findApiPageContentIssues({
    buildDir: renderedPages({omitDownload: true}),
    catalog: CATALOG,
    baseUrl: '/preview/',
  });
  assert.deepEqual(issues, ['/api/core-auth: no link to /preview/api-specs/2.19.0/core-auth.yaml']);
});

test('catches a blank server-rendered reference and missing catalog recovery links', () => {
  const dir = renderedPages({omitHeading: true});
  writeFileSync(
    path.join(dir, 'api/csc-component.html'),
    '<h1>CSC API</h1><a href="/preview/api-specs/1.7.0/csc-component.yaml">Download</a>',
  );
  assert.deepEqual(
    findApiPageContentIssues({buildDir: dir, catalog: CATALOG, baseUrl: '/preview/'}),
    ['/api/core-auth: no server-rendered heading', '/api/csc-component: no link to /preview/api'],
  );
});

test('reports absent HTML instead of crashing while inspecting a build', () => {
  const issues = findApiPageContentIssues({buildDir: buildDir([]), catalog: CATALOG});
  assert.deepEqual(issues, [
    '/api: missing HTML',
    '/api/core-auth: missing HTML',
    '/api/csc-component: missing HTML',
  ]);
});

test('reports a mis-cased API id rather than skipping it silently', () => {
  const pages = [{file: 'a.md', text: '[[core-Entity#tag/entity/GET/v1/entities]]'}];
  assert.deepEqual(findUnknownApiReferences(pages, ['core-entity']), [
    {file: 'a.md', id: 'core-Entity'},
  ]);
});
