import React, { useMemo, useState } from 'react';
import { Button, Figure, Segmented, svgButton } from './figure';

/* ── Cliques vs cores in a small friendship graph ───────────
   Clique: everyone in the group knows everyone else (NP-Hard to
   find the biggest). k-core: everyone in the group knows at
   least k others in it (found by repeatedly deleting people
   with fewer than k friends: fast). */

const NAMES = ['Ali', 'Sara', 'Hamza', 'Ayesha', 'Bilal', 'Zara', 'Omar', 'Hina', 'Usman', 'Fatima', 'Raza'];
const EDGES = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4], [1, 4],
  [4, 5], [5, 6], [5, 7], [6, 7], [6, 8], [7, 8], [5, 8],
  [8, 9], [9, 10], [3, 9], [0, 10],
];
const N = NAMES.length;
const ADJ = Array.from({ length: N }, () => new Set());
EDGES.forEach(([a, b]) => { ADJ[a].add(b); ADJ[b].add(a); });

const W = 520;
const H = 330;
const POS = [[90, 80], [190, 50], [160, 160], [70, 190], [250, 140], [330, 110], [440, 70], [420, 190], [340, 240], [200, 280], [70, 290]];

function largestClique() {
  let best = [];
  for (let m = 1; m < 1 << N; m++) {
    const s = [];
    for (let i = 0; i < N; i++) if (m & (1 << i)) s.push(i);
    if (s.length <= best.length) continue;
    if (s.every((a, i) => s.slice(i + 1).every(b => ADJ[a].has(b)))) best = s;
  }
  return best;
}

function kCore(k) {
  const alive = new Set(Array.from({ length: N }, (_, i) => i));
  let changed = true;
  while (changed) {
    changed = false;
    alive.forEach(v => {
      if ([...ADJ[v]].filter(u => alive.has(u)).length < k) { alive.delete(v); changed = true; }
    });
  }
  return alive;
}

export default function FriendGraph() {
  const [mode, setMode] = useState('clique');
  const [sel, setSel] = useState([]);
  const [k, setK] = useState(3);
  const best = useMemo(largestClique, []);
  const core = useMemo(() => kCore(k), [k]);

  const toggle = i => setSel(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]));
  const missing = [];
  sel.forEach((a, i) => sel.slice(i + 1).forEach(b => { if (!ADJ[a].has(b)) missing.push([a, b]); }));

  const on = i => (mode === 'clique' ? sel.includes(i) : core.has(i));
  const edgeOn = (a, b) => on(a) && on(b);

  let status;
  let tone;
  if (mode === 'clique') {
    if (!sel.length) status = <>Click people to form a group. A <b>clique</b> is a group where everyone knows everyone.</>;
    else if (missing.length) { tone = 'bad'; status = <><b>Not a clique</b>: {NAMES[missing[0][0]]} and {NAMES[missing[0][1]]} aren't friends</>; }
    else { tone = 'good'; status = <><b>Clique of {sel.length}</b>{sel.length === best.length ? ', the largest in this network' : ''}</>; }
  } else {
    status = core.size
      ? <><b>{k}-core</b>: {core.size} people who each know at least {k} others inside the group. Found by peeling, not searching.</>
      : <>No {k}-core: peeling removes everyone.</>;
    tone = core.size ? 'good' : 'bad';
  }

  return (
    <Figure
      title="Groups in a friendship network"
      tools={
        <>
          <Segmented label="Mode" value={mode} onChange={m => { setMode(m); setSel([]); }}
            options={[{ value: 'clique', label: 'Cliques' }, { value: 'core', label: 'Cores' }]} />
          {mode === 'clique'
            ? <>
              <Button onClick={() => setSel(best)}>Largest clique</Button>
              <Button onClick={() => setSel([])} disabled={!sel.length}>Clear</Button>
            </>
            : <Segmented label="k" value={k} onChange={setK} options={[2, 3, 4].map(x => ({ value: x, label: `k = ${x}` }))} />}
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label="Friendship network">
          {EDGES.map(([a, b]) => {
            const lit = edgeOn(a, b);
            return <line key={`${a}-${b}`} x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]}
              stroke={lit ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={lit ? 2.5 : 1.25} />;
          })}
          {mode === 'clique' && missing.map(([a, b]) => (
            <line key={`m${a}-${b}`} x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]}
              stroke="var(--fig-bad)" strokeWidth={2} strokeDasharray="4 4" />
          ))}
          {NAMES.map((name, i) => {
            const lit = on(i);
            const [x, y] = POS[i];
            const props = mode === 'clique' ? svgButton(() => toggle(i), name, lit) : {};
            return (
              <g key={name} {...props}>
                <circle cx={x} cy={y} r={22} fill="var(--fig-bg)" />
                <circle className="az-fig-node" cx={x} cy={y} r={22} fill={lit ? 'var(--fig-accent)' : 'var(--fig-bg)'} fillOpacity={lit ? 0.16 : 1}
                  stroke={lit ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={lit ? 2 : 1.25} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={lit ? 'var(--fig-accent)' : 'var(--fig-ink)'}>{name}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
