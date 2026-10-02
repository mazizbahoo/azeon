import React, { useState } from 'react';
import { Button, Figure, svgButton } from './figure';

/* ── 3-SAT → Clique ──────────────────────────────────────── */

// φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃) ∧ (x₁ ∨ x₂ ∨ x₃)
const CLAUSES = [
  [{ v: 1, neg: false }, { v: 2, neg: true }, { v: 3, neg: false }],
  [{ v: 1, neg: true }, { v: 2, neg: false }, { v: 3, neg: true }],
  [{ v: 1, neg: false }, { v: 2, neg: false }, { v: 3, neg: false }],
];
const EXAMPLE = [0, 4, 6];

const SUB = ['', '₁', '₂', '₃'];
const lit = ({ v, neg }) => `${neg ? '¬' : ''}x${SUB[v]}`;

// Nodes on one circle, three arcs of three: every edge is a chord.
const W = 560;
const H = 400;
const CX = 280;
const CY = 205;
const RING = 148;
const R = 21;
const ARCS = [-90, 30, 150];
const polar = (deg, r) => ({ x: CX + r * Math.cos((deg * Math.PI) / 180), y: CY + r * Math.sin((deg * Math.PI) / 180) });
const LABELS = [{ x: CX, y: 22 }, { x: 430, y: 384 }, { x: 130, y: 384 }];

const NODES = CLAUSES.flatMap((clause, c) =>
  clause.map((l, i) => ({ id: c * 3 + i, clause: c, lit: l, ...polar(ARCS[c] + (i - 1) * 24, RING) })),
);

const contradicts = (a, b) => a.v === b.v && a.neg !== b.neg;
const EDGES = [];
NODES.forEach((a, i) => NODES.slice(i + 1).forEach(b => {
  if (a.clause !== b.clause && !contradicts(a.lit, b.lit)) EDGES.push([a.id, b.id]);
}));

function check(sel) {
  const nodes = sel.map(id => NODES[id]);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [a, b] = [nodes[i], nodes[j]];
      if (a.clause === b.clause) return `${lit(a.lit)} and ${lit(b.lit)} are in the same clause`;
      if (contradicts(a.lit, b.lit)) return `${lit(a.lit)} and ${lit(b.lit)} contradict`;
    }
  }
  return null;
}

const assignment = nodes => [1, 2, 3]
  .map(v => {
    const n = nodes.find(m => m.lit.v === v);
    return `x${SUB[v]}=${n ? (n.lit.neg ? 'F' : 'T') : 'any'}`;
  })
  .join(', ');

export default function CliqueReduction() {
  const [sel, setSel] = useState([]);
  const [hover, setHover] = useState(null);
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  const problem = check(sel);
  const nodes = sel.map(id => NODES[id]);
  const complete = !problem && new Set(nodes.map(n => n.clause)).size === 3;
  const near = hover === null ? [] : EDGES.filter(e => e.includes(hover)).flat();

  const edgeProps = (a, b) => {
    if (sel.includes(a) && sel.includes(b)) {
      return { stroke: problem ? 'var(--fig-bad)' : 'var(--fig-accent)', strokeWidth: 2.5 };
    }
    if (hover !== null && (a === hover || b === hover)) return { stroke: 'var(--fig-ink)', strokeWidth: 1.25, opacity: 0.7 };
    return { stroke: 'var(--fig-line-strong)', strokeWidth: 1, opacity: hover === null ? 1 : 0.5 };
  };

  let status = <>Click one literal from each clause</>;
  let tone;
  if (problem) { tone = 'bad'; status = <><b>Not a clique</b>: {problem}</>; }
  else if (complete) { tone = 'good'; status = <><b>3-clique</b> · satisfying assignment {assignment(nodes)}</>; }
  else if (sel.length) status = <>Clique of size <b>{sel.length}</b> so far</>;

  return (
    <Figure
      title="3-SAT to Clique"
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
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label="One node per literal; edges join compatible literals in different clauses">
          {EDGES.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
              {...edgeProps(a, b)} style={{ transition: 'all 0.15s ease' }} />
          ))}
          {LABELS.map((p, c) => (
            <text key={c} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" letterSpacing="0.12em" fill="var(--fig-faint)">
              CLAUSE {c + 1}
            </text>
          ))}
          {NODES.map(n => {
            const on = sel.includes(n.id);
            const c = on ? (problem ? 'var(--fig-bad)' : 'var(--fig-accent)') : null;
            const faded = hover !== null && hover !== n.id && !near.includes(n.id) && !on;
            return (
              <g key={n.id} {...svgButton(() => toggle(n.id), `${lit(n.lit)}, clause ${n.clause + 1}`, on)}
                opacity={faded ? 0.35 : 1}
                onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}>
                <circle cx={n.x} cy={n.y} r={R} fill="var(--fig-bg)" />
                <circle className="az-fig-node" cx={n.x} cy={n.y} r={R}
                  fill={c ?? 'var(--fig-bg)'} fillOpacity={c ? 0.16 : 1}
                  stroke={c ?? 'var(--fig-line-strong)'} strokeWidth={on ? 2 : 1.25} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
                  fill={c ?? 'var(--fig-ink)'}>{lit(n.lit)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
