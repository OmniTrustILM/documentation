import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {loadScalarRuntime, mountApiReference} from '../lib/scalarRuntime.mjs';
import '../css/scalar.css';
import styles from './ScalarApiReference.module.css';

type ScalarRoute = {
  title: string;
  description: string;
  runtimeSrc: string;
  configuration: Record<string, unknown>;
  reference: {
    group: string;
    version: string;
    catalogUrl: string;
    specUrl: string;
  };
};

const announcements = {
  loading: 'Loading API reference… You can download the specification while it opens.',
  ready: 'API reference loaded.',
  error: '',
};

/**
 * An API reference page.
 *
 * Navigation, release context and the specification remain usable before Scalar mounts and when
 * loading fails. Docusaurus owns page metadata because Scalar applies its metadata client-side.
 */
export default function ScalarApiReference({
  route,
  anchors = [],
}: {
  route: ScalarRoute;
  anchors?: string[];
}): React.JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  const {title, description, runtimeSrc, configuration, reference} = route;

  // Scalar resolves fragments in the browser, so none of them exist in the server-rendered HTML
  // that Docusaurus reads when it checks for broken anchors. Declaring them keeps a link into an
  // operation from being reported as broken. Which fragments are real is checked separately,
  // against the OpenAPI documents themselves.
  const brokenLinks = useBrokenLinks();
  anchors.forEach((anchor) => brokenLinks.collectAnchor(anchor));

  useEffect(() => {
    let teardown: (() => void) | undefined;
    let cancelled = false;
    setStatus('loading');

    loadScalarRuntime({document, window, src: runtimeSrc})
      .then((scalar) => {
        // The reader may have navigated away while the bundle was downloading, in which
        // case React has already detached the container.
        if (cancelled || !container.current) {
          return;
        }
        teardown = mountApiReference(scalar, container.current, {
          ...configuration,
          onLoaded: () => {
            if (!cancelled) setStatus('ready');
          },
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          // Without this the reader sees the fallback and the cause is unrecoverable.
          console.error('Scalar API reference failed to load', error);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [runtimeSrc, configuration, attempt]);

  function retryLoading() {
    heading.current?.focus();
    setAttempt((value) => value + 1);
  }

  return (
    <Layout title={title} description={description}>
      <div className={styles.reference}>
        <header className={styles.header}>
          <nav aria-label="API breadcrumb" className={styles.breadcrumb}>
            <Link to={reference.catalogUrl}>All APIs</Link>
            <span aria-hidden="true">/</span>
            <span>{reference.group}</span>
          </nav>
          <div className={styles.heading}>
            <div>
              <p className={styles.release}>API release {reference.version}</p>
              <h1 ref={heading} tabIndex={-1}>
                {title}
              </h1>
            </div>
            <a href={reference.specUrl} download className={styles.download}>
              Download OpenAPI specification <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>
        <output
          aria-live="polite"
          aria-atomic="true"
          className={status === 'loading' ? styles.status : styles.announcement}
        >
          {announcements[status]}
        </output>
        {status === 'error' && (
          <div role="alert" className={styles.error}>
            <p>
              This API reference could not be loaded. Try again or download its OpenAPI
              specification above.
            </p>
            <button type="button" onClick={retryLoading}>
              Retry loading reference
            </button>
          </div>
        )}
        <noscript>
          <p className={styles.status}>
            JavaScript is needed to browse endpoints. The OpenAPI specification above is available
            to download.
          </p>
        </noscript>
        <div
          ref={container}
          className={styles.renderer}
          aria-busy={status === 'loading'}
          hidden={status === 'error'}
        />
      </div>
    </Layout>
  );
}
