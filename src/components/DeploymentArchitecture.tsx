import React, {useId, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './DeploymentArchitecture.module.css';

const installation = '/docs/certificate-key/installation-guide';
const architecture = '/docs/certificate-key/concept-design/architecture';
const operator = `${installation}/deployment/deployment-operator/custom-resources/platform`;

type ComponentInfo = {name: string; to: string; description: string; requirement?: string};

const services: ComponentInfo[] = [
  {
    name: 'Auth',
    to: `${architecture}/access-control/identification`,
    description: 'Identifies users and validates client certificates.',
  },
  {
    name: 'Access policies',
    to: `${architecture}/access-control/authorization`,
    description: 'OPA evaluates roles and permissions.',
  },
  {
    name: 'Scheduler',
    to: `${architecture}/scheduler`,
    description: 'Coordinates scheduled platform tasks.',
  },
];

const infrastructure: ComponentInfo[] = [
  {
    name: 'PostgreSQL',
    to: `${architecture}/database`,
    description: 'Stores platform data.',
    requirement: 'Required',
  },
  {
    name: 'Message broker',
    to: `${operator}#infrastructure-external-or-managed`,
    description: 'Carries platform messaging.',
    requirement: 'Required',
  },
  {
    name: 'Keycloak',
    to: `${operator}#managed-keycloak-keycloak-operator`,
    description: 'Provides an OIDC identity service when enabled.',
    requirement: 'Optional',
  },
];

function ComponentList({label, items}: {label: string; items: ComponentInfo[]}) {
  return (
    <ul className={styles.components} aria-label={label}>
      {items.map((item) => (
        <li key={item.name}>
          <div className={styles.componentTitle}>
            <Link to={item.to}>{item.name}</Link>
            {item.requirement && <span>{item.requirement}</span>}
          </div>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}

function Flow({children}: {children: ReactNode}) {
  return (
    <div className={styles.flow}>
      <svg viewBox="0 0 24 28" aria-hidden="true" focusable="false">
        <path d="M12 2v22m-6-6 6 6 6-6" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default function DeploymentArchitecture(): React.JSX.Element {
  const captionId = useId();

  return (
    <figure
      className={styles.diagram}
      aria-label="Kubernetes deployment architecture"
      aria-describedby={captionId}
    >
      <div className={styles.title}>
        <p>Kubernetes deployment</p>
        <span>Logical overview</span>
      </div>

      <div className={styles.clients}>
        <strong>Clients</strong>
        <span>Administrators, API consumers, and automation</span>
      </div>
      <Flow>HTTPS</Flow>

      <div className={styles.namespace}>
        <h3>Platform namespace</h3>
        <div className={styles.entry}>
          <div className={styles.node}>
            <p className={styles.kind}>Configured edge</p>
            <h4>
              <Link to={`${operator}#edge-and-tls`}>Ingress or Gateway API</Link>
            </h4>
            <p>The Operator can create an edge, or you can provide your own.</p>
          </div>
          <Flow>Routes traffic</Flow>
          <div className={`${styles.node} ${styles.gateway}`}>
            <p className={styles.kind}>Entry point</p>
            <h4>
              <Link to={`${operator}#per-component-overrides`}>API gateway</Link>
            </h4>
            <p>Routes requests to platform services.</p>
          </div>
        </div>

        <svg
          className={styles.branch}
          viewBox="0 0 400 32"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M300 0v12H100v19m200-19v19" />
        </svg>
        <p className={styles.relationship}>
          The API gateway routes requests to Core and the administrator interface.
        </p>
        <div className={styles.applications}>
          <div className={`${styles.node} ${styles.core}`}>
            <p className={styles.kind}>Application logic</p>
            <h4>
              <Link to={`${architecture}/core`}>Core</Link>
            </h4>
            <p>Processes API requests and coordinates platform operations.</p>
          </div>
          <div className={styles.node}>
            <p className={styles.kind}>Web application</p>
            <h4>
              <Link to={`${architecture}/interfaces`}>Administrator interface</Link>
            </h4>
            <p>Provides the browser interface for managing the platform.</p>
          </div>
        </div>

        <p className={styles.groupLabel}>Core supporting services</p>
        <ComponentList label="Core supporting services" items={services} />
      </div>

      <div className={styles.dependencies}>
        <h3>Connectors and connected technologies</h3>
        <p>
          Core calls registered connectors. They can run in the cluster or at a reachable external
          endpoint.
        </p>
        <div className={styles.connectorRoute}>
          <div className={styles.node}>
            <h4>
              <Link to="/docs/certificate-key/connectors/overview">Connectors</Link>
            </h4>
            <p>Translate platform operations for a specific technology.</p>
          </div>
          <Flow>Technology-specific calls</Flow>
          <div className={styles.node}>
            <h4>
              <Link to={`${architecture}/connector`}>Connected technologies</Link>
            </h4>
            <p>
              Certificate authorities and other integrations. A connector may use its own database.
            </p>
          </div>
        </div>

        <h3>Supporting infrastructure</h3>
        <p>
          Database and messaging are required; Keycloak is optional. The Operator can manage each
          dependency independently or use external infrastructure.
        </p>
        <ComponentList label="Supporting infrastructure" items={infrastructure} />
      </div>

      <div className={styles.trust} role="note" aria-label="Certificate trust">
        <h3>Certificate trust</h3>
        <p>
          For certificate sign-in, the TLS terminator requests the client certificate and forwards
          it to Core. Auth validates the chain against trusted CA certificates. A Kubernetes Secret
          supplies the CA bundle for certificate sign-in and trusted TLS connections.
        </p>
        <div className={styles.trustLinks}>
          <Link to={`${installation}/deployment/client-certificate-authentication`}>
            Client certificate authentication
          </Link>
          <Link to={`${installation}/create-trusted-certificates`}>Trusted CA certificates</Link>
        </div>
      </div>

      <figcaption id={captionId}>
        <p>
          Arrows show the main request paths. Supporting groups show responsibilities, not every
          network connection. Edge resources, enabled components, and infrastructure placement
          depend on configuration.
        </p>
        <div className={styles.sources}>
          <span>Deployment details</span>
          <Link to={operator}>Operator configuration</Link>
          <Link to={`${installation}/deployment/deployment-helm/configurable-parameters`}>
            Helm configuration
          </Link>
        </div>
      </figcaption>
    </figure>
  );
}
