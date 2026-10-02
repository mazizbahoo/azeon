import React, { useState } from 'react';
import { Equal, EqualNot, Layers } from 'lucide-react';
import { Figure, Note, Segmented } from './figure';

/* ── The P / NP landscape (Posts 8 and 10) ─────────────────
   mode="known"  : only what is proven, P ⊆ NP (Post 8)
   mode="worlds" : toggle between P ≠ NP and P = NP (Post 10) */

const PROBLEMS = [
  { id: 'sort', name: 'Sorting', zone: 'p', solve: 'O(n log n), e.g. merge sort.', verify: 'Scan once to confirm each item is ≤ the next.' },
  { id: 'search', name: 'Binary search', zone: 'p', solve: 'O(log n) on a sorted list.', verify: 'Look at the returned position.' },
  { id: 'path', name: 'Shortest path', zone: 'p', solve: 'Polynomial with Dijkstra’s algorithm.', verify: 'Add up the edges of the given path.' },
  { id: 'prime', name: 'Primality', zone: 'p', solve: 'Polynomial since the AKS algorithm (2002).', verify: 'Fast, by running the same test.' },
  { id: 'factor', name: 'Factoring', zone: 'mid', solve: 'No polynomial algorithm known; RSA encryption depends on that.', verify: 'Multiply the factors back together.', mid: true },
  { id: 'sat', name: 'SAT', zone: 'npc', solve: 'No polynomial algorithm known. NP-complete by Cook–Levin.', verify: 'Plug the assignment in and evaluate every clause.' },
  { id: 'clique', name: 'Clique', zone: 'npc', solve: 'No polynomial algorithm known. NP-complete (Post 15).', verify: 'Check every pair of the given nodes is connected.' },
  { id: 'vc', name: 'Vertex cover', zone: 'npc', solve: 'No polynomial algorithm known. NP-complete (Post 16).', verify: 'Check every edge touches a chosen node.' },
  { id: 'tsp', name: 'TSP', zone: 'npc', solve: 'Brute force tries (n − 1)! routes. No polynomial algorithm known.', verify: 'Add up the given route and check it visits every city once.' },
  { id: 'sudoku', name: 'Sudoku', zone: 'npc', solve: 'Generalised n×n Sudoku is NP-complete.', verify: 'Check each row, column and box: O(n²).' },
  { id: 'color', name: 'Graph coloring', zone: 'npc', solve: '3-coloring is NP-complete.', verify: 'Check no edge joins two nodes of the same colour.' },
];

const W = 640;
const H = 360;

// Chip positions per layout
const LAYOUT = {
  neq: {
    sort: [150, 150], search: [140, 195], path: [200, 240], prime: [130, 285],
    factor: [320, 92],
    sat: [455, 140], clique: [540, 178], vc: [440, 205], tsp: [545, 240], sudoku: [455, 268], color: [500, 305],
  },
  eq: {
    sort: [190, 130], search: [175, 180], path: [200, 230], prime: [240, 280],
    factor: [320, 112],
    sat: [440, 140], clique: [500, 170], vc: [400, 190], tsp: [480, 230], sudoku: [380, 245], color: [440, 285],
  },
};
LAYOUT.known = { ...LAYOUT.neq };

const ZONE_COLOR = { p: 'var(--az-c1)', mid: 'var(--az-c4)', npc: 'var(--az-c6)' };

function Chip({ p, x, y, active, onSelect, color }) {
  const w = p.name.length * 7.2 + 22;
  return (
    <g
      className="az-landscape__chip az-viz-node"
      style={{ transform: `translate(${x - w / 2}px, ${y - 13}px)` }}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={p.name}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
    >
      <rect width={w} height={26} rx={13} fill="var(--az-surface)" />
      <rect width={w} height={26} rx={13} fill={color} fillOpacity={active ? 0.22 : 0.08}
        stroke={color} strokeOpacity={active ? 1 : 0.45} strokeWidth={active ? 1.75 : 1} />
      <text x={w / 2} y={14} textAnchor="middle" dominantBaseline="middle" fontSize="11.5"
        fontWeight={active ? 600 : 500} fill={color}>{p.name}</text>
    </g>
  );
}

