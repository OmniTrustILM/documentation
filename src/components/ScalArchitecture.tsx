import React, {useId} from 'react';
import {
  scalModels,
  type ScalEntity,
  type ScalExchange,
  type ScalModel,
  type ScalView,
} from './ScalArchitecture.data';
import styles from './ScalArchitecture.module.css';
import DiagramFigure from './DiagramFigure';

function EntityIcon({kind}: {kind: ScalEntity['icon']}) {
  switch (kind) {
    case 'users':
      return (
        <>
          <circle cx="24" cy="15" r="7" />
          <circle cx="9" cy="10" r="5" />
          <circle cx="39" cy="10" r="5" />
          <path d="M11 44v-8c0-8 6-13 13-13s13 5 13 13v8M1 31v-5c0-6 4-10 9-10m37 15v-5c0-6-4-10-9-10" />
        </>
      );
    case 'signer':
      return (
        <>
          <circle cx="24" cy="12" r="8" />
          <path d="M8 43v-6c0-9 7-15 16-15s16 6 16 15v6M17 43v-9m14 9v-9" />
        </>
      );
    case 'document':
      return (
        <path d="M9 3h20l10 10v32H9zM29 3v11h10M16 21h15M16 27h10M15 38c5-13 5 4 10-3 2-3 3 3 8 0" />
      );
    case 'application':
      return (
        <>
          <rect x="3" y="7" width="42" height="34" rx="4" />
          <path d="M3 17h42M10 12h1m5 0h1M17 25l-5 5 5 5m14-10 5 5-5 5" />
        </>
      );
    default:
      return (
        <>
          <rect x="8" y="8" width="32" height="32" rx="5" />
          <rect x="17" y="17" width="14" height="14" rx="2" />
          <path d="M16 2v6m8-6v6m8-6v6M16 40v6m8-6v6m8-6v6M2 16h6m-6 8h6m-6 8h6m32-16h6m-6 8h6m-6 8h6" />
        </>
      );
  }
}

function Entity({entity}: {entity: ScalEntity}) {
  return (
    <g className={entity.boundary ? styles.enclosure : styles.component}>
      <rect
        x={entity.x}
        y={entity.y}
        width={entity.width}
        height={entity.height}
        rx={entity.boundary ? 12 : 8}
      />
      <text x={entity.x + entity.width / 2} y={entity.y + 24} textAnchor="middle">
        {entity.lines.map((line, index) => (
          <tspan
            key={line}
            x={entity.x + entity.width / 2}
            dy={index ? 20 : 0}
            className={index === 0 ? styles.entityName : undefined}
          >
            {line}
          </tspan>
        ))}
      </text>
      {entity.icon && (
        <svg
          x={entity.x + entity.width / 2 - 24}
          y={entity.y + entity.height * 0.42}
          width="48"
          height="48"
          viewBox="0 0 48 48"
          className={styles.symbol}
        >
          <EntityIcon kind={entity.icon} />
        </svg>
      )}
    </g>
  );
}

function relationship(model: ScalModel, from: string, to: string, both?: boolean) {
  const name = (id: string) => model.entities.find((entity) => entity.id === id)!.name;
  return `${name(from)} ${both ? '↔' : '→'} ${name(to)}`;
}

function describeExchange(model: ScalModel, exchange: ScalExchange) {
  const route = relationship(model, exchange.from, exchange.to, exchange.both);
  return exchange.label ? `${route}: ${exchange.label}` : route;
}

function activationLineOffset(view: ScalView, index: number) {
  if (index === 0) return 0;
  return view === 'scal2' && index === 2 ? 42 : 20;
}

