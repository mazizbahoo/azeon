import React, { useState } from 'react';
import { Figure, svgButton } from './figure';

/* ── The complexity zoo as a containment diagram ────────────
   A line from a lower class to a higher one means "proven to be
   contained in". Missing lines mean "relationship unknown", not
   "different". Only P ≠ EXP is a proven strict separation here. */

const W = 480;
const H = 370;
const CLASSES = {
  EXP: { x: 240, y: 40, text: 'Solvable in exponential time. Proven to be strictly bigger than P.' },
  PSPACE: { x: 240, y: 125, text: 'Solvable with a polynomial amount of memory, however long it takes.' },
  NP: { x: 95, y: 215, text: 'Yes-answers have short certificates that can be checked quickly.' },
  coNP: { x: 240, y: 215, text: 'No-answers have short certificates that can be checked quickly.' },
  BQP: { x: 385, y: 215, text: 'Solvable quickly by a quantum computer, with a small chance of error.' },
  BPP: { x: 385, y: 290, text: 'Solvable quickly by an algorithm that flips coins, with a small chance of error.' },
  P: { x: 240, y: 330, text: 'Solvable quickly by an ordinary deterministic algorithm.' },
};
// [smaller, bigger]: proven containments
const EDGES = [
  ['P', 'NP'], ['P', 'coNP'], ['P', 'BPP'], ['BPP', 'BQP'],
  ['NP', 'PSPACE'], ['coNP', 'PSPACE'], ['BQP', 'PSPACE'], ['PSPACE', 'EXP'],
];

const below = name => {
  const out = new Set();
  const visit = n => EDGES.forEach(([a, b]) => { if (b === n && !out.has(a)) { out.add(a); visit(a); } });
  visit(name);
  return out;
};

export default function ComplexityZoo({ focus = 'NP' }) {
  const [sel, setSel] = useState(focus);
  const inside = below(sel);
  const list = Object.keys(CLASSES).filter(n => inside.has(n));

  return (
    <Figure
      title="The complexity zoo"
      status={<><b>{sel}</b>: {CLASSES[sel].text} {list.length > 0 && <>Proven to contain {list.join(', ')}.</>}</>}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label="Known containments between complexity classes">
          {EDGES.map(([a, b]) => {
            const on = (a === sel || inside.has(a)) && (b === sel || inside.has(b));
            return (
              <line key={`${a}-${b}`} x1={CLASSES[a].x} y1={CLASSES[a].y} x2={CLASSES[b].x} y2={CLASSES[b].y}
                stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on ? 2 : 1.25} />
            );
          })}
          {Object.entries(CLASSES).map(([name, c]) => {
            const on = name === sel;
            const inner = inside.has(name);
            const w = Math.max(56, name.length * 11 + 26);
            return (
              <g key={name} {...svgButton(() => setSel(name), `Class ${name}`, on)}>
                <rect className="az-fig-node" x={c.x - w / 2} y={c.y - 17} width={w} height={34} rx={9}
                  fill={on ? 'var(--fig-accent)' : 'var(--fig-bg)'} fillOpacity={on ? 1 : 1}
                  stroke={on || inner ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on || inner ? 1.75 : 1.25} />
                <text x={c.x} y={c.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13.5" fontWeight="600"
                  fill={on ? '#fff' : inner ? 'var(--fig-accent)' : 'var(--fig-ink)'}>{name}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
