import React from 'react';
import styles from './PlatformArchitecture.module.css';

const layers = [
  {
    name: 'Interfaces',
    detail: 'Connect clients and automation',
    items: ['Web application', 'REST API', 'Certificate protocols'],
  },
  {
    name: 'Core',
    detail: 'Authentication and authorization',
    items: [
      'Profiles and inventories',
      'Discovery and workflows',
      'Reporting and compliance',
      'Approvals',
    ],
  },
  {
    name: 'Connectors',
    detail: 'Integrate technology through consistent interfaces',
    items: [
      'Certification authorities',
      'Discovery providers',
      'Signing engines',
      'Credential providers',
      'Technology and entity providers',
    ],
  },
];

export default function PlatformArchitecture(): React.JSX.Element {
  return (
    <figure className={styles.diagram} aria-label="Platform architecture">
      <div className={styles.layers}>
        {layers.map((layer) => (
          <section className={styles.layer} key={layer.name}>
            <h3>{layer.name}</h3>
            <p>{layer.detail}</p>
            <ul>
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <figcaption>
        Clients communicate with Core through platform interfaces. Core applies authorization and
        application logic, then calls connectors for technology-specific operations.
      </figcaption>
    </figure>
  );
}
