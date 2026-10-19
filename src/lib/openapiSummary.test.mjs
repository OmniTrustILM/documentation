import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarizeOpenapiDocument} from './openapiSummary.mjs';

const VALID = `
openapi: 3.1.0
info:
  title: Certificate API
  description: REST API for managing Certificates in the platform
  version: 2.19.0
paths:
  /certificates:
    get:
      summary: List
`;

test('extracts the title and description', () => {
    assert.deepEqual(summarizeOpenapiDocument(VALID, 'core-certificate'), {
        title: 'Certificate API',
        description: 'REST API for managing Certificates in the platform',
    });
});

test('accepts a document with components but no paths', () => {
    const doc = 'openapi: 3.1.0\ninfo:\n  title: Shared\ncomponents:\n  schemas: {}\n';
    assert.equal(summarizeOpenapiDocument(doc, 'shared').title, 'Shared');
});

test('accepts a Swagger 2 document', () => {
    const doc = 'swagger: "2.0"\ninfo:\n  title: Legacy\npaths: {}\n';
    assert.equal(summarizeOpenapiDocument(doc, 'legacy').title, 'Legacy');
});

test('defaults a missing description to an empty string', () => {
    const doc = 'openapi: 3.1.0\ninfo:\n  title: Terse\npaths: {}\n';
    assert.equal(summarizeOpenapiDocument(doc, 'terse').description, '');
});

test('collapses a multi-line description to a single line', () => {
    const doc = 'openapi: 3.1.0\ninfo:\n  title: T\n  description: |\n    One\n    Two\npaths: {}\n';
    assert.equal(summarizeOpenapiDocument(doc, 't').description, 'One Two');
});

test('rejects an HTML error page served with a 200', () => {
    assert.throws(
        () => summarizeOpenapiDocument('<!doctype html><html><body>404</body></html>', 'core-auth'),
        /core-auth.*not a YAML mapping|core-auth.*is not valid YAML/s,
    );
});

test('rejects truncated YAML', () => {
    assert.throws(() => summarizeOpenapiDocument('openapi: 3.1.0\ninfo:\n  title: "unterminated', 'x'),
        /is not valid YAML/);
});

test('rejects an empty document', () => {
    assert.throws(() => summarizeOpenapiDocument('', 'x'), /is empty/);
    assert.throws(() => summarizeOpenapiDocument('   \n', 'x'), /is empty/);
});

test('rejects a document with no OpenAPI version key', () => {
    assert.throws(
        () => summarizeOpenapiDocument('info:\n  title: T\npaths: {}\n', 'core-auth'),
        /core-auth.*openapi.*swagger/s,
    );
});

test('rejects a document with no info.title', () => {
    assert.throws(
        () => summarizeOpenapiDocument('openapi: 3.1.0\ninfo: {}\npaths: {}\n', 'core-auth'),
        /info\.title/,
    );
});

test('rejects a document with neither paths nor components', () => {
    assert.throws(
        () => summarizeOpenapiDocument('openapi: 3.1.0\ninfo:\n  title: T\n', 'core-auth'),
        /paths.*components/s,
    );
});

test('accepts internal references', () => {
    const doc = `openapi: 3.1.0
info:
  title: T
paths:
  /x:
    get:
      responses:
        "200":
          schema:
            $ref: "#/components/schemas/Thing"
components:
  schemas:
    Thing: {}
`;
    assert.equal(summarizeOpenapiDocument(doc, 'x').title, 'T');
});

test('rejects a reference to another file, which would not be mirrored', () => {
    const doc = 'openapi: 3.1.0\ninfo:\n  title: T\npaths:\n  /x:\n    $ref: "./shared.yaml#/x"\n';
    assert.throws(() => summarizeOpenapiDocument(doc, 'core-auth'), /external reference ".\/shared.yaml#\/x"/);
});

test('rejects a reference to another origin', () => {
    const doc = 'openapi: 3.1.0\ninfo:\n  title: T\npaths: {}\ncomponents:\n  schemas:\n    A:\n      $ref: "https://elsewhere.test/s.yaml"\n';
    assert.throws(() => summarizeOpenapiDocument(doc, 'core-auth'), /external reference/);
});

test('finds an external reference nested inside an array', () => {
    const doc = 'openapi: 3.1.0\ninfo:\n  title: T\npaths: {}\ncomponents:\n  schemas:\n    A:\n      allOf:\n        - $ref: "other.yaml"\n';
    assert.throws(() => summarizeOpenapiDocument(doc, 'core-auth'), /external reference/);
});

test('rejects a non-string OpenAPI version', () => {
    assert.throws(
        () => summarizeOpenapiDocument('openapi:\n  - 3.1.0\ninfo:\n  title: T\npaths: {}\n', 'x'),
        /string "openapi" or "swagger" version/,
    );
});

test('rejects paths that is not a mapping', () => {
    assert.throws(
        () => summarizeOpenapiDocument('openapi: 3.1.0\ninfo:\n  title: T\npaths: invalid\n', 'x'),
        /"paths" nor a "components" mapping/,
    );
});

test('names the failing document in every error', () => {
    for (const bad of ['', 'nope: 1\n', 'openapi: 3.1.0\ninfo: {}\npaths: {}\n']) {
        assert.throws(() => summarizeOpenapiDocument(bad, 'my-api'), /my-api/);
    }
});
