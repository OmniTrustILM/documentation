import React, {useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import TrustNetwork from '../components/home/TrustNetwork';
import {journeys, resources, trustAreas, type TrustArea} from '../components/home/content';
import styles from './index.module.css';

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home(): React.JSX.Element {
  const [area, setArea] = useState<TrustArea>(trustAreas[0]);
  return (
    <Layout
      title="Digital trust, continuously renewed"
      description="Explore the open-source platform for trust lifecycle management. Learn, deploy, operate and integrate certificates, keys, secrets and signing."
    >
      <main className={styles.home}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <span /> Trust lifecycle management
            </p>
            <h1 id="home-title">
              Digital trust.
              <br />
              Continuously
              <br />
              <em>renewed.</em>
            </h1>
            <p className={styles.lead}>
              Discover, manage and automate the cryptography that keeps your systems trusted.
            </p>
            <p className={styles.context}>
              ILM is an open-source platform for cryptographic assets and trust services across your
              infrastructure.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} to="/docs">
                Discover the platform <Arrow />
              </Link>
              <Link
                className={styles.textLink}
                to="/docs/certificate-key/installation-guide/deployment/deployment-options"
              >
                Start deploying <Arrow />
              </Link>
            </div>
            <p className={styles.footnote}>
              From first principles to production. <span />
            </p>
          </div>
          <TrustNetwork selected={area} onSelect={setArea} />
        </section>
        <section
          id="trust-area-detail"
          className={styles.detail}
          aria-live="polite"
          aria-atomic="true"
          aria-label="Selected trust area"
        >
          <p className={styles.detailLabel}>{area.label}</p>
          <div>
            <h2>{area.title}</h2>
            <p>{area.description}</p>
            {area.id === 'signing' && (
              <Link to="/docs/signserver/introduction">
                SignServer integration <Arrow />
              </Link>
            )}
          </div>
          <Link className={styles.textLink} to={area.href}>
            {area.action} <Arrow />
          </Link>
        </section>
        <section className={styles.journey} aria-labelledby="journey-title">
          <div>
            <p className={styles.eyebrow}>Find your way</p>
            <h2 id="journey-title">
              Your next step,
              <br />
              made clear.
            </h2>
            <p>
              No prior knowledge needed.
              <br />
              Start where you are.
            </p>
          </div>
          <div className={styles.routes}>
            {journeys.map((journey, index) => (
              <Link key={journey.label} to={journey.href}>
                <span className={styles.number} aria-hidden="true">
                  0{index + 1}
                </span>
                <span>
                  <h3>{journey.label}</h3>
                  <p>{journey.description}</p>
                </span>
                <Arrow />
              </Link>
            ))}
          </div>
        </section>
        <section className={styles.visibility} aria-labelledby="visibility-title">
          <div className={styles.inventoryArt} aria-hidden="true">
            <div className={styles.inventoryOrbit} />
            <div className={styles.inventoryOrbit} />
            <span className={styles.inventoryCore}>CBOM</span>
            <span className={styles.inventoryOne}>Discover</span>
            <span className={styles.inventoryTwo}>Understand</span>
            <span className={styles.inventoryThree}>Prepare</span>
          </div>
          <div>
            <p className={styles.eyebrow}>Cryptographic visibility</p>
            <h2 id="visibility-title">
              You can only govern
              <br />
              what you can see.
            </h2>
            <p>
              Explore cryptographic asset inventory and the Cryptographic Bill of Materials (CBOM).
              Build the visibility needed to assess cryptography and prepare for post-quantum
              change.
            </p>
            <Link
              className={styles.textLink}
              to="/docs/certificate-key/concept-design/modules/cryptographic-asset-inventory"
            >
              Explore cryptographic inventory <Arrow />
            </Link>
          </div>
        </section>
        <section className={styles.architecture} aria-labelledby="architecture-title">
          <div>
            <p className={styles.eyebrow}>Fits your environment</p>
            <h2 id="architecture-title">
              A connected platform.
              <br />A practical architecture.
            </h2>
            <p>
              Connect existing infrastructure and automate repeatable trust operations through
              connectors and workflows.
            </p>
            <Link
              className={styles.textLink}
              to="/docs/certificate-key/concept-design/architecture/overview"
            >
              Understand the architecture <Arrow />
            </Link>
          </div>
          <figure className={styles.architectureArt}>
            <div className={styles.environments}>
              <span>On-premises</span>
              <span>Cloud</span>
              <span>Hybrid</span>
            </div>
            <div className={styles.platform}>
              <span>Connectors</span>
              <strong>Platform</strong>
              <span>Workflows</span>
            </div>
            <figcaption>Discover. Manage. Automate.</figcaption>
          </figure>
        </section>
        <section className={styles.resources} aria-label="More resources">
          {resources.map((resource) => (
            <Link key={resource.label} to={resource.href}>
              <span>
                <h2>{resource.label}</h2>
                <p>{resource.description}</p>
              </span>
              <Arrow />
            </Link>
          ))}
        </section>
      </main>
    </Layout>
  );
}
