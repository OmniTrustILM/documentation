import React, {useId, useState} from 'react';
import {authenticationFlows, type AuthenticationProtocol} from './AuthenticationFlow.data';
import styles from './AuthenticationFlow.module.css';

/** A manual walkthrough with a complete, server-rendered reference. No timed playback. */
export default function AuthenticationFlow({
  protocol,
}: {
  protocol: AuthenticationProtocol;
}): React.JSX.Element {
  const flow = authenticationFlows[protocol];
  const [selected, setSelected] = useState(1);
  const id = useId();
  const panelId = `${id}-step`;
  const captionId = `${id}-caption`;
  const active = flow.steps[selected];
  const actorName = (actorId: string) => flow.actors.find((actor) => actor.id === actorId)!.name;
  const relationship = (step: typeof active) => `${actorName(step.from)} → ${actorName(step.to)}`;

  function stepButton(index: number) {
    const step = flow.steps[index];
    return (
      <button
        key={step.title}
        type="button"
        className={styles.stepButton}
        aria-label={`Step ${index + 1}: ${step.title}`}
        aria-pressed={selected === index}
        aria-controls={panelId}
        onClick={() => setSelected(index)}
      >
        <span aria-hidden="true">{index + 1}</span>
        <span>{step.title}</span>
      </button>
    );
  }

  function stepMessage(index: number) {
    const step = flow.steps[index];
    return (
      <>
        <p className={styles.eyebrow}>
          {index === 0 ? 'Trust setup' : 'Runtime request'} · Step {index + 1} of 11
        </p>
        <h4>{step.title}</h4>
        <div className={styles.path} aria-hidden="true">
          <strong>{actorName(step.from)}</strong>
          <svg viewBox="0 0 24 16" focusable="false">
            <path d="M2 8h20m-6-6 6 6-6 6" />
          </svg>
          <strong>{actorName(step.to)}</strong>
        </div>
        <span className={styles.srOnly}>{relationship(step)}</span>
        <p className={styles.explanation}>{step.description}</p>
      </>
    );
  }

  return (
    <figure className={styles.flow} aria-label={flow.title} aria-describedby={captionId}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Authentication walkthrough</span>
          <h3>{flow.protocol}</h3>
        </div>
        <span className={styles.credential}>{flow.credential}</span>
      </header>
      <ul className={styles.actors} aria-label="Participants">
        {flow.actors.map((actor, index) => {
          const highlighted = actor.id === active.from || actor.id === active.to;
          return (
            <li key={actor.id} className={highlighted ? styles.activeActor : undefined}>
              <div className={styles.actorHeading}>
                <span className={styles.actorNumber} aria-hidden="true">
                  {String.fromCodePoint(65 + index)}
                </span>
                <strong>{actor.name}</strong>
              </div>
              <span className={styles.role}>{actor.role}</span>
              <p>{actor.description}</p>
            </li>
          );
        })}
      </ul>
      <div className={styles.walkthrough}>
        <div className={styles.selector}>
          <section className={styles.setup} aria-label="Trust setup">
            <h4>Trust setup</h4>
            <p>{flow.steps[0].description}</p>
            {stepButton(0)}
          </section>
          <fieldset aria-label="Runtime steps" className={styles.runtime}>
            <legend>Runtime request</legend>
            {flow.steps.slice(1).map((_, index) => stepButton(index + 1))}
          </fieldset>
        </div>
        <div className={styles.detail}>
          <div className={styles.compactSelector}>
            <label htmlFor={`${id}-select`}>Select authentication step</label>
            <select
              id={`${id}-select`}
              value={selected}
              aria-controls={panelId}
              onChange={(event) => setSelected(Number(event.target.value))}
            >
              <optgroup label="Trust setup">
                <option value={0}>1. {flow.steps[0].title}</option>
              </optgroup>
              <optgroup label="Runtime request">
                {flow.steps.slice(1).map((step, index) => (
                  <option key={step.title} value={index + 1}>
                    {index + 2}. {step.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className={styles.panel}>
            {/* Invisible sizing copies reserve the tallest step without hiding the full reference. */}
            {flow.steps.map((step, index) => (
              <div
                key={step.title}
                className={`${styles.message} ${styles.sizing}`}
                aria-hidden="true"
              >
                {stepMessage(index)}
              </div>
            ))}
            <section
              id={panelId}
              aria-label="Selected step"
              aria-live="polite"
              aria-atomic="true"
              className={styles.message}
            >
              {stepMessage(selected)}
            </section>
          </div>
          <div className={styles.navigation}>
            <button
              type="button"
              onClick={() => setSelected((step) => Math.max(0, step - 1))}
              disabled={selected === 0}
            >
              Previous step
            </button>
            <span aria-hidden="true">
              {selected + 1} / {flow.steps.length}
            </span>
            <button
              type="button"
              onClick={() => setSelected((step) => Math.min(flow.steps.length - 1, step + 1))}
              disabled={selected === flow.steps.length - 1}
            >
              Next step
            </button>
          </div>
          <p className={styles.hint}>Select a step to follow its path. Read every step below.</p>
        </div>
      </div>
      <div className={styles.reference}>
        <h4>Complete step reference</h4>
        <ol aria-label="Complete step reference">
          {flow.steps.map((step, index) => (
            <li key={step.title}>
              <h5>
                {step.title}
                {index === 0 && <span className={styles.setupTag}>Trust setup</span>}
              </h5>
              <p className={styles.referencePath}>{relationship(step)}</p>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
      <figcaption id={captionId}>
        Step 1 establishes trust. Steps 2–11 show authentication, authorization and the signing or
        validation request. Highlighted cards identify the participants in the selected step.
      </figcaption>
    </figure>
  );
}