function Reference({model}: {model: ScalModel}) {
  function entities(parent?: string) {
    return model.entities
      .filter((entity) => entity.parent === parent)
      .map((entity) => (
        <section
          key={entity.id}
          aria-label={entity.name}
          className={entity.boundary ? styles.scope : styles.textNode}
        >
          <strong>{entity.name}</strong>
          {entity.id === 'tsp' && <p>Trustworthy system supporting server signing</p>}
          {entities(entity.id)}
        </section>
      ));
  }
  return (
    <section className={styles.reference} aria-label="Diagram text equivalent">
      <p>{model.explanation}</p>
      <h4>Components and environment boundaries</h4>
      <div className={styles.entityTree}>{entities()}</div>
      <h4>Directed exchanges</h4>
      <ul className={styles.exchanges}>
        {model.exchanges.map((exchange) => (
          <li key={`${exchange.from}-${exchange.to}-${exchange.label ?? ''}`}>
            {describeExchange(model, exchange)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ScalDrawing({view}: {view: ScalView}): React.JSX.Element {
  const model = scalModels[view];
  const id = useId().replaceAll(':', '');
  const arrow = `${id}-arrow`;
  const title = `${id}-title`;
  const description = `${id}-description`;
  const wideEntities = model.entities.filter((entity) => entity.id !== 'sic');
  const sic = model.entities.find((entity) => entity.id === 'sic');
  return (
    <svg
      className={styles.canvas}
      viewBox={`0 0 940 ${model.height}`}
      role="img"
      aria-labelledby={title}
      aria-describedby={description}
    >
      <title id={title}>{model.title}</title>
      <desc id={description}>
        {model.explanation}{' '}
        {model.exchanges.map((exchange) => `${describeExchange(model, exchange)}.`).join(' ')}
      </desc>
      <defs>
        <marker
          id={arrow}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M1 1 9 5 1 9" />
        </marker>
      </defs>
      {wideEntities.map((entity) => (
        <Entity key={entity.id} entity={entity} />
      ))}
      {model.exchanges
        .filter((exchange) => !exchange.activation)
        .map((exchange) => (
          <g
            key={`${exchange.from}-${exchange.to}-${exchange.label ?? ''}`}
            className={styles.exchange}
          >
            <path
              d={exchange.path}
              markerEnd={`url(#${arrow})`}
              markerStart={exchange.both ? `url(#${arrow})` : undefined}
            />
            {exchange.caption && (
              <text x={exchange.caption.x} y={exchange.caption.y} textAnchor="middle">
                {exchange.caption.lines.map((line, lineIndex) => (
                  <tspan key={line} x={exchange.caption!.x} dy={lineIndex ? 19 : 0}>
                    {line}
                  </tspan>
                ))}
              </text>
            )}
          </g>
        ))}
      <g className={styles.activation}>
        <rect
          x={model.band.x}
          y={model.band.y}
          width={model.band.width}
          height={model.band.height}
          rx="8"
        />
        <text
          x={model.band.x + model.band.width / 2 + (view === 'integration' ? 50 : 0)}
          y={model.band.y + 22}
          textAnchor="middle"
        >
          {model.band.lines.map((line, index) => (
            <tspan
              key={line}
              x={model.band.x + model.band.width / 2 + (view === 'integration' ? 50 : 0)}
              dy={activationLineOffset(view, index)}
            >
              {line}
            </tspan>
          ))}
        </text>
        {model.exchanges
          .filter((exchange) => exchange.activation)
          .map((exchange) => (
            <path
              key={exchange.path}
              d={exchange.path}
              markerStart={`url(#${arrow})`}
              markerEnd={`url(#${arrow})`}
            />
          ))}
      </g>
      {sic && <Entity entity={sic} />}
    </svg>
  );
}

export default function ScalArchitecture({view}: {view: ScalView}): React.JSX.Element {
  const model = scalModels[view];
  return (
    <figure className={styles.figure} aria-label={model.title}>
      <header className={styles.header}>
        <h3>{model.title}</h3>
        <p>{model.explanation}</p>
      </header>
      <div className={styles.wide}>
        <DiagramFigure label={model.title}>
          <ScalDrawing view={view} />
        </DiagramFigure>
        <details className={styles.details}>
          <summary>Read components, boundaries and directed exchanges</summary>
          <Reference model={model} />
        </details>
      </div>
      <figcaption className={styles.caption}>
        Arrows show exchange direction; double-headed arrows show exchanges in both directions.{' '}
        {view === 'scal1'
          ? 'The activation band connects the user interface to the SSA.'
          : 'The SAP band carries SAD and DTBS between the SIC and SAM.'}{' '}
        The band represents an exchange, not an additional environment boundary.
      </figcaption>
    </figure>
  );
}
