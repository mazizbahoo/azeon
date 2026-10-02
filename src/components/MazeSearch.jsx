import React, { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { Button, Figure, Playback, usePlayback } from './figure';

/* ── A maze as a binary tree of junctions ────────────────── */

const DEPTH = 4;
const COUNT = 2 ** (DEPTH + 1) - 1;
const FIRST_LEAF = 2 ** DEPTH - 1;
const depthOf = i => Math.floor(Math.log2(i + 1));
const parent = i => Math.floor((i - 1) / 2);

function pathTo(i) {
  const p = [i];
  while (i > 0) { i = parent(i); p.unshift(i); }
  return p;
}

function dfs(exit) {
  const order = [];
  const walk = i => i < COUNT && (order.push(i), i === exit || walk(2 * i + 1) || walk(2 * i + 2));
  walk(0);
  return order;
}

const W = 600;
const H = DEPTH * 34 + 40;
const pos = i => {
  const d = depthOf(i);
  return { x: ((i - (2 ** d - 1) + 0.5) / 2 ** d) * W, y: 16 + d * 34 };
};

const init = exit => ({ exit, order: dfs(exit), t: 0 });
const isDone = s => s.t >= s.order.length - 1;
const step = s => (isDone(s) ? s : { ...s, t: s.t + 1 });

function Tree({ label, visited, current, path, exit }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="img" aria-label={label}>
      {Array.from({ length: COUNT - 1 }, (_, k) => {
        const i = k + 1;
        const a = pos(parent(i));
        const b = pos(i);
        const onPath = path.has(i);
        const seen = visited(i);
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={onPath || seen ? 'var(--fig-accent)' : 'var(--fig-line-strong)'}
            strokeWidth={onPath ? 3 : seen ? 1.75 : 1.25} opacity={seen && !onPath && path.size ? 0.45 : 1}
            style={{ transition: 'stroke 0.15s' }} />
        );
      })}
      {Array.from({ length: COUNT }, (_, i) => {
        const { x, y } = pos(i);
        const lit = visited(i) || path.has(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={current(i) ? 6.5 : 4.5}
              fill={lit ? 'var(--fig-accent)' : 'var(--fig-bg)'}
              stroke={lit ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth="1.5" />
            {i === exit && <circle cx={x} cy={y} r={10} fill="none" stroke="var(--fig-ink)" strokeWidth="1.25" />}
          </g>
        );
      })}
    </svg>
  );
}

export default function MazeSearch() {
  const [s, set] = useState(() => init(FIRST_LEAF + 11));
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 420);
  const reset = exit => { stop(); set(init(exit)); };

  const detSeen = new Set(s.order.slice(0, s.t + 1));
  const detFound = isDone(s);
  const ndDepth = Math.min(s.t, DEPTH);
  const ndFound = ndDepth === DEPTH;
  const route = new Set(pathTo(s.exit));
  const none = new Set();

  const newMaze = () => {
    let e;
    do { e = FIRST_LEAF + Math.floor(Math.random() * (COUNT - FIRST_LEAF)); } while (e === s.exit);
    reset(e);
  };

  return (
    <Figure
      title="Searching a maze"
      tools={<Button icon={Shuffle} onClick={newMaze}>New maze</Button>}
      status={<>Deterministic: <b>{detFound ? s.order.length - 1 : s.t}</b> steps{detFound ? ', found' : ''} · Nondeterministic: <b>{ndDepth}</b> steps{ndFound ? ', found' : ''}</>}
      tone={detFound ? 'good' : undefined}
    >
      <div className="az-fig-pane">
        <div className="az-fig-pane__head">
          <span className="az-fig-label">Deterministic · one path at a time</span>
        </div>
        <div className="az-fig-well az-maze">
          <Tree label="Deterministic search" exit={s.exit}
            visited={i => detSeen.has(i)} current={i => i === s.order[s.t] && !detFound}
            path={detFound ? route : none} />
        </div>
      </div>
      <div className="az-fig-pane">
        <div className="az-fig-pane__head">
          <span className="az-fig-label">Nondeterministic · every path at once</span>
        </div>
        <div className="az-fig-well az-maze">
          <Tree label="Nondeterministic search" exit={s.exit}
            visited={i => depthOf(i) <= ndDepth} current={i => depthOf(i) === ndDepth && !ndFound}
            path={ndFound ? route : none} />
        </div>
      </div>

      <Playback
        onReset={() => reset(s.exit)}
        onBack={() => { stop(); set(p => ({ ...p, t: Math.max(0, p.t - 1) })); }}
        canBack={s.t > 0}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={toggle}
        done={detFound}
      />
    </Figure>
  );
}
