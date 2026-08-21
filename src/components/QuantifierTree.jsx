import React, { useState } from 'react';
import { Figure, Playback, usePlayback } from './figure';

/* ── Evaluating ∃x ∀y ∃z φ as a game tree ───────────────────
   Depth-first evaluation: ∃ is an OR over its two children,
   ∀ is an AND. Only the current path is held in memory. */

// φ = (x ∨ y) ∧ (y ∨ z) ∧ (¬y ∨ ¬z)
const phi = (x, y, z) => (x || y) && (y || z) && (!y || !z);
const QUANT = ['∃x', '∀y', '∃z'];
const VARS = ['x', 'y', 'z'];

// Heap-numbered binary tree: node 1 is the root, children 2k (true) and 2k+1 (false).
const DEPTH = 3;
const LEAF0 = 2 ** DEPTH;
const level = k => Math.floor(Math.log2(k));
const bits = k => {
  const out = [];
  for (let d = level(k) - 1; d >= 0; d--) out.push(((k >> d) & 1) === 0);
  return out;
};

const ORDER = [];
(function post(k) {
  if (k < LEAF0) { post(2 * k); post(2 * k + 1); }
  ORDER.push(k);
}(1));

function value(k, vals) {
  if (k >= LEAF0) return phi(...bits(k));
  const a = vals[2 * k];
  const b = vals[2 * k + 1];
  return level(k) % 2 === 0 ? a || b : a && b; // ∃ at depths 0 and 2, ∀ at depth 1
}

const init = () => ({ i: 0, vals: {} });
const step = s => {
  const k = ORDER[s.i];
  return { i: s.i + 1, vals: { ...s.vals, [k]: value(k, s.vals) } };
};
const isDone = s => s.i >= ORDER.length;

const W = 540;
const H = 300;
const pos = k => {
  const d = level(k);
  const idx = k - 2 ** d;
  const slots = 2 ** d;
  return { x: ((idx + 0.5) / slots) * (W - 20) + 10, y: 34 + d * 78 };
};
const tf = b => (b ? 'T' : 'F');

export default function QuantifierTree() {
  const [s, set] = useState(init);
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 700);

  const current = s.i > 0 ? ORDER[s.i - 1] : null;
  const path = new Set();
  for (let k = current; k; k = Math.floor(k / 2)) path.add(k);
  const memory = current ? level(current) + 1 : 0;
  const leaves = Object.keys(s.vals).filter(k => +k >= LEAF0).length;

  const root = s.vals[1];
  let status = <>Press <b>Step</b> to evaluate the tree one node at a time, left to right</>;
  if (isDone(s)) status = <>The formula is <b>{root ? 'true' : 'false'}</b>. All {LEAF0} leaves checked, but never more than {DEPTH + 1} nodes in memory at once.</>;
  else if (current) status = <>Nodes held in memory: <b>{memory}</b> · leaves checked: {leaves} of {LEAF0}</>;

  return (
    <Figure title="∃x ∀y ∃z φ as a game" status={status} tone={isDone(s) ? (root ? 'good' : 'bad') : undefined}>
      <div className="az-fig-formula">φ = (x ∨ y) ∧ (y ∨ z) ∧ (¬y ∨ ¬z)</div>
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="img" aria-label="Game tree for the quantified formula">
          {ORDER.filter(k => k > 1).map(k => {
            const a = pos(Math.floor(k / 2));
            const b = pos(k);
            const on = path.has(k);
            return (
              <g key={`e${k}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on ? 2.25 : 1.25} />
                <text x={(a.x + b.x) / 2 + (k % 2 ? 9 : -9)} y={(a.y + b.y) / 2} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fill="var(--fig-muted)">{VARS[level(k) - 1]}={tf(k % 2 === 0)}</text>
              </g>
            );
          })}
          {ORDER.map(k => {
            const p = pos(k);
            const v = s.vals[k];
            const known = v !== undefined;
            const on = path.has(k);
            const leaf = k >= LEAF0;
            return (
              <g key={k}>
                <circle cx={p.x} cy={p.y} r={leaf ? 14 : 18} fill="var(--fig-bg)"
                  stroke={on ? 'var(--fig-accent)' : known ? (v ? 'var(--fig-ink)' : 'var(--fig-bad)') : 'var(--fig-line-strong)'}
                  strokeWidth={on ? 2.25 : 1.25} />
                <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={leaf ? 12 : 11.5} fontWeight={known ? 600 : 400}
                  fill={known ? (v ? 'var(--fig-ink)' : 'var(--fig-bad)') : 'var(--fig-muted)'}>
                  {known ? tf(v) : leaf ? '·' : QUANT[level(k)]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <Playback onReset={() => { stop(); set(init()); }} onStep={() => set(step)} playing={playing} onTogglePlay={toggle} done={isDone(s)} />
    </Figure>
  );
}
