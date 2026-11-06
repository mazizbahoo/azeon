import React, { useMemo, useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── The double-tree 2-approximation for metric TSP ─────────
   1. Minimum spanning tree (cheaper than any tour).
   2. Walk around the tree: every edge twice, so 2 × tree.
   3. Skip cities already visited. With straight-line distances,
      shortcuts never add length, so the tour ≤ 2 × tree ≤ 2 × OPT. */

const POINTS = [[80, 70], [220, 40], [370, 80], [440, 200], [330, 270], [180, 250], [60, 200], [250, 150]];
const N = POINTS.length;
const W = 500;
const H = 310;
const d = (a, b) => Math.hypot(POINTS[a][0] - POINTS[b][0], POINTS[a][1] - POINTS[b][1]) / 10;
const len = tour => tour.reduce((s, v, i) => s + d(v, tour[(i + 1) % tour.length]), 0);

function prim() {
  const inTree = [0];
  const edges = [];
  while (inTree.length < N) {
    let best = null;
    inTree.forEach(i => { for (let j = 0; j < N; j++) if (!inTree.includes(j) && (!best || d(i, j) < best.w)) best = { i, j, w: d(i, j) }; });
    inTree.push(best.j); edges.push([best.i, best.j]);
  }
  return edges;
}

function walks(edges) {
  const adj = Array.from({ length: N }, () => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const full = [];
  const pre = [];
  const seen = new Set();
  const dfs = v => {
    seen.add(v); pre.push(v); full.push(v);
    adj[v].forEach(u => { if (!seen.has(u)) { dfs(u); full.push(v); } });
  };
  dfs(0);
  return { full, pre };
}

function optimal() {
  let best = null;
  let bestLen = Infinity;
  const rest = Array.from({ length: N - 1 }, (_, i) => i + 1);
  const perm = k => {
    if (k === rest.length) { const t = [0, ...rest]; const l = len(t); if (l < bestLen) { bestLen = l; best = t; } return; }
    for (let i = k; i < rest.length; i++) { [rest[k], rest[i]] = [rest[i], rest[k]]; perm(k + 1); [rest[k], rest[i]] = [rest[i], rest[k]]; }
  };
  perm(0);
  return best;
}

export default function TreeTour() {
  const [stage, setStage] = useState('tree');
  const tree = useMemo(prim, []);
  const { full, pre } = useMemo(() => walks(tree), [tree]);
  const opt = useMemo(optimal, []);

  const treeLen = tree.reduce((s, [a, b]) => s + d(a, b), 0);
  const walkLen = full.slice(1).reduce((s, v, i) => s + d(full[i], v), 0);
  const tourLen = len(pre);
  const optLen = len(opt);

  const legs = stage === 'shortcut' ? pre.map((v, i) => [v, pre[(i + 1) % N]])
    : stage === 'optimal' ? opt.map((v, i) => [v, opt[(i + 1) % N]]) : [];

  const status = {
    tree: <>Minimum spanning tree: <b>{treeLen.toFixed(1)}</b>. Every tour is longer than this, so it's a lower bound.</>,
    walk: <>Walking around the tree uses each edge twice: <b>{walkLen.toFixed(1)}</b> = 2 × {treeLen.toFixed(1)}. Visit order: {full.map(v => String.fromCharCode(65 + v)).join(' ')}</>,
    shortcut: <>Skipping repeat visits gives a tour of <b>{tourLen.toFixed(1)}</b>, at most {walkLen.toFixed(1)}. Best possible: {optLen.toFixed(1)} (ratio {(tourLen / optLen).toFixed(2)}).</>,
    optimal: <>The shortest tour, by trying all {(5040).toLocaleString('en-US')} orders: <b>{optLen.toFixed(1)}</b></>,
  }[stage];

  return (
    <Figure
      title="A tour from a tree"
      tools={<Segmented label="Stage" value={stage} onChange={setStage}
        options={[{ value: 'tree', label: '1. Tree' }, { value: 'walk', label: '2. Walk twice' }, { value: 'shortcut', label: '3. Shortcut' }, { value: 'optimal', label: 'Optimal' }]} />}
      status={status}
      tone={stage === 'shortcut' || stage === 'optimal' ? 'good' : undefined}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="img" aria-label="Cities, spanning tree and tour">
          {(stage === 'tree' || stage === 'walk' || stage === 'shortcut') && tree.map(([a, b]) => (
            <line key={`t${a}-${b}`} x1={POINTS[a][0]} y1={POINTS[a][1]} x2={POINTS[b][0]} y2={POINTS[b][1]}
              stroke={stage === 'shortcut' ? 'var(--fig-line-strong)' : 'var(--fig-accent)'}
              strokeWidth={stage === 'walk' ? 7 : stage === 'shortcut' ? 1.5 : 3} strokeOpacity={stage === 'walk' ? 0.35 : 1}
              strokeDasharray={stage === 'shortcut' ? '4 4' : undefined} strokeLinecap="round" />
          ))}
          {legs.map(([a, b]) => (
            <line key={`l${a}-${b}`} x1={POINTS[a][0]} y1={POINTS[a][1]} x2={POINTS[b][0]} y2={POINTS[b][1]}
              stroke="var(--fig-accent)" strokeWidth={3} />
          ))}
          {POINTS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={14} fill="var(--fig-bg)" stroke="var(--fig-ink)" strokeWidth={1.25} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="var(--fig-ink)">{String.fromCharCode(65 + i)}</text>
            </g>
          ))}
        </svg>
      </div>
    </Figure>
  );
}
