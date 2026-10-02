import React, { useCallback, useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   Figure kit. Every interactive figure is built from these.

   Design rules (keep them when adding a figure):
   - Neutral greys plus one accent. Accent means "active" or
     "selected". Red is reserved for "this is invalid".
   - A figure holds the visual, its controls and at most one
     short status line. Explanations belong in the post.
   Styling lives in src/css/components.css.
   ════════════════════════════════════════════════════════════ */

export function Figure({ title, tools, status, tone, children }) {
  return (
    <figure className="az-fig">
      <header className="az-fig__head">
        <span className="az-fig__title">{title}</span>
        {tools && <div className="az-fig__tools">{tools}</div>}
      </header>
      <div className="az-fig__body">{children}</div>
      {status != null && (
        <div className="az-fig__status" data-tone={tone} aria-live="polite">{status}</div>
      )}
    </figure>
  );
}

export function FigureLoading() {
  return <div className="az-fig az-fig--loading" aria-hidden="true" />;
}

export function Button({ icon: Icon, children, primary, pressed, label, ...props }) {
  return (
    <button
      type="button"
      className={'az-fig-btn' + (primary ? ' az-fig-btn--primary' : '') + (!children ? ' az-fig-btn--icon' : '')}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      {...props}
    >
      {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Mutually exclusive options in one pill track. */
export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="az-fig-seg" role="radiogroup" aria-label={label}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          className="az-fig-seg__item"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Reset / back / step / play transport. */
export function Playback({ onReset, onBack, canBack, onStep, playing, onTogglePlay, done }) {
  return (
    <div className="az-fig-transport">
      <Button icon={RotateCcw} label="Reset" onClick={onReset} />
      {onBack && <Button icon={StepBack} label="Step back" onClick={onBack} disabled={!canBack} />}
      <Button icon={StepForward} primary onClick={onStep} disabled={done}>Step</Button>
      <Button icon={playing ? Pause : Play} label={playing ? 'Pause' : 'Play'} onClick={onTogglePlay} disabled={done && !playing} />
    </div>
  );
}

/**
 * Runs `step` on an interval until `isDone(state)`.
 * `step` and `isDone` must be stable (module-level functions).
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

/** Keyboard + click handler props for an SVG <g> that acts as a button. */
export function svgButton(onActivate, label, pressed) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    'aria-pressed': pressed,
    className: 'az-fig-hit',
    onClick: onActivate,
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
    },
  };
}
