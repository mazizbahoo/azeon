import React, { useState } from 'react';
import { Eraser, Sparkles, Waypoints } from 'lucide-react';
import { Button, Figure, Legend, Note } from './figure';

/* ── Formula ─────────────────────────────────────────────── */

// φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃) ∧ (x₁ ∨ x₂ ∨ x₃)
const CLAUSES = [
  [{ v: 1, neg: false }, { v: 2, neg: true }, { v: 3, neg: false }],
  [{ v: 1, neg: true }, { v: 2, neg: false }, { v: 3, neg: true }],
  [{ v: 1, neg: false }, { v: 2, neg: false }, { v: 3, neg: false }],
];

const SUB = ['', '₁', '₂', '₃'];
const lit = ({ v, neg }) => `${neg ? '¬' : ''}x${SUB[v]}`;

const COLORS = ['var(--az-c3)', 'var(--az-c5)', 'var(--az-c2)'];
const OK = 'var(--az-ok)';
const EXAMPLE = [0, 4, 6]; // x₁, x₂, x₃ all true

/* ── Graph ───────────────────────────────────────────────── */

const W = 600;
const H = 420;
const CX = 300;
const CY = 218;
const RING = 150;
const R = 22;
// Nodes sit on one circle, three arcs of three (one arc per clause), so every
// edge is a chord and never passes through another node.
const ARC_CENTRES = [-90, 30, 150];
const SPREAD = 24;
const polar = (deg, r) => ({ x: CX + r * Math.cos((deg * Math.PI) / 180), y: CY + r * Math.sin((deg * Math.PI) / 180) });
// Clause labels: above the top arc, below the two lower arcs.
const GROUPS = [{ x: CX, y: 22 }, { x: 440, y: 400 }, { x: 160, y: 400 }];

const NODES = CLAUSES.flatMap((clause, c) =>
  clause.map((l, i) => ({
    id: c * 3 + i,
    clause: c,
    lit: l,
    ...polar(ARC_CENTRES[c] + (i - 1) * SPREAD, RING),
  })),
);

const contradicts = (a, b) => a.v === b.v && a.neg !== b.neg;
const joined = (a, b) => a.clause !== b.clause && !contradicts(a.lit, b.lit);

const EDGES = [];
NODES.forEach((a, i) => NODES.slice(i + 1).forEach(b => { if (joined(a, b)) EDGES.push([a.id, b.id]); }));

const neighbours = id => EDGES.filter(e => e.includes(id)).map(([a, b]) => (a === id ? b : a));

/* ── Selection analysis ──────────────────────────────────── */

function analyse(sel) {
  const nodes = sel.map(id => NODES[id]);
  const problems = [];
  nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
    if (a.clause === b.clause) problems.push(`${lit(a.lit)} and ${lit(b.lit)} are in the same clause`);
    else if (contradicts(a.lit, b.lit)) problems.push(`${lit(a.lit)} and ${lit(b.lit)} contradict each other`);
  }));
  const clique = problems.length === 0;
  const complete = clique && new Set(nodes.map(n => n.clause)).size === 3;
  return { problems, clique, complete, nodes };
}

function assignment(nodes) {
  return [1, 2, 3].map(v => {
    const hit = nodes.find(n => n.lit.v === v);
    return `x${SUB[v]} = ${hit ? (hit.lit.neg ? 'F' : 'T') : 'either'}`;
  }).join(', ');
}

/* ── Component ───────────────────────────────────────────── */

