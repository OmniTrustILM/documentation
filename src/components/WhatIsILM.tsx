import React from 'react';

import Divider from './Divider';
import styles from './WhatIsILM.module.css';

const WhatIs = (): React.ReactElement => (
    <section className={styles.whatIs}>
        <h1 className={styles.whatIsHeader}>
            What is ILM?
        </h1>
        <p>
            Identity Lifecycle Management (ILM) is a platform that brings easy and convenient solution to protect our baseline security in every
            day digital communication by assuring and automating cryptographic keys, digital certificates, and
            digital signature as part of trust services lifecycle.
        </p>
        <p>
            The platform is designed and developed by a team of PKI and information security enthusiasts with practical
            point of view on the management and automation in hybrid environments. PKI is the backbone of security
            in our daily communication and its security and easy management should be available to everyone.
        </p>
        <p>
            It is designed to protect critical assets and services for companies of any size and individuals.
            One of the goals is to provide an easy and affordable way to secure digital communication and support
            information security in more and more connected world.
        </p>
        <Divider />
    </section>
);

export default WhatIs;