import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizePuml} from './normalizePuml.mjs';
import {spawnSync} from 'node:child_process';

test('wraps a source with no tags in @startuml/@enduml', () => {
    const output = normalizePuml('a -> b');
    assert.match(output, /^@startuml\n/);
    assert.match(output, /\na -> b\n@enduml\n$/);
});
test('closes a source that has @startuml but no @enduml', () => {
    assert.match(normalizePuml('@startuml\na -> b'), /\na -> b\n@enduml\n$/);
});
test('preserves an existing source wrapper without duplicating its start or end', () => {
    const output = normalizePuml('@startuml\na -> b\n@enduml\n');
    assert.equal((output.match(/@startuml/g) ?? []).length, 1);
    assert.equal((output.match(/@enduml/g) ?? []).length, 1);
    assert.match(output, /\na -> b\n@enduml\n$/);
});
test('pairs a non-uml diagram type correctly', () => {
    assert.equal(normalizePuml('@startmindmap\n* root'), '@startmindmap\n* root\n@endmindmap\n');
});
test('rejects an !include directive', () => {
    assert.throws(() => normalizePuml('@startuml\n!include /etc/passwd\n@enduml'), /include/i);
});
test('rejects an !includeurl directive', () => {
    assert.throws(() => normalizePuml('@startuml\n!includeurl http://evil/x\n@enduml'), /include/i);
});
test('rejects an !include_once directive', () => {
    assert.throws(() => normalizePuml('@startuml\n!include_once /etc/passwd\n@enduml'), /include/i);
});
test('rejects an !import directive', () => {
    assert.throws(() => normalizePuml('@startuml\n!import http://evil/x.puml\n@enduml'), /include/i);
});
test('rejects a !theme … from <url> directive', () => {
    assert.throws(() => normalizePuml('@startuml\n!theme mytheme from http://evil\n@enduml'), /include/i);
});
test('allows a local !theme without a from clause', () => {
    assert.doesNotThrow(() => normalizePuml('@startuml\n!theme spacelab\na -> b\n@enduml'));
});

test('moves an arrow API URL into a quoted inline message link without changing its label', () => {
    const output = normalizePuml('skinparam topurl /api/\nClient -> Core [[core-auth#tag/auth/GET/v1/auth/{uuid}]]: **Authenticate**: request ①');
    assert.match(output, /Client -> Core : \[\["core-auth#tag\/auth\/GET\/v1\/auth\/\{uuid\}" \*\*Authenticate\*\*: request ①\]\]/);
    assert.match(output, /skinparam topurl \/api\//);
});

test('preserves asynchronous arrow syntax and multiline message formatting', () => {
    const output = normalizePuml('Client->>Core [[core-auth#tag/auth/GET/v1/auth]]: Get\\n<b>Details</b>');
    assert.match(output, /Client->>Core : \[\["core-auth#tag\/auth\/GET\/v1\/auth" Get\\n<b>Details<\/b>\]\]/);
});

test('leaves existing inline links and participant URLs unchanged', () => {
    const source = '@startuml\nactor Client [[https://example.test/client]]\nClient -> Core : [["core-auth#tag/auth" Authenticate]]\n@enduml\n';
    const output = normalizePuml(source);
    assert.match(output, /actor Client \[\[https:\/\/example.test\/client\]\]/);
    assert.match(output, /Client -> Core : \[\["core-auth#tag\/auth" Authenticate\]\]/);
});

test('removes legacy presentation skinparams while retaining layout, URL and semantic colors', () => {
    const output = normalizePuml('@startuml\nskinparam defaultFontName Helvetica\nskinparam ArrowColor #1573B5\nskinparam sequence {\n ParticipantBackgroundColor #E1F5E0\n MessageAlign center\n}\nskinparam topurl /api/\nskinparam maxMessageSize 200\nskinparam nodesep 70\nrectangle "Valid" #LightGreen\n@enduml');
    assert.doesNotMatch(output, /Helvetica|#1573B5|ParticipantBackgroundColor/);
    assert.match(output, /MessageAlign center/);
    assert.match(output, /skinparam topurl \/api\//);
    assert.match(output, /skinparam maxMessageSize 200/);
    assert.match(output, /skinparam nodesep 70/);
    assert.match(output, /rectangle "Valid" #LightGreen/);
});

test('does not leave empty legacy skinparam blocks after removing presentation settings', () => {
    const output = normalizePuml('skinparam sequence {\n ArrowColor #1573B5\n ParticipantBackgroundColor #E1F5E0\n}\nClient -> Core : Hello');
    assert.doesNotMatch(output, /skinparam sequence/);
});

test('includes shared style and its render fingerprint exactly once when prepared repeatedly', () => {
    const output = normalizePuml('skinparam topurl /api/\nA -> B [[core-auth#tag/auth]]: Authenticate');
    assert.match(output, /<style>/);
    assert.match(output, /OmniTrust diagram theme [a-f0-9]{64}/);
    assert.equal(normalizePuml(output), output);
    assert.equal((output.match(/<style>/g) ?? []).length, 1);
});

test('applies shared styling when the source wrapper is indented inside a fence', () => {
    const output = normalizePuml('    @startuml\n    A -> B : Hello\n    @enduml');
    assert.match(output, /OmniTrust diagram theme [a-f0-9]{64}/);
    assert.equal(normalizePuml(output), output);
});

test('leaves a long malformed arrow line unchanged without expensive scanning', () => {
    const moduleUrl = new URL('./normalizePuml.mjs', import.meta.url).href;
    const script = `import {normalizePuml} from ${JSON.stringify(moduleUrl)};
        const source = '-> '.repeat(100000) + 'broken[[url]missing';
        if (!normalizePuml(source).includes(source)) process.exit(1);`;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
        encoding: 'utf8', timeout: 5000,
    });
    assert.equal(result.error, undefined, 'Malformed lines must finish within the subprocess timeout');
    assert.equal(result.status, 0, result.stderr);
});

test('does not rewrite malformed URL delimiters or a link embedded after a message colon', () => {
    const source = 'Client -> Core [[core-auth]broken]]: Keep this\nClient -> Core : [[core-auth]]: Keep this too';
    assert.ok(normalizePuml(source).includes(source));
});

test('leaves empty arrow URL declarations unchanged', () => {
    const source = 'Client -> Core [[]]: Keep empty\nClient -> Core [[""]]: Keep quoted empty';
    assert.ok(normalizePuml(source).includes(source));
});

for (const arrow of ['->>', '<<--', '..>']) {
    test(`preserves ${arrow} arrows, quoted path parameters and label colons`, () => {
        const source = `Client ${arrow} Core [["core-auth#tag/auth/GET/v1/auth/{uuid}"]]: Reply: **OK** ②`;
        assert.ok(normalizePuml(source).includes(`Client ${arrow} Core : [["core-auth#tag/auth/GET/v1/auth/{uuid}" Reply: **OK** ②]]`));
    });
}

for (const separator of ['\u2028', '\u2029']) {
    test(`preserves Unicode line separator ${separator.codePointAt(0).toString(16)} in a linked message`, () => {
        const label = `Reply${separator}continued`;
        assert.ok(normalizePuml(`Client -> Core [[core-auth]]: ${label}`)
            .includes(`Client -> Core : [["core-auth" ${label}]]`));
    });
}
