// Load the self-hosted Scalar bundle and mount an API reference into an element.
//
// The DOM is injected rather than reached for, so this can be exercised without a browser. The
// React shell in src/components/ScalarApiReference.tsx supplies the real `document` and `window`.

/** @type {Promise<unknown> | null} */
let pending = null;

/** Drop the memoized load so each test starts from a clean slate. */
export function resetScalarRuntimeForTests() {
    pending = null;
}

/** @param {{document: Document, src: string}} deps */
function injectScript({document, src}) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () => {
            // Leaving the failed element in place would make the next attempt find it, resolve
            // immediately and then fail on the missing global instead of retrying the download.
            script.remove();
            reject(new Error(`${src} could not be loaded`));
        });
        document.head.appendChild(script);
    });
}

/**
 * Load the bundle at most once per page, however many references ask for it.
 *
 * A failed load clears the memo so a later navigation can retry rather than inheriting the
 * rejection forever.
 *
 * @param {{document: Document, window: Window, src: string}} deps
 * @returns {Promise<{createApiReference: Function}>}
 */
export function loadScalarRuntime({document, window, src}) {
    pending ??= injectScript({document, src}).then(() => {
        if (!window.Scalar) {
            throw new Error(`${src} loaded but did not define the Scalar global`);
        }
        return window.Scalar;
    });

    const attempt = pending;
    return attempt.catch((error) => {
        if (pending === attempt) pending = null;
        throw error;
    });
}

/**
 * Mount a reference and return its teardown.
 *
 * Scalar's instance owns document-level listeners and an injected stylesheet, so teardown must call
 * `destroy()`; unmounting the inner app alone would leak both.
 *
 * @param {{createApiReference: Function}} scalar
 * @param {Element} element
 * @param {object} configuration
 * @returns {() => void}
 */
export function mountApiReference(scalar, element, configuration) {
    const instance = scalar.createApiReference(element, configuration);
    let destroyed = false;

    return () => {
        if (destroyed) return;
        destroyed = true;
        instance?.destroy?.();
    };
}