export default function CliqueReduction() {
  const [selected, setSelected] = useState([]);
  const [hovered, setHovered] = useState(null);

  const toggle = id => setSelected(sel => (sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]));
  const { problems, clique, complete, nodes } = analyse(selected);

  const focus = hovered;
  const near = focus === null ? [] : neighbours(focus);
  const inSel = id => selected.includes(id);

  const edgeStyle = (a, b) => {
    if (inSel(a) && inSel(b)) return { stroke: clique ? OK : 'var(--az-no)', strokeWidth: 2.75, opacity: 1 };
    if (focus !== null) {
      return a === focus || b === focus
        ? { stroke: COLORS[NODES[focus].clause], strokeWidth: 2, opacity: 0.95 }
        : { stroke: 'var(--az-border-subtle)', strokeWidth: 1, opacity: 0.25 };
    }
    return { stroke: 'var(--az-border-subtle)', strokeWidth: 1.25, opacity: selected.length ? 0.45 : 0.9 };
  };

  let tone;
  let note;
  if (selected.length === 0 && focus === null) {
    note = <>Each literal is a node. Edges join literals from <em>different clauses</em> that <em>don’t contradict</em>. Hover a node to trace its edges, or click nodes to build a clique.</>;
  } else if (selected.length === 0) {
    const n = NODES[focus];
    const missing = NODES.filter(m => m.clause !== n.clause && !near.includes(m.id));
    note = (
      <>
        <em>{lit(n.lit)}</em> (clause {n.clause + 1}) joins {near.length} nodes
        {missing.length > 0 && <>, but not {missing.map(m => lit(m.lit)).join(', ')}: same variable, opposite sign</>}.
      </>
    );
  } else if (!clique) {
    tone = 'no';
    note = <>Not a clique: {problems.join('; ')}.</>;
  } else if (complete) {
    tone = 'ok';
    note = <>A <em>3-clique</em>, one node per clause, no contradictions. Read it as an assignment: <em>{assignment(nodes)}</em>. Every clause gets a true literal, so φ is satisfied.</>;
  } else {
    note = <>Still a clique ({selected.length} of 3). Add a compatible literal from {3 - new Set(nodes.map(n => n.clause)).size === 1 ? 'the remaining clause' : 'each remaining clause'}.</>;
  }

  return (
    <Figure
      icon={Waypoints}
      kicker="Reduction"
      title="3-SAT to Clique"
      tools={
        <>
          <Button icon={Sparkles} onClick={() => setSelected(EXAMPLE)}>Show a 3-clique</Button>
          <Button icon={Eraser} onClick={() => setSelected([])} disabled={!selected.length}>Clear</Button>
        </>
      }
      caption="φ is satisfiable exactly when this graph has a clique with one node per clause, so a fast Clique solver would also solve 3-SAT."
    >
      <div className="az-viz-formula az-viz-formula--plain">
        <span>φ =</span>
        {CLAUSES.map((clause, c) => (
          <React.Fragment key={c}>
            <span className="az-viz-chip" style={{ '--tok': COLORS[c] }}>({clause.map(lit).join(' ∨ ')})</span>
            {c < CLAUSES.length - 1 && <span>∧</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="az-viz__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-viz-svg" role="group"
          aria-label="Clique graph: one node per literal, edges between compatible literals in different clauses">
          {EDGES.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
              {...edgeStyle(a, b)} style={{ transition: 'all 0.2s ease' }} />
          ))}

          {GROUPS.map((g, c) => (
            <text key={c} x={g.x} y={g.y} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" letterSpacing="0.14em" fill={COLORS[c]}>
              CLAUSE {c + 1}
            </text>
          ))}

          {NODES.map(n => {
            const on = inSel(n.id);
            const color = on ? (clique ? (complete ? OK : COLORS[n.clause]) : 'var(--az-no)') : COLORS[n.clause];
            const dim = focus !== null && focus !== n.id && !near.includes(n.id) && !on;
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${lit(n.lit)}, clause ${n.clause + 1}`}
                className="az-viz-node"
                opacity={dim ? 0.3 : 1}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(n.id)}
                onBlur={() => setHovered(null)}
                onClick={() => toggle(n.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(n.id); } }}
              >
                <circle cx={n.x} cy={n.y} r={R} fill="var(--az-surface)" />
                <circle cx={n.x} cy={n.y} r={R} fill={color} fillOpacity={on ? 0.18 : 0.06}
                  stroke={color} strokeWidth={on || focus === n.id ? 2.5 : 1.5} />
                {on && <circle cx={n.x} cy={n.y} r={R + 5} fill="none" stroke={color} strokeWidth={1} opacity={0.45} />}
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
                  fontWeight={on ? 600 : 500} fill={color}>
                  {lit(n.lit)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <Legend
        items={[
          ...CLAUSES.map((_, c) => ({ color: COLORS[c], label: `Clause ${c + 1}` })),
          { color: OK, label: 'Satisfying clique' },
        ]}
      />

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
