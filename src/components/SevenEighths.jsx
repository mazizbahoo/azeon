import React, { useState } from 'react';
import { Button, Figure } from './figure';

/* ── MAX-3SAT: a random assignment satisfies 7/8 on average ──
   Each clause has 3 different variables, so a random assignment
   fails it with probability 1/8. "Greedy, no luck needed" fixes
   variables one at a time, each time keeping the expected number
   of satisfied clauses as high as possible (conditional
   expectations), which guarantees at least 7/8. */

const NV = 12;
const M = 40;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLAUSES = (() => {
  const r = mulberry32(2024);
  return Array.from({ length: M }, () => {
    const vs = [];
    while (vs.length < 3) { const v = Math.floor(r() * NV); if (!vs.includes(v)) vs.push(v); }
    return vs.map(v => ({ v, neg: r() < 0.5 }));
  });
})();

const satisfied = a => CLAUSES.filter(c => c.some(({ v, neg }) => a[v] !== neg)).length;

// Expected satisfied clauses when variables in `a` are fixed and the rest are random.
function expected(a) {
  return CLAUSES.reduce((s, c) => {
    if (c.some(({ v, neg }) => a[v] !== undefined && a[v] !== neg)) return s + 1;
    const free = c.filter(({ v }) => a[v] === undefined).length;
    return s + (1 - 0.5 ** free);
  }, 0);
}

function conditional() {
  const a = {};
  for (let v = 0; v < NV; v++) {
    const t = expected({ ...a, [v]: true });
    const f = expected({ ...a, [v]: false });
    a[v] = t >= f;
  }
  return a;
}

export default function SevenEighths() {
  const [runs, setRuns] = useState([]);
  const [greedy, setGreedy] = useState(null);

  const roll = k => {
    const out = [];
    for (let i = 0; i < k; i++) {
      const a = Array.from({ length: NV }, () => Math.random() < 0.5);
      out.push(satisfied(a));
    }
    setRuns(r => [...r, ...out]);
  };

  const mean = runs.length ? runs.reduce((s, x) => s + x, 0) / runs.length : null;
  const target = (7 / 8) * M;

  let status = <>A formula with {M} clauses of 3 different variables each. Random guessing should satisfy about <b>{target}</b> of them on average.</>;
  if (greedy != null) status = <>Fixing variables one by one to keep the expected count high: <b>{greedy}</b> of {M} satisfied, guaranteed to be at least {target}.</>;
  else if (runs.length) status = <>Average over {runs.length} random assignment{runs.length > 1 ? 's' : ''}: <b>{mean.toFixed(1)}</b> of {M} ({((mean / M) * 100).toFixed(1)}%)</>;

  return (
    <Figure
      title="Satisfying 7/8 of the clauses"
      tools={
        <>
          <Button onClick={() => { setGreedy(null); roll(1); }}>Random assignment</Button>
          <Button onClick={() => { setGreedy(null); roll(100); }}>100 more</Button>
          <Button onClick={() => setGreedy(satisfied(conditional()))}>No luck needed</Button>
          <Button onClick={() => { setRuns([]); setGreedy(null); }} disabled={!runs.length && greedy == null}>Clear</Button>
        </>
      }
      status={status}
      tone={greedy != null ? 'good' : undefined}
    >
      <div className="az-fig-well" style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 50, alignContent: 'flex-start' }}>
        {runs.length === 0 && <span style={{ color: 'var(--fig-muted)', margin: 'auto' }}>No assignments tried yet</span>}
        {runs.slice(-60).map((s, i) => (
          <span key={i} className="az-fig-token" data-on={String(s >= target)} style={{ minWidth: 30, height: 26, fontSize: 12 }}>{s}</span>
        ))}
      </div>
    </Figure>
  );
}
