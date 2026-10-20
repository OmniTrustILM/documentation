import React, {useId} from 'react';
import {trustAreas, type TrustArea} from './content';
import useIllustrationMotion from './useIllustrationMotion';
import styles from './TrustNetwork.module.css';

const branches = [
  'M133 126 C170 120 204 160 221 185 C241 215 268 220 287 254',
  'M424 146 C380 159 366 189 353 212 C339 236 311 239 287 254',
  'M427 372 C382 380 352 357 340 319 C331 290 309 283 287 254',
  'M133 379 C180 382 192 334 219 318 C243 302 273 291 287 254',
];

export default function TrustNetwork({
  selected,
  onSelect,
}: {
  selected: TrustArea;
  onSelect: (area: TrustArea) => void;
}) {
  const fillId = useId();
  const motion = useIllustrationMotion();
  return (
    <div className={styles.illustration}>
      <div
        ref={motion.element}
        className={styles.stage}
        data-motion={motion.playing ? 'running' : 'paused'}
      >
        <svg className={styles.organism} viewBox="0 0 580 520" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id={fillId}>
              <stop offset="0" stopColor="var(--ilm-accent-soft)" />
              <stop offset="1" stopColor="var(--ilm-canvas)" />
            </radialGradient>
          </defs>
          <g className={styles.membrane}>
            <path
              fill={`url(#${fillId})`}
              d="M275 61 C339 23 420 52 427 114 C433 160 505 173 511 237 C519 309 464 325 453 379 C437 449 374 484 315 450 C264 420 233 478 167 452 C108 428 122 366 77 331 C24 290 47 225 95 196 C145 165 130 100 184 78 C215 65 244 81 275 61Z"
            />
          </g>
          <path
            className={styles.filaments}
            d="M287 254 C274 222 238 220 220 191 C201 163 193 108 147 100 M220 191 C171 192 165 151 107 159 M221 185 C256 166 262 116 236 99 M287 254 C313 228 346 236 364 201 C379 169 393 120 446 121 M364 201 C405 208 447 196 469 226 M353 212 C334 171 339 143 367 111 M287 254 C310 286 339 284 350 323 C365 372 391 412 438 397 M350 323 C390 318 449 326 474 357 M340 319 C312 341 323 395 344 421 M287 254 C263 280 239 294 212 315 C176 342 168 401 118 400 M212 315 C169 300 129 327 105 355 M219 318 C240 350 234 390 209 412"
          />
          {branches.map((path, index) => (
            <g
              key={path}
              className={selected.id === trustAreas[index].id ? styles.activeBranch : styles.branch}
            >
              <path d={path} />
              <path
                d={path}
                className={styles.signal}
                style={{animationDelay: `${index * -1.5}s`}}
              />
            </g>
          ))}
          <path
            className={styles.nucleusContour}
            d="M260 175 C302 152 345 184 353 222 C365 263 347 311 312 330 C275 349 226 324 214 287 C200 244 218 196 260 175Z"
          />
          <path
            className={styles.nucleus}
            d="M267 190 C296 174 329 194 336 224 C345 253 337 294 309 312 C281 330 239 313 230 284 C219 248 234 208 267 190Z"
          />
          <text x="284" y="258" textAnchor="middle" className={styles.coreLabel}>
            ILM
          </text>
          <text x="284" y="281" textAnchor="middle" className={styles.coreCaption}>
            Connected trust
          </text>
        </svg>
        <fieldset className={styles.domains}>
          <legend className={styles.legend}>Explore trust areas</legend>
          {trustAreas.map((area, index) => (
            <button
              key={area.id}
              type="button"
              className={styles.domain}
              data-domain={area.id}
              aria-pressed={area.id === selected.id}
              aria-controls="trust-area-detail"
              onClick={() => onSelect(area)}
            >
              <span className={styles.domainNumber} aria-hidden="true">
                0{index + 1}
              </span>
              <span>
                {area.label}
                <small>{area.role}</small>
              </span>
            </button>
          ))}
        </fieldset>
      </div>
      <div className={styles.caption}>
        <span>Explore a trust lifecycle</span>
        <button type="button" onClick={motion.toggle}>
          <span aria-hidden="true">{motion.enabled ? 'Ⅱ' : '▷'}</span>
          {motion.enabled ? 'Pause animation' : 'Play animation'}
        </button>
      </div>
    </div>
  );
}
