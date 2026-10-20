import React from 'react';
import clsx from 'clsx';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import Container from '@theme/CodeBlock/Container';
import Title from '@theme/CodeBlock/Title';
import Content from '@theme/CodeBlock/Content';
import Buttons from '@theme/CodeBlock/Buttons';
import type {Props} from '@theme/CodeBlock/Layout';
import styles from './styles.module.css';

export default function CodeBlockLayout({className}: Props): React.JSX.Element {
  const {metadata} = useCodeBlockContext();
  return (
    <Container as="div" className={clsx(className, metadata.className)}>
      <header className={styles.header}>
        <div className={styles.title}>
          {metadata.title ? <Title>{metadata.title}</Title> : metadata.language || 'text'}
        </div>
        <div className={styles.actions}>
          <Buttons className={styles.controls} />
        </div>
      </header>
      <div className={styles.content}>
        <Content />
      </div>
    </Container>
  );
}
