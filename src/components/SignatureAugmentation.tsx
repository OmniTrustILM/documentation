import React from 'react';
import styles from './SignatureAugmentation.module.css';

const evidenceLayers = [
  {
    level: 'B-T',
    title: 'Signature with time',
    label: 'B-T signature with time',
    additions: [{title: 'Signature timestamp', detail: 'Time evidence for the basic signature.'}],
  },
  {
    level: 'B-LT',
    title: 'Long-term validation material',
    label: 'B-LT long-term validation',
    additions: [
      {
        title: 'Certificate and revocation data',
        detail: 'Complete validation material for the signature and its timestamp.',
      },
    ],
  },
  {
    level: 'B-LTA',
    title: 'Long-term availability and integrity',
    label: 'B-LTA archival protection',
    additions: [
      {title: 'Additional validation material', detail: 'Evidence needed for archival validation.'},
      {
        title: 'Archive time assertion',
        detail: 'Protects the preceding signature and validation material.',
      },
    ],
  },
] as const;

function BasicSignature(): React.JSX.Element {
  return (
    <section className={`${styles.level} ${styles.basic}`} aria-label="B-B basic signature">
      <header>
        <span>B-B</span>
        <strong>Basic signature</strong>
      </header>
      <div className={styles.core}>
        <div>
          <strong>Signer's document or SD representation</strong>
        </div>
        <div>
          <strong>Signed attributes</strong>
          <span className={styles.certificate}>Signing certificate</span>
        </div>
        <div>
          <strong>Signature value</strong>
        </div>
      </div>
    </section>
  );
}

export default function SignatureAugmentation(): React.JSX.Element {
  const signature = evidenceLayers.reduce<React.ReactNode>(
    (inner, layer) => (
      <section key={layer.level} className={styles.level} aria-label={layer.label}>
        <header>
          <span>{layer.level}</span>
          <strong>{layer.title}</strong>
        </header>
        {inner}
        <div className={styles.additions}>
          <p className={styles.label}>Unsigned attributes added</p>
          <div className={styles.evidence}>
            {layer.additions.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    <BasicSignature />,
  );

  return (
    <figure className={styles.figure} aria-label="Cumulative signature evidence">
      <section className={styles.renewal} aria-label="Repeatable archive renewal">
        {signature}
        <header>
          <span aria-hidden="true">↻</span>
          <strong>Repeat archival protection as needed</strong>
        </header>
        <div className={styles.evidence}>
          <div>
            <strong>Additional validation material</strong>
          </div>
          <div>
            <strong>New time assertion</strong>
          </div>
        </div>
        <p>Each renewal protects the preceding signature and its validation material.</p>
      </section>
      <figcaption>
        Each outer boundary retains the material inside it. The signed attributes and signature
        value stay unchanged; augmentation adds unsigned attributes.
      </figcaption>
    </figure>
  );
}
