import React, { useMemo, useState } from 'react';
import { Button, Figure, Segmented, svgButton } from './figure';

/* ── Hamiltonian cycle: build a tour one city at a time ─────
   Dodecahedron = Hamilton's Icosian game (has a cycle).
   Petersen graph = the classic graph with no Hamiltonian cycle. */

const W = 420;
const H = 400;
const CX = W / 2;
const CY = H / 2;
const ring = (n, r, offset = 0) => Array.from({ length: n }, (_, i) => {
  const a = ((i + offset) * 2 * Math.PI) / n - Math.PI / 2;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
});

function dodecahedron() {
  // outer pentagon 0-4, middle decagon 5-14, inner pentagon 15-19
  const nodes = [...ring(5, 175), ...ring(10, 112), ...ring(5, 56, 0.5)];
  const edges = [];
  for (let i = 0; i < 5; i++) edges.push([i, (i + 1) % 5], [i, 5 + 2 * i], [15 + i, 15 + ((i + 1) % 5)], [15 + i, 5 + 2 * i + 1]);
  for (let i = 0; i < 10; i++) edges.push([5 + i, 5 + ((i + 1) % 10)]);
  return { nodes, edges };
}

function petersen() {
  const nodes = [...ring(5, 165), ...ring(5, 80)];
  const edges = [];
  for (let i = 0; i < 5; i++) edges.push([i, (i + 1) % 5], [i, 5 + i], [5 + i, 5 + ((i + 2) % 5)]);
  return { nodes, edges };
}

const GRAPHS = { dodeca: { label: 'Dodecahedron', ...dodecahedron() }, petersen: { label: 'Petersen', ...petersen() } };

const adjacency = g => {
  const adj = g.nodes.map(() => new Set());
  g.edges.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });
  return adj;
};

// Plain backtracking. Fine for 20 nodes; that is the point of the post.
function findCycle(adj) {
  const n = adj.length;
  const path = [0];
  const used = new Set([0]);
  const go = () => {
    if (path.length === n) return adj[path[n - 1]].has(0);
    for (const next of adj[path[path.length - 1]]) {
      if (used.has(next)) continue;
      path.push(next); used.add(next);
      if (go()) return true;
      path.pop(); used.delete(next);
    }
    return false;
  };
  return go() ? [...path] : null;
}

const R = 13;

export default function HamiltonianCycle() {
  const [name, setName] = useState('dodeca');
  const [path, setPath] = useState([]);
  const g = GRAPHS[name];
  const adj = useMemo(() => adjacency(g), [g]);
  const solution = useMemo(() => findCycle(adj), [adj]);

  const n = g.nodes.length;
  const last = path[path.length - 1];
  const full = path.length === n;
  const closed = full && adj[last].has(path[0]);

  const click = i => {
    if (!path.length) { setPath([i]); return; }
    if (i === last) { setPath(path.slice(0, -1)); return; }
    if (!path.includes(i) && adj[last].has(i)) setPath([...path, i]);
  };
  const load = k => { setName(k); setPath([]); };

  const nextOptions = path.length ? [...adj[last]].filter(j => !path.includes(j)) : [];
  const stuck = path.length > 0 && !full && nextOptions.length === 0;

  let status = <>Click any city to start, then click a neighbour to move. Click the last city to undo.</>;
  let tone;
  if (closed) { tone = 'good'; status = <><b>Hamiltonian cycle</b>: all {n} cities visited once, and the last one joins the first</>; }
  else if (full) { tone = 'bad'; status = <>All {n} cities visited, but the last one has <b>no road back</b> to the start</>; }
  else if (stuck) { tone = 'bad'; status = <><b>Stuck</b> after {path.length} of {n} cities: every neighbour is already used</>; }
  else if (path.length) status = <>{path.length} of {n} cities visited</>;
  if (!path.length && name === 'petersen') status = <>Search every route you like. A full search finds <b>no</b> Hamiltonian cycle here.</>;

  const onPath = new Set(path.slice(1).map((v, i) => [path[i], v].sort().join('-')));
  if (closed) onPath.add([last, path[0]].sort().join('-'));

  return (
    <Figure
      title="Visit every city exactly once"
      tools={
        <>
          <Segmented label="Graph" value={name} onChange={load}
            options={Object.entries(GRAPHS).map(([value, v]) => ({ value, label: v.label }))} />
          <Button onClick={() => solution && setPath(solution)} disabled={!solution}>Show one</Button>
          <Button onClick={() => setPath([])} disabled={!path.length}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label={`${g.label} graph`}>
          {g.edges.map(([a, b]) => {
            const on = onPath.has([a, b].sort().join('-'));
            return (
              <line key={`${a}-${b}`} x1={g.nodes[a][0]} y1={g.nodes[a][1]} x2={g.nodes[b][0]} y2={g.nodes[b][1]}
                stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on ? 3 : 1.25} />
            );
          })}
          {g.nodes.map(([x, y], i) => {
            const at = path.indexOf(i);
            const isLast = i === last;
            const option = nextOptions.includes(i);
            return (
              <g key={i} {...svgButton(() => click(i), `City ${i + 1}`, at >= 0)}>
                <circle cx={x} cy={y} r={R} fill="var(--fig-bg)" />
                <circle className="az-fig-node" cx={x} cy={y} r={R}
                  fill={at >= 0 ? 'var(--fig-accent)' : 'var(--fig-bg)'} fillOpacity={isLast ? 1 : at >= 0 ? 0.2 : 1}
                  stroke={at >= 0 || option ? 'var(--fig-accent)' : 'var(--fig-line-strong)'}
                  strokeWidth={option ? 2 : 1.25} strokeDasharray={option ? '3 3' : undefined} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10.5"
                  fill={isLast ? '#fff' : at >= 0 ? 'var(--fig-accent)' : 'var(--fig-muted)'}>
                  {at >= 0 ? at + 1 : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
