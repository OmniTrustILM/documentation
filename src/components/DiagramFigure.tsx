import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useIsBrowser from '@docusaurus/useIsBrowser';
import styles from './DiagramFigure.module.css';

type Props = {label: string} & (
  {src: string; children?: never} | {src?: never; children: React.ReactElement}
);

export default function DiagramFigure({src, label, children}: Props): React.JSX.Element {
  const url = useBaseUrl(src ?? '/');
  const isAsset = src !== undefined;
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const expanded = useRef<HTMLObjectElement>(null);
  const releaseSvgKeyboard = useRef<(() => void) | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const isBrowser = useIsBrowser();

  const closeOnEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && dialog.current?.open) {
      event.preventDefault();
      dialog.current.close();
    }
  }, []);

  const connectSvgKeyboard = useCallback(() => {
    releaseSvgKeyboard.current?.();
    releaseSvgKeyboard.current = undefined;
    const svg = expanded.current?.contentDocument;
    if (!svg) return;
    svg.addEventListener('keydown', closeOnEscape);
    releaseSvgKeyboard.current = () => svg.removeEventListener('keydown', closeOnEscape);
  }, [closeOnEscape]);

  useEffect(() => {
    connectSvgKeyboard();
    return () => releaseSvgKeyboard.current?.();
  }, [connectSvgKeyboard, url]);

  function fit() {
    setZoom(1);
    if (viewport.current) {
      viewport.current.scrollLeft = 0;
      viewport.current.scrollTop = 0;
    }
  }

  return (
    <figure className={styles.figure} aria-label={label}>
      {isAsset ? (
        <object
          className={`plantumlDiagram ${styles.preview}`}
          type="image/svg+xml"
          data={url}
          aria-label={label}
        >
          {label}
        </object>
      ) : (
        <section className={styles.vectorPreview} aria-label={`${label} illustration`} tabIndex={0}>
          {children}
        </section>
      )}
      <dialog
        id={id}
        ref={dialog}
        className={styles.dialog}
        aria-label={label}
        onClose={() => {
          fit();
          opener.current?.focus();
        }}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{label}</h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close diagram">
            Close ×
          </button>
        </header>
        <fieldset className={styles.toolbar} aria-label="Zoom controls">
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom === 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
          >
            −
          </button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom === 3}
            onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
          >
            +
          </button>
          <button type="button" onClick={fit}>
            Fit to width
          </button>
          <span>Scroll to explore · Esc to close</span>
        </fieldset>
        <section
          ref={viewport}
          className={styles.viewport}
          aria-label="Scrollable diagram"
          tabIndex={0}
        >
          {isAsset ? (
            <object
              ref={expanded}
              className={styles.expanded}
              onLoad={connectSvgKeyboard}
              style={{width: `${zoom * 100}%`}}
              type="image/svg+xml"
              data={url}
              aria-label={label}
            >
              {label}
            </object>
          ) : (
            <div className={styles.expanded} style={{width: `${zoom * 100}%`}}>
              {children}
            </div>
          )}
        </section>
      </dialog>
      <figcaption className={styles.caption}>
        <span>{label}</span>
        <div className={styles.actions}>
          <button
            ref={opener}
            type="button"
            aria-haspopup="dialog"
            aria-controls={id}
            aria-label={`Expand ${label}`}
            disabled={!isBrowser}
            onClick={() => dialog.current?.showModal()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5" />
            </svg>
            Expand diagram
          </button>
          {isAsset && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open full diagram ↗
            </a>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