export default function ComplexityLandscape({ mode = 'worlds' }) {
  const [world, setWorld] = useState('neq');
  const [selected, setSelected] = useState(null);
  const layout = mode === 'known' ? 'known' : world;
  const equal = layout === 'eq';
  const pos = LAYOUT[layout];

  // P grows to fill NP when P = NP.
  const P = equal ? { cx: 320, cy: 195, rx: 285, ry: 150 } : { cx: 190, cy: 215, rx: 135, ry: 115 };
  const sel = PROBLEMS.find(p => p.id === selected);

  const colorOf = p => (equal ? 'var(--az-c1)' : mode === 'known' && p.zone !== 'p' ? 'var(--az-c4)' : ZONE_COLOR[p.zone]);

  let note;
  let tone;
  if (sel) {
    note = <><em>{sel.name}</em>. Solve: {equal && sel.zone !== 'p' ? 'polynomial, in this world. ' : ''}{sel.solve} Verify: {sel.verify}</>;
  } else if (mode === 'known') {
    note = <>Proven: <em>P ⊆ NP</em>. Every problem we can solve fast, we can also verify fast. Not known: whether the problems outside P, like these, could secretly be solved fast too. Click any problem.</>;
  } else if (!equal) {
    note = <>The world almost everyone believes in: P is a strict part of NP, and the <em>NP-complete</em> problems are the hardest in NP, out of reach of any polynomial algorithm. Click any problem.</>;
  } else {
    tone = 'no';
    note = <>If <em>P = NP</em>, the boundary disappears. Every problem whose answer can be checked fast can also be found fast, including SAT, TSP and every NP-complete problem, and factoring, which RSA relies on.</>;
  }

  return (
    <Figure
      icon={Layers}
      kicker="Complexity classes"
      title={mode === 'known' ? 'What we know: P sits inside NP' : equal ? 'If P = NP' : 'If P ≠ NP'}
      tools={mode === 'worlds' && (
        <Segmented
          label="Which world"
          value={world}
          onChange={setWorld}
          options={[
            { value: 'neq', label: 'P ≠ NP', icon: EqualNot },
            { value: 'eq', label: 'P = NP', icon: Equal, accent: 'var(--az-no)' },
          ]}
        />
      )}
      caption={mode === 'known'
        ? 'Whether anything in NP lies outside P is exactly the open question.'
        : 'Factoring is in NP but is not known to be in P or to be NP-complete. Most researchers expect it to be neither.'}
    >
      <div className="az-viz__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-viz-svg az-landscape" role="group" aria-label="Diagram of complexity classes">
          <ellipse cx={320} cy={195} rx={300} ry={160} fill="var(--az-accent)" fillOpacity={0.05}
            stroke="var(--az-accent)" strokeOpacity={0.6} strokeWidth={1.5} />
          <text x={320} y={equal ? 76 : 55} textAnchor="middle" fontSize="13" fontWeight="600" letterSpacing="0.12em" fill="var(--az-accent)">
            {equal ? 'P = NP' : 'NP'}
          </text>

          {!equal && mode === 'worlds' && (
            <g className="az-landscape__fade">
              <ellipse cx={490} cy={222} rx={115} ry={110} fill="var(--az-c6)" fillOpacity={0.07}
                stroke="var(--az-c6)" strokeOpacity={0.55} strokeWidth={1.25} strokeDasharray="5 4" />
              <text x={490} y={102} textAnchor="middle" fontSize="10.5" letterSpacing="0.12em" fill="var(--az-c6)">NP-COMPLETE</text>
            </g>
          )}

          <ellipse className="az-landscape__p" style={P} fill="var(--az-c1)" fillOpacity={0.07}
            stroke="var(--az-c1)" strokeOpacity={0.7} strokeWidth={1.5} />
          {!equal && (
            <text x={190} y={120} textAnchor="middle" fontSize="13" fontWeight="600" letterSpacing="0.12em" fill="var(--az-c1)">P</text>
          )}

          {PROBLEMS.map(p => (
            <Chip
              key={p.id}
              p={p}
              x={pos[p.id][0]}
              y={pos[p.id][1]}
              color={colorOf(p)}
              active={selected === p.id}
              onSelect={() => setSelected(id => (id === p.id ? null : p.id))}
            />
          ))}
        </svg>
      </div>

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
