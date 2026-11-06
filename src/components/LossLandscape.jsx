import React, { useMemo, useState } from 'react';
import { Button, Figure, Playback, usePlayback } from './figure';

/* ── Going downhill on a bumpy landscape ────────────────────
   Click anywhere to drop a ball; each step moves it a little
   way downhill (gradient descent). It stops in whichever
   valley it started above, which may not be the deepest. */

const XMIN = 0;
const XMAX = 10;
const f = x => 0.12 * (x - 6.2) ** 2 + Math.sin(1.7 * x) + 0.45 * Math.sin(4.3 * x) + 2.2;
const df = x => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4;

const SAMPLES = Array.from({ length: 401 }, (_, i) => XMIN + ((XMAX - XMIN) * i) / 400);
const GLOBAL = SAMPLES.reduce((b, x) => (f(x) < f(b) ? x : b), SAMPLES[0]);
const YMAX = Math.max(...SAMPLES.map(f));
const YMIN = Math.min(...SAMPLES.map(f));

const W = 560;
const H = 240;
const PAD = 18;
const sx = x => PAD + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD);
const sy = y => PAD + (1 - (y - YMIN) / (YMAX - YMIN)) * (H - 2 * PAD);
const PATH = SAMPLES.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`).join(' ');

const RATE = 0.06;
const step = s => {
  const g = df(s.x);
  const x = Math.min(XMAX, Math.max(XMIN, s.x - RATE * g));
  return { x, trail: [...s.trail, x], done: Math.abs(x - s.x) < 1e-3 || s.trail.length > 300 };
};
const isDone = s => s.done;

export default function LossLandscape({ restarts = false }) {
  const [s, set] = useState({ x: 1.2, trail: [1.2], done: false });
  const [best, setBest] = useState(null);
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 60);

  const drop = x => { stop(); set({ x, trail: [x], done: false }); };
  const onClick = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    drop(Math.min(XMAX, Math.max(XMIN, XMIN + ((px - PAD) / (W - 2 * PAD)) * (XMAX - XMIN))));
  };

  // Random restarts: run descent from many starting points, keep the lowest.
  const runRestarts = () => {
    stop();
    let bestX = null;
    const tries = [];
    for (let k = 0; k < 12; k++) {
      let st = { x: XMIN + Math.random() * (XMAX - XMIN), trail: [], done: false };
      st.trail = [st.x];
      while (!st.done) st = step(st);
      tries.push(st.x);
      if (bestX === null || f(st.x) < f(bestX)) bestX = st.x;
    }
    setBest({ x: bestX, tries });
    set({ x: bestX, trail: [bestX], done: true });
  };

  const atGlobal = Math.abs(s.x - GLOBAL) < 0.15;
  const status = s.done
    ? (atGlobal ? <>Settled at height <b>{f(s.x).toFixed(2)}</b>: the <b>deepest valley</b>.</> : <>Stuck in a valley at height <b>{f(s.x).toFixed(2)}</b>. The deepest point is {f(GLOBAL).toFixed(2)}.</>)
    : <>Click the landscape to drop a ball, then press <b>Play</b> to roll downhill</>;
  const tone = s.done ? (atGlobal ? 'good' : 'bad') : undefined;
  const trailPath = useMemo(() => s.trail.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`).join(' '), [s.trail]);

  return (
    <Figure
      title="Rolling downhill"
      tools={restarts ? <Button onClick={runRestarts}>12 random restarts</Button> : null}
      status={status}
      tone={tone}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" onClick={onClick} style={{ cursor: 'crosshair' }}
          role="img" aria-label="A curve with several valleys; click to choose a starting point">
          <path d={PATH} fill="none" stroke="var(--fig-line-strong)" strokeWidth={2} />
          <line x1={sx(GLOBAL)} x2={sx(GLOBAL)} y1={sy(f(GLOBAL)) + 8} y2={H - 4} stroke="var(--fig-muted)" strokeDasharray="3 3" />
          <text x={sx(GLOBAL)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--fig-muted)">deepest</text>
          {best && best.tries.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(f(x))} r={3.5} fill="var(--fig-muted)" opacity={0.6} />)}
          <path d={trailPath} fill="none" stroke="var(--fig-accent)" strokeWidth={2} opacity={0.5} />
          <circle cx={sx(s.x)} cy={sy(f(s.x)) - 7} r={7} fill="var(--fig-accent)" />
        </svg>
      </div>
      <Playback onReset={() => { setBest(null); drop(s.trail[0]); }} onStep={() => set(step)} playing={playing} onTogglePlay={toggle} done={s.done} />
    </Figure>
  );
}
