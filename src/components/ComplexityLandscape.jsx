import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── P and NP as regions ─────────────────────────────────
   mode="known"  : only what is proven, P ⊆ NP (Post 8)
   mode="worlds" : switch between P ≠ NP and P = NP (Post 10) */

// Geometry: NP is one wide ellipse; inside it sit two equal circles placed
// symmetrically about the centre line: P on the left, the problems not known
// to be in P on the right. Factoring sits on the centre line above them.
const W = 660;
const CX = 330;
const NP = { cx: CX, cy: 230, rx: 305, ry: 175 };
const R = { rx: 118, ry: 112 };
const LEFT = { cx: CX - 140, cy: 245, ...R };
const RIGHT = { cx: CX + 140, cy: 245, ...R };
const P_FULL = { cx: CX, cy: 235, rx: 285, ry: 150 };
const ROW = 28;

const IN_P = ['Sorting', 'Binary search', 'Shortest path', 'Primality'];
const IN_NPC = ['SAT', 'Clique', 'Vertex cover', 'TSP', 'Sudoku', 'Graph coloring'];
const ALL = [...IN_P, 'Factoring', ...IN_NPC];

// A region's label sits near its top; its list is centred in the space below.
const labelY = c => c.cy - c.ry + 30;
const column = (names, c) => {
  const top = labelY(c) + 18;
  const mid = (top + c.cy + c.ry - 14) / 2;
  return names.map((n, i) => [n, [c.cx, mid + (i - (names.length - 1) / 2) * ROW]]);
};

const NEQ = Object.fromEntries([
  ...column(IN_P, LEFT),
  ['Factoring', [CX, NP.cy - NP.ry + 64]],
  ...column(IN_NPC, RIGHT),
]);
const EQ = Object.fromEntries(ALL.map((n, i) => {
  const row = Math.floor(i / 3);
  const inRow = Math.min(3, ALL.length - row * 3); // centre a short last row
  return [n, [CX + ((i % 3) - (inRow - 1) / 2) * 130, P_FULL.cy - 54 + row * 40]];
}));

export default function ComplexityLandscape({ mode = 'worlds' }) {
  const [world, setWorld] = useState('neq');
  const equal = mode === 'worlds' && world === 'eq';

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
      <svg viewBox={`0 ${NP.cy - NP.ry - 12} ${W} ${NP.ry * 2 + 24}`} className="az-fig-svg" role="img"
        aria-label={equal ? 'P and NP are the same region' : 'P is a smaller region inside NP'}>
        <ellipse {...NP} fill="none" stroke="var(--fig-line-strong)" strokeWidth="1.5" />
        <text className="az-land__item" x={CX} y={equal ? labelY(P_FULL) : NP.cy - NP.ry + 30}
          textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="600" fill="var(--fig-ink)">
          {equal ? 'P = NP' : 'NP'}
        </text>

        <g style={{ opacity: equal ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          <ellipse {...RIGHT} fill="none" stroke="var(--fig-line-strong)" strokeWidth="1.25" strokeDasharray="5 5" />
          <text x={RIGHT.cx} y={labelY(RIGHT)} textAnchor="middle" dominantBaseline="middle" fontSize="11"
            letterSpacing="0.06em" fill="var(--fig-faint)">
            {mode === 'known' ? 'NOT KNOWN IN P' : 'NP-COMPLETE'}
          </text>
        </g>

        <ellipse className="az-land__p" style={equal ? P_FULL : LEFT}
          fill="var(--fig-accent)" fillOpacity="0.06" stroke="var(--fig-accent)" strokeWidth="1.5" />
        <text x={LEFT.cx} y={labelY(LEFT)} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="600"
          fill="var(--fig-accent)" style={{ opacity: equal ? 0 : 1, transition: 'opacity 0.3s ease' }}>P</text>

        {ALL.map(name => {
          const [x, y] = equal ? EQ[name] : NEQ[name];
          return (
            <text key={name} className="az-land__item" style={{ transform: `translate(${x}px, ${y}px)` }}
              textAnchor="middle" dominantBaseline="middle" fontSize="12.5" fill="var(--fig-muted)">
              {name}
            </text>
          );
        })}
      </svg>
    </Figure>
  );
}
