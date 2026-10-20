import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/DocCard/Layout';
import styles from './styles.module.css';

export default function DocCardLayout({
  className,
  href,
  title,
  description,
}: Props): React.JSX.Element {
  return (
    <Link href={href} className={clsx('theme-doc-card-container', styles.card, className)}>
      <h2 className={styles.title}>{title}</h2>
      <svg
        className={styles.arrow}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
      {description && <p className={styles.description}>{description}</p>}
    </Link>
  );
}
