// Manage the pinned plantuml-server Docker container lifecycle.

import {spawnSync} from 'node:child_process';

// plantuml-server v1.2026.9 (tag: jetty), pinned by digest for reproducible renders.
export const DOCKER_IMAGE = 'plantuml/plantuml-server@sha256:065c66adc6728ba6dd353a29d4ada73f8358b68549a0f710c4bf46b43c103618';

// A tiny pre-encoded diagram ("Bob -> Alice : hello") used only to probe readiness.
const READY_ENCODED = 'SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vt98pKi1oW00';

/** @returns {string} the readiness probe path */
export function readinessPath() {
    return `/svg/${READY_ENCODED}`;
}

/**
 * Extract the mapped host port from `docker port <cid> 8080/tcp` output.
 * @param {string} dockerPortOutput
 * @returns {number}
 */
export function parseMappedPort(dockerPortOutput) {
    const first = dockerPortOutput.split('\n').map((s) => s.trim()).filter(Boolean)[0];
    if (!first) {
        throw new Error('could not determine the mapped port from docker port output');
    }
    const m = first.match(/:(\d+)$/);
    if (!m) {
        throw new Error(`unexpected docker port output: ${first}`);
    }
    return Number(m[1]);
}

function ensureDocker() {
    const r = spawnSync('docker', ['version', '--format', '{{.Server.Version}}'], {encoding: 'utf8'});
    if (r.status !== 0) {
        throw new Error(
            'Docker is required to render PlantUML diagrams but was not reachable.\n' +
            'Install Docker and ensure the daemon is running, or set PLANTUML_SERVER_URL to an ' +
            'already-running plantuml-server (e.g. PLANTUML_SERVER_URL=http://127.0.0.1:8080).'
        );
    }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Boot the pinned server (or reuse PLANTUML_SERVER_URL), returning its base URL and a stop fn.
 * @returns {Promise<{ baseUrl: string, stop: () => Promise<void> }>}
 */
export async function startServer() {
    const external = process.env.PLANTUML_SERVER_URL;
    if (external) {
        const baseUrl = external.replace(/\/$/, '');
        await waitReady(baseUrl);
        return {
            baseUrl, stop: async () => {
            }
        };
    }

    ensureDocker();
    const run = spawnSync('docker', [
        'run', '--rm', '-d',
        '-p', '127.0.0.1:0:8080',
        '-e', 'PLANTUML_SECURITY_PROFILE=SANDBOX',
        DOCKER_IMAGE,
    ], {encoding: 'utf8'});

    if (run.status !== 0) {
        throw new Error(`docker run failed:\n${run.stderr}`);
    }

    const cid = run.stdout.trim();

    // Stop the docker container on SIGINT+SIGTERM.
    const signals = /** @type {const} */ (['SIGINT', 'SIGTERM']);
    const signalNumber = {SIGINT: 2, SIGTERM: 15};
    let stopped = false;
    const dockerStop = () => {
        if (stopped) return;
        stopped = true;
        spawnSync('docker', ['stop', cid], {encoding: 'utf8'});
    };
    const onSignal = (signal) => {
        dockerStop();
        process.exit(128 + signalNumber[signal]);
    };
    for (const s of signals) process.on(s, onSignal);

    const stop = async () => {
        for (const s of signals) process.off(s, onSignal);
        dockerStop();
    };

    try {
        const portRun = spawnSync('docker', ['port', cid, '8080/tcp'], {encoding: 'utf8'});
        if (portRun.status !== 0) {
            throw new Error(`docker port failed:\n${portRun.stderr}`);
        }

        const port = parseMappedPort(portRun.stdout);
        const baseUrl = `http://127.0.0.1:${port}`;
        await waitReady(baseUrl);

        return {baseUrl, stop};
    } catch (err) {
        await stop();
        throw err;
    }
}

/** Poll a trivial render until HTTP 200, bounded. @param {string} baseUrl */
async function waitReady(baseUrl, {timeoutMs = 60000} = {}) {
    const url = `${baseUrl}${readinessPath()}`;
    const deadline = Date.now() + timeoutMs;
    let lastErr = 'no response';
    while (Date.now() < deadline) {
        try {
            const res = await fetch(url);
            if (res.status === 200) {
                return;
            }

            lastErr = `HTTP ${res.status}`;
            await res.body?.cancel();
        } catch (e) {
            lastErr = e.message;
        }
        await sleep(500);
    }
    throw new Error(
        `plantuml-server did not become ready within ${timeoutMs}ms (${lastErr}). ` +
        'Check Docker health / the pinned image.'
    );
}
