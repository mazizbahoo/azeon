import React, { useState } from 'react';
import { Button, Figure, svgButton } from './figure';

/* ── 3-SAT → Independent Set ────────────────────────────────
   One triangle per clause. Triangle edges stop you taking two
   literals from one clause; conflict edges join x and ¬x. */

// Same formula as the Clique post, so the two reductions can be compared.
// φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃) ∧ (x₁ ∨ x₂ ∨ x₃)
const CLAUSES = [
  [{ v: 1, neg: false }, { v: 2, neg: true }, { v: 3, neg: false }],
  [{ v: 1, neg: true }, { v: 2, neg: false }, { v: 3, neg: true }],
  [{ v: 1, neg: false }, { v: 2, neg: false }, { v: 3, neg: false }],
];
const EXAMPLE = [0, 4, 6];

const SUB = ['', '₁', '₂', '₃'];
const lit = ({ v, neg }) => `${neg ? '¬' : ''}x${SUB[v]}`;

const W = 560;
const H = 390;
const CX = 280;
const CY = 200;
const R = 21;
const CENTRES = [-90, 30, 150].map(d => ({
  x: CX + 128 * Math.cos((d * Math.PI) / 180),
  y: CY + 128 * Math.sin((d * Math.PI) / 180),
  d,
}));
const corner = (c, i) => {
  const a = ((c.d + 180 + (i - 1) * 120) * Math.PI) / 180;
  return { x: c.x + 46 * Math.cos(a), y: c.y + 46 * Math.sin(a) };
};

const NODES = CLAUSES.flatMap((clause, c) =>
  clause.map((l, i) => ({ id: c * 3 + i, clause: c, lit: l, ...corner(CENTRES[c], i) })),
);

const contradicts = (a, b) => a.v === b.v && a.neg !== b.neg;
const TRIANGLE = [];
const CONFLICT = [];
NODES.forEach((a, i) => NODES.slice(i + 1).forEach(b => {
  if (a.clause === b.clause) TRIANGLE.push([a.id, b.id]);
  else if (contradicts(a.lit, b.lit)) CONFLICT.push([a.id, b.id]);
}));

const assignment = nodes => [1, 2, 3]
  .map(v => {
    const n = nodes.find(m => m.lit.v === v);
    return `x${SUB[v]}=${n ? (n.lit.neg ? 'F' : 'T') : 'any'}`;
  })
  .join(', ');

export default function IndependentSetSAT() {
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  const both = ([a, b]) => sel.includes(a) && sel.includes(b);
  const badTri = TRIANGLE.filter(both);
  const badCon = CONFLICT.filter(both);
  const bad = badTri.length + badCon.length > 0;
  const nodes = sel.map(id => NODES[id]);

  let status = <>Pick one literal from each triangle, with no edge between any two picks</>;
  let tone;
  if (badTri.length) {
    tone = 'bad';
    const [a, b] = badTri[0].map(id => NODES[id]);
    status = <><b>Not independent</b>: {lit(a.lit)} and {lit(b.lit)} sit in the same clause</>;
  } else if (badCon.length) {
    tone = 'bad';
    const [a, b] = badCon[0].map(id => NODES[id]);
    status = <><b>Not independent</b>: {lit(a.lit)} and {lit(b.lit)} contradict</>;
  } else if (sel.length === 3) {
    tone = 'good';
    status = <><b>Independent set of size 3</b> · satisfying assignment {assignment(nodes)}</>;
  } else if (sel.length) {
    status = <>Independent set of size <b>{sel.length}</b> so far</>;
  }

  const edge = (pair, conflict) => {
    const on = both(pair);
    return {
      stroke: on ? 'var(--fig-bad)' : 'var(--fig-line-strong)',
      strokeWidth: on ? 2.5 : conflict ? 1.25 : 1.5,
      strokeDasharray: conflict ? '5 5' : undefined,
    };
  };

  return (
    <Figure
      title="3-SAT to Independent Set"
      tools={
        <>
          <Button onClick={() => setSel(EXAMPLE)}>Example</Button>
          <Button onClick={() => setSel([])} disabled={!sel.length}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-formula">
        φ = {CLAUSES.map(c => `(${c.map(lit).join(' ∨ ')})`).join(' ∧ ')}
      </div>
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group"
          aria-label="One triangle per clause; dashed edges join contradictory literals">
          {CONFLICT.map(p => (
            <line key={p.join('-')} x1={NODES[p[0]].x} y1={NODES[p[0]].y} x2={NODES[p[1]].x} y2={NODES[p[1]].y}
              {...edge(p, true)} />
          ))}
          {TRIANGLE.map(p => (
            <line key={p.join('-')} x1={NODES[p[0]].x} y1={NODES[p[0]].y} x2={NODES[p[1]].x} y2={NODES[p[1]].y}
              {...edge(p, false)} />
          ))}
          {NODES.map(n => {
            const on = sel.includes(n.id);
            const c = on ? (bad ? 'var(--fig-bad)' : 'var(--fig-accent)') : null;
            return (
              <g key={n.id} {...svgButton(() => toggle(n.id), `${lit(n.lit)}, clause ${n.clause + 1}`, on)}>
                <circle cx={n.x} cy={n.y} r={R} fill="var(--fig-bg)" />
                <circle className="az-fig-node" cx={n.x} cy={n.y} r={R}
                  fill={c ?? 'var(--fig-bg)'} fillOpacity={c ? 0.16 : 1}
                  stroke={c ?? 'var(--fig-line-strong)'} strokeWidth={on ? 2 : 1.25} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
                  fill={c ?? 'var(--fig-ink)'}>{lit(n.lit)}</text>
              </g>
            );
          })}
          {CENTRES.map((c, i) => (
            <text key={i} x={c.x} y={c.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10"
              letterSpacing="0.1em" fill="var(--fig-muted)">C{i + 1}</text>
          ))}
        </svg>
      </div>
    </Figure>
  );
}
