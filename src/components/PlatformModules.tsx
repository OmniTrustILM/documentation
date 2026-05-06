/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import styles from './PlatformModules.module.css';
import useBaseUrl from "@docusaurus/useBaseUrl";

type ModuleItem = {
  title: string;
  link: string;
  image: string;
  description: JSX.Element;
};

const ModuleList: ModuleItem[] = [
    {
        title: 'Digital Certificates',
        link: 'docs/certificate-key/introduction',
        image: 'img/undraw_certificate.svg',
        description: (
            <>
                Manage and automate digital certificate lifecycle across your infrastructure and various
                certification authority technologies.
            </>
        ),
    },
    {
        title: 'Cryptographic Keys',
        link: 'docs/certificate-key/introduction',
        image: 'img/undraw_key.svg',
        description: (
            <>
                Effective and vendor agnostic management and automation of cryptographic keys and related
                cryptographic operations.
            </>
        ),
    },
    {
        title: 'Digital Signatures',
        link: 'docs/signing/introduction',
        image: 'img/undraw_signing.svg',
        description: (
            <>
                Remote server side signing supporting various digital signature formats and cryptographic
                algorithms.
            </>
        ),
    },
    {
        title: 'Digital Secrets',
        link: 'docs/certificate-key/introduction',
        image: 'img/undraw_safe.svg',
        description: (
            <>
                Centralized secret management across various vault technologies with versioning,
                synchronization, and compliance support.
            </>
        ),
    },
];

function Module({title, link, image, description}: ModuleItem) {
  return (
    <div className={clsx('col col--3', styles.card)}>
      <div className="text--center">
        <img className={styles.moduleSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3><a href={useBaseUrl(link)}>{title}</a></h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function PlatformModules(): JSX.Element {
  return (
    <section className={styles.modules}>
      <div className="container">
        <div className="row">
          {ModuleList.map((props, idx) => (
            <Module key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
