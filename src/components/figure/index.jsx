import React, { useCallback, useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   Figure kit — the building blocks every interactive figure in
   src/components is assembled from. Styling lives in
   src/css/components.css; nothing here sets colours or spacing.
   ════════════════════════════════════════════════════════════ */

const ICON = { size: 15, strokeWidth: 2, 'aria-hidden': true };

/* ── Shell ────────────────────────────────────────────────── */

export function Figure({ icon: Icon, kicker = 'Interactive', title, tools, caption, accent, children }) {
  return (
    <figure className="az-viz" style={accent ? { '--viz-accent': accent } : undefined}>
      <header className="az-viz__head">
        <div className="az-viz__title">
          {Icon && (
            <span className="az-viz__icon">
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          )}
          <div className="az-viz__titles">
            <span className="az-viz__kicker">{kicker}</span>
            <span className="az-viz__name">{title}</span>
          </div>
        </div>
        {tools && <div className="az-viz__tools">{tools}</div>}
      </header>
      <div className="az-viz__body">{children}</div>
      {caption && <figcaption className="az-viz__foot">{caption}</figcaption>}
    </figure>
  );
}

export function FigureLoading({ label = 'Loading figure' }) {
  return <div className="az-viz__loading">{label}</div>;
}

/* ── Controls ─────────────────────────────────────────────── */

export function Button({ icon: Icon, children, variant, pressed, className = '', style, ...props }) {
  const cls = ['az-viz-btn'];
  if (variant === 'solid') cls.push('az-viz-btn--solid');
  if (pressed) cls.push('az-viz-btn--on');
  if (Icon && !children) cls.push('az-viz-btn--icon');
  if (className) cls.push(className);
  return (
    <button
      type="button"
      className={cls.join(' ')}
      aria-pressed={pressed === undefined ? undefined : pressed}
      style={style}
      {...props}
    >
      {Icon && <Icon {...ICON} />}
      {children}
    </button>
  );
}

/** A row of mutually exclusive options (radio-group semantics). */
export function Segmented({ label, options, value, onChange, grow }) {
  return (
    <div className={'az-viz-segmented' + (grow ? ' az-viz-segmented--grow' : '')} role="radiogroup" aria-label={label}>
      {options.map(opt => {
        const on = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={on}
            className={'az-viz-segmented__item' + (on ? ' az-viz-segmented__item--on' : '')}
            style={opt.accent ? { '--btn-accent': opt.accent } : undefined}
            onClick={() => onChange(opt.value)}
          >
            {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Reset / back / step / play — the standard transport for step-through figures. */
export function Playback({ onReset, onBack, onStep, playing, onTogglePlay, canBack, done, extra }) {
  return (
    <div className="az-viz-controls">
      <Button icon={RotateCcw} onClick={onReset} aria-label="Reset">Reset</Button>
      {onBack && <Button icon={StepBack} onClick={onBack} disabled={!canBack} aria-label="Step back">Back</Button>}
      <Button icon={StepForward} variant="solid" onClick={onStep} disabled={done}>Step</Button>
      <Button icon={playing ? Pause : Play} onClick={onTogglePlay} disabled={done && !playing}>
        {playing ? 'Pause' : 'Play'}
      </Button>
      {extra}
    </div>
  );
}

/**
 * Drives `step` on an interval until `isDone(state)`.
 * `step` and `isDone` must be stable (module-level functions).
 * Returns [playing, toggle, stop].
 */
export function usePlayback(state, setState, step, isDone, interval = 650) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setState(prev => (isDone(prev) ? prev : step(prev))), interval);
    return () => clearInterval(id);
  }, [playing, setState, step, isDone, interval]);

  useEffect(() => {
    if (playing && isDone(state)) setPlaying(false);
  }, [playing, state, isDone]);

  const toggle = useCallback(() => setPlaying(p => !p), []);
  const stop = useCallback(() => setPlaying(false), []);

  return [playing, toggle, stop];
}

/* ── Readouts ─────────────────────────────────────────────── */

export function Stat({ value, label, tone }) {
  return (
    <div className={'az-viz-stat' + (tone ? ` az-viz-stat--${tone}` : '')}>
      <div className="az-viz-stat__value">{value}</div>
      <div className="az-viz-stat__label">{label}</div>
    </div>
  );
}

export function Stats({ children, cols }) {
  return (
    <div className="az-viz-stats" style={cols ? { '--cols': cols } : undefined}>
      {children}
    </div>
  );
}

/** Live-region commentary under a figure. tone: 'ok' | 'no' | undefined. */
export function Note({ tone, accent, children }) {
  return (
    <div
      className={'az-viz-note' + (tone ? ` az-viz-note--${tone}` : '')}
      style={accent ? { '--note-accent': accent } : undefined}
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className="az-viz-legend">
      {items.map(({ color, label, shape = 'dot', icon: Icon }) => (
        <span className="az-viz-legend__item" key={label} style={{ '--dot': color }}>
          {Icon
            ? <Icon size={13} strokeWidth={2} color={color} aria-hidden="true" />
            : <span className={`az-viz-legend__${shape}`} />}
          {label}
        </span>
      ))}
    </div>
  );
}

export function Stage({ label, children, aside }) {
  return (
    <div className="az-viz__stage">
      {label && (
        <div className="az-viz__stage-label">
          <span>{label}</span>
          {aside && <span className="az-viz__stage-aside">{aside}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
