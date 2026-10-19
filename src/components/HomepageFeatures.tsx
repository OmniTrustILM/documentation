/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license.
 */
import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'Service-based approach',
        image: 'img/undraw_Operating_system.svg',
        description: (
            <>
                Provide a higher-level abstraction on top of PKI configuration using bundle of service attributes.
            </>
        ),
    },
    {
        title: 'Abstraction of PKI tasks and agility',
        image: 'img/undraw_abstract.svg',
        description: (
            <>
                Change the service configuration on the fly, without impact on integrated clients, and trusted technology.
            </>
        ),
    },
    {
        title: 'Fast integration of use-cases',
        image: 'img/undraw_fast_loading.svg',
        description: (
            <>
                Streamline integration procedures and reduce time and costs needed to enable clients to use certificates.
            </>
        ),
    },
    {
        title: 'Easy maintenance of the PKI',
        image: 'img/undraw_Maintenance.svg',
        description: (
            <>
                Transparent behaviour makes possible to maintain the PKI while using its services.
            </>
        ),
    },
];

function Feature({title, image, description}: FeatureItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
