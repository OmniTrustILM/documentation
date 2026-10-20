import React, {useId, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {buildApiCatalogView, filterApiCatalog} from '../lib/apiCatalogView.mjs';
import styles from './ApiCatalog.module.css';

type Entry = ReturnType<typeof buildApiCatalogView>[number];

export default function ApiCatalog({entries}: {entries: Entry[]}): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const searchId = useId();
  const familyId = useId();
  const groups = [...new Set(entries.map((entry) => entry.group))];
  const visible = filterApiCatalog(entries, {query, group});

  function clearFilters() {
    setQuery('');
    setGroup('');
  }

  return (
    <Layout
      title="API reference"
      description="Explore ILM APIs, inspect endpoints and schemas, and download OpenAPI specifications."
    >
      <main className={styles.catalog}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>Build with ILM</p>
          <h1>API reference</h1>
          <p className={styles.lead}>Find the interface for what you want to build.</p>
          <p>
            Explore endpoints, schemas and examples across the platform. Each reference includes its
            published OpenAPI specification.
          </p>
          <Link to={useBaseUrl('/docs/contributors/overview')}>
            Development guides <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <div className={styles.filters}>
          <div className={styles.search}>
            <label htmlFor={searchId}>Search API references</label>
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder="Try certificates, signing or discovery"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className={styles.family}>
            <label htmlFor={familyId}>API family</label>
            <select id={familyId} value={group} onChange={(event) => setGroup(event.target.value)}>
              <option value="">All families</option>
              {groups.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.clear}
            disabled={!query && !group}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        <p role="status" aria-live="polite" aria-atomic="true" className={styles.count}>
          {visible.length} of {entries.length} API references
        </p>
        <section aria-label="API references">
          {visible.length === 0 ? (
            <div className={styles.empty}>
              <h2>No API references match your filters.</h2>
              <p>Try another term or clear the filters to explore all API families.</p>
            </div>
          ) : (
            groups.map((name) => {
              const members = visible.filter((entry) => entry.group === name);
              if (members.length === 0) return null;
              return (
                <section className={styles.group} key={name}>
                  <div className={styles.groupHeading}>
                    <h2>{name}</h2>
                    <span>
                      {members.length} {members.length === 1 ? 'reference' : 'references'}
                    </span>
                  </div>
                  <ul className={styles.grid}>
                    {members.map((entry) => (
                      <li key={entry.id} className={styles.card}>
                        <div className={styles.cardMeta}>
                          <span>{entry.label}</span>
                          <span>v{entry.version}</span>
                        </div>
                        <h3>
                          <Link to={entry.route}>{entry.title}</Link>
                        </h3>
                        {entry.description && <p>{entry.description}</p>}
                        <a
                          className={styles.download}
                          href={entry.specUrl}
                          download
                          aria-label={`Download ${entry.title} OpenAPI specification`}
                        >
                          OpenAPI <span aria-hidden="true">↓</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </section>
      </main>
    </Layout>
  );
}
