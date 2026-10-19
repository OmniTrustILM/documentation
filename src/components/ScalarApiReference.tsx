import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {loadScalarRuntime, mountApiReference} from '../lib/scalarRuntime.mjs';
import '../css/scalar.css';

type ScalarRoute = {
    title: string;
    description: string;
    runtimeSrc: string;
    configuration: Record<string, unknown>;
};

/**
 * An API reference page.
 *
 * Scalar mounts client-side, so the server renders an empty container and the reference appears
 * once the bundle has loaded. Title and description come from Docusaurus rather than from Scalar's
 * own metadata options, which are applied too late to reach the generated HTML.
 */
export default function ScalarApiReference(
    {route, anchors = []}: {route: ScalarRoute; anchors?: string[]},
): React.JSX.Element {
    const container = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);

    const {title, description, runtimeSrc, configuration} = route;

    // Scalar resolves fragments in the browser, so none of them exist in the server-rendered HTML
    // that Docusaurus reads when it checks for broken anchors. Declaring them keeps a link into an
    // operation from being reported as broken. Which fragments are real is checked separately,
    // against the OpenAPI documents themselves.
    const brokenLinks = useBrokenLinks();
    anchors.forEach((anchor) => brokenLinks.collectAnchor(anchor));

    useEffect(() => {
        let teardown: (() => void) | undefined;
        let cancelled = false;

        loadScalarRuntime({document, window, src: runtimeSrc})
            .then((scalar) => {
                // The reader may have navigated away while the bundle was downloading, in which
                // case React has already detached the container.
                if (cancelled || !container.current) {
                    return;
                }
                teardown = mountApiReference(scalar, container.current, configuration);
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    // Without this the reader sees the fallback and the cause is unrecoverable.
                    console.error('Scalar API reference failed to load', error);
                    setFailed(true);
                }
            });

        return () => {
            cancelled = true;
            teardown?.();
        };
    }, [runtimeSrc, configuration]);

    return (
        <Layout title={title} description={description}>
            {failed ? (
                <div className="scalarApiReferenceError">
                    <h1>{title}</h1>
                    <p>This API reference could not be loaded. Please reload the page.</p>
                </div>
            ) : (
                <div ref={container} />
            )}
        </Layout>
    );
}
