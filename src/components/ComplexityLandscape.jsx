import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── P and NP as regions ─────────────────────────────────
   mode="known"  : only what is proven, P ⊆ NP (Post 8)
   mode="worlds" : switch between P ≠ NP and P = NP (Post 10) */

// Problems sit in tidy columns centred in their regions. In the P = NP
// world they regroup into one 3 × 4 grid inside the merged region.
const IN_P = ['Sorting', 'Binary search', 'Shortest path', 'Primality'];
const IN_NPC = ['SAT', 'Clique', 'Vertex cover', 'TSP', 'Sudoku', 'Graph coloring'];
const ALL = [...IN_P, 'Factoring', ...IN_NPC];

const NEQ = {
  ...Object.fromEntries(IN_P.map((n, i) => [n, [185, 188 + i * 32]])),
  Factoring: [338, 112],
  ...Object.fromEntries(IN_NPC.map((n, i) => [n, [490, 176 + i * 29]])),
};
const EQ = Object.fromEntries(ALL.map((n, i) => {
  const row = Math.floor(i / 3);
  const inRow = Math.min(3, ALL.length - row * 3); // centre a short last row
  return [n, [330 + ((i % 3) - (inRow - 1) / 2) * 120, 160 + row * 44]];
}));
const PROBLEMS = ALL.map(name => ({ name, neq: NEQ[name], eq: EQ[name] }));

const W = 660;
const H = 380;
const NP = { cx: 330, cy: 210, rx: 300, ry: 160 };
const P_SMALL = { cx: 185, cy: 230, rx: 125, ry: 105 };
const P_FULL = { cx: 330, cy: 215, rx: 278, ry: 140 };

export default function ComplexityLandscape({ mode = 'worlds' }) {
  const [world, setWorld] = useState('neq');
  const equal = mode === 'worlds' && world === 'eq';
  const P = equal ? P_FULL : P_SMALL;

  return (
    <Figure
      title={mode === 'known' ? 'P inside NP' : 'Two possible worlds'}
      tools={mode === 'worlds' && (
        <Segmented label="World" value={world} onChange={setWorld}
          options={[{ value: 'neq', label: 'P ≠ NP' }, { value: 'eq', label: 'P = NP' }]} />
      )}
      status={mode === 'known'
        ? <>Proven: <b>P ⊆ NP</b>. Unknown: whether anything in NP lies outside P</>
        : equal
          ? <>Every problem here becomes <b>fast to solve</b></>
          : <>The NP-complete problems stay <b>out of reach</b></>}
    >
      <svg viewBox={`0 40 ${W} ${H - 50}`} className="az-fig-svg" role="img"
        aria-label={equal ? 'P and NP are the same region' : 'P is a smaller region inside NP'}>
        <ellipse {...NP} fill="none" stroke="var(--fig-line-strong)" strokeWidth="1.5" />
        <text className="az-land__item" x={NP.cx} y={equal ? NP.cy - P_FULL.ry + 34 : NP.cy - NP.ry + 26} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--fig-ink)">
          {equal ? 'P = NP' : 'NP'}
        </text>

        {mode === 'worlds' && (
          <g style={{ opacity: equal ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            <ellipse cx={490} cy={248} rx={118} ry={108} fill="none" stroke="var(--fig-line-strong)" strokeWidth="1.25" strokeDasharray="5 5" />
            <text x={490} y={128} textAnchor="middle" fontSize="11" letterSpacing="0.06em" fill="var(--fig-faint)">NP-COMPLETE</text>
          </g>
        )}

        <ellipse className="az-land__p" style={P}
          fill="var(--fig-accent)" fillOpacity="0.06" stroke="var(--fig-accent)" strokeWidth="1.5" />
        <text x={P_SMALL.cx} y={P_SMALL.cy - P_SMALL.ry + 28} textAnchor="middle" fontSize="13" fontWeight="600"
          fill="var(--fig-accent)" style={{ opacity: equal ? 0 : 1, transition: 'opacity 0.3s ease' }}>P</text>

        {PROBLEMS.map(p => {
          const [x, y] = equal ? p.eq : p.neq;
          return (
            <text key={p.name} className="az-land__item" style={{ transform: `translate(${x}px, ${y}px)` }}
              textAnchor="middle" dominantBaseline="middle" fontSize="12.5" fill="var(--fig-muted)">
              {p.name}
            </text>
          );
        })}
      </svg>
    </Figure>
  );
}
