// Verify generated API routes, specifications, runtime assets and documentation links.

import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {apiCatalog} from '../src/data/apiCatalog.mjs';
import {resolveApiCatalog} from '../src/lib/apiCatalog.mjs';
import {apiSitePath} from '../src/lib/apiCatalogView.mjs';
import {
  findUnknownApiReferences,
  findNonRelativeDiagramBases,
  findBrokenApiLinks,
  DIAGRAM_TOP_URL,
} from '../src/lib/apiLinks.mjs';
import {apiVersion, cscVersion} from '../src/data/versions.mjs';
import {resolveScalarPackage, RUNTIME_DIR_NAME} from './copy-scalar-runtime.mjs';
import {loadApiAnchorSets} from './api-anchors.mjs';
import {collectDocPages} from './doc-pages.mjs';
import {extractPlantumlBlocks} from './render-diagrams.mjs';
import {normalizePuml} from '../src/lib/normalizePuml.mjs';
import {plantumlFilename} from '../src/lib/plantumlHash.mjs';
import {verifyRender} from '../src/lib/verifyRender.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const BUILD_DIR = path.join(ROOT, 'build');

/** @param {string} buildDir @param {string} route */
function pageFile(buildDir, route) {
  const relative = route.replace(/^\/|\/$/g, '');
  return [
    path.join(buildDir, `${relative}.html`),
    path.join(buildDir, relative, 'index.html'),
  ].find(existsSync);
}

/** Check the HTML readers receive before the client-side API renderer starts. */
export function findApiPageContentIssues({buildDir, catalog, baseUrl = '/'}) {
  const issues = [];
  function inspect(route, targets) {
    const file = pageFile(buildDir, route);
    if (!file) {
      issues.push(`${route}: missing HTML`);
      return;
    }
    let html = readFileSync(file, 'utf8');
    if (route === '/api') {
      const main = /<main\b[^>]*>([\s\S]*?)<\/main\s*>/i.exec(html);
      if (!main) {
        issues.push(`${route}: no server-rendered main`);
        return;
      }
      html = main[1];
    }
    if (!/<h1\b/i.test(html)) issues.push(`${route}: no server-rendered heading`);
    const links = new Set([...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]));
    for (const target of targets) {
      if (!links.has(target)) issues.push(`${route}: no link to ${target}`);
    }
  }
  inspect(
    '/api',
    catalog.map(({route}) => apiSitePath(baseUrl, route)),
  );
  for (const {route, assetPath} of catalog) {
    inspect(route.replace(/\/$/, ''), [
      apiSitePath(baseUrl, '/api'),
      apiSitePath(baseUrl, assetPath),
    ]);
  }
  return issues;
}

/**
 * @param {object} options
 * @param {string} options.buildDir
 * @param {Array<{route: string, assetPath: string}>} options.catalog
 * @param {string} options.runtimeSrc
 * @returns {string[]} every expected artifact that is not in the build
 */
export function findMissingApiArtifacts({buildDir, catalog, runtimeSrc, pages = []}) {
  const missing = [];
  if (!pageFile(buildDir, '/api')) missing.push('/api');

  for (const {route} of catalog) {
    if (!pageFile(buildDir, route)) missing.push(route);
  }
  for (const {assetPath} of catalog) {
    if (!existsSync(path.join(buildDir, assetPath.slice(1)))) missing.push(assetPath);
  }
  if (!existsSync(path.join(buildDir, runtimeSrc.slice(1)))) missing.push(runtimeSrc);

  return [...missing, ...findDiagramArtifactIssues(buildDir, pages)];
}

function findDiagramArtifactIssues(buildDir, pages) {
  const issues = [];
  const checked = new Set();
  for (const {text} of pages) {
    for (const raw of extractPlantumlBlocks(text)) {
      const source = normalizePuml(raw);
      const asset = `/img/plantuml/${plantumlFilename(source)}`;
      if (checked.has(asset)) continue;
      checked.add(asset);
      const file = path.join(buildDir, asset.slice(1));
      if (!existsSync(file)) {
        issues.push(`${asset}: missing diagram SVG`);
        continue;
      }
      const result = verifyRender(readFileSync(file, 'utf8'), {source});
      if (!result.ok) issues.push(`${asset}: ${result.reason}`);
    }
  }
  return issues;
}

/** Check the build in ./build, throwing if anything the API reference needs is absent. */
export function verifyApiBuild({buildDir = BUILD_DIR, baseUrl = '/'} = {}) {
  const catalog = resolveApiCatalog(apiCatalog, {apiVersion, cscVersion});
  const {version} = resolveScalarPackage();
  const runtimeSrc = `/${RUNTIME_DIR_NAME}/standalone-${version}.js`;
  const pages = collectDocPages();

  const missing = findMissingApiArtifacts({buildDir, catalog, runtimeSrc, pages});
  if (missing.length) {
    throw new Error(
      `the build is missing ${missing.length} API artifact(s):\n  ${missing.join('\n  ')}`,
    );
  }

  const contentIssues = findApiPageContentIssues({buildDir, catalog, baseUrl});
  if (contentIssues.length) {
    throw new Error(
      `the API reference has incomplete server-rendered navigation:\n  ${contentIssues.join('\n  ')}`,
    );
  }

  // The other direction: a documentation page pointing at an API the catalog no longer publishes.
  // Diagram links live inside rendered SVGs and %API_BASE_URL% expands to an absolute URL, so
  // neither reaches Docusaurus' broken-link checking.
  const unknown = findUnknownApiReferences(
    pages,
    catalog.map((entry) => entry.id),
  );
  if (unknown.length) {
    const detail = unknown.map(({file, id}) => `${file} -> /api/${id}`).join('\n  ');
    throw new Error(
      `${unknown.length} documentation link(s) point at an unpublished API:\n  ${detail}`,
    );
  }

  const pinned = findNonRelativeDiagramBases(pages);
  if (pinned.length) {
    const detail = pinned.map(({file, topUrl}) => `${file} -> ${topUrl}`).join('\n  ');
    throw new Error(
      `${pinned.length} diagram(s) do not use "skinparam topurl ${DIAGRAM_TOP_URL}", so their ` +
        `links would leave the site being viewed:\n  ${detail}`,
    );
  }

  const broken = findBrokenApiLinks(pages, loadApiAnchorSets({catalog}));
  if (broken.length) {
    const detail = broken
      .map(
        ({file, id, anchor, reason}) =>
          `${file} -> /api/${id}${anchor ? '#' + anchor : ''}  (${reason})`,
      )
      .join('\n  ');
    throw new Error(
      `${broken.length} documentation link(s) would not reach what they name; ` +
        `run "yarn update-api-anchors":\n  ${detail}`,
    );
  }

  return catalog.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(
      `API build verified: ${verifyApiBuild()} references, documents and runtime present`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
