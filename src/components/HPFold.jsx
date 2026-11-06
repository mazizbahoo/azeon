import React, { useState } from 'react';
import { Button, Figure } from './figure';

/* ── The HP lattice model of protein folding ────────────────
   A chain of H (water-avoiding) and P (water-loving) beads on a
   grid. Score = number of H–H pairs that touch without being
   neighbours in the chain. "Search every fold" tries them all
   (up to rotation and reflection). */

const SEQ = 'HPHPPHHPHPPHPH';
const N = SEQ.length;
const D = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function contacts(pos) {
  const idx = new Map(pos.map((p, i) => [`${p[0]},${p[1]}`, i]));
  const out = [];
  pos.forEach((p, i) => {
    if (SEQ[i] !== 'H') return;
    D.forEach(([dx, dy]) => {
      const j = idx.get(`${p[0] + dx},${p[1] + dy}`);
      if (j !== undefined && j > i + 1 && SEQ[j] === 'H') out.push([i, j]);
    });
  });
  return out;
}

const STRAIGHT = Array.from({ length: N }, (_, i) => [i, 0]);

function randomFold() {
  for (;;) {
    const pos = [[0, 0]];
    const occ = new Set(['0,0']);
    let ok = true;
    for (let i = 1; i < N && ok; i++) {
      const [x, y] = pos[i - 1];
      const free = D.map(([dx, dy]) => [x + dx, y + dy]).filter(p => !occ.has(`${p[0]},${p[1]}`));
      if (!free.length) { ok = false; break; }
      const p = free[Math.floor(Math.random() * free.length)];
      pos.push(p); occ.add(`${p[0]},${p[1]}`);
    }
    if (ok) return pos;
  }
}

function searchAll() {
  const pos = [[0, 0], [1, 0]];
  const occ = new Set(['0,0', '1,0']);
  let best = null;
  let bestScore = -1;
  let count = 0;
  const go = (dir, turned) => {
    if (pos.length === N) {
      count++;
      const c = contacts(pos).length;
      if (c > bestScore) { bestScore = c; best = pos.map(p => [...p]); }
      return;
    }
    for (const t of turned ? [-1, 0, 1] : [0, 1]) {
      const nd = (dir + t + 4) % 4;
      const [x, y] = pos[pos.length - 1];
      const p = [x + D[nd][0], y + D[nd][1]];
      const k = `${p[0]},${p[1]}`;
      if (occ.has(k)) continue;
      occ.add(k); pos.push(p);
      go(nd, turned || t !== 0);
      pos.pop(); occ.delete(k);
    }
  };
  go(0, false);
  return { best, count };
}

const CELL = 30;

export default function HPFold() {
  const [fold, setFold] = useState(STRAIGHT);
  const [searched, setSearched] = useState(null);

  const xs = fold.map(p => p[0]);
  const ys = fold.map(p => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const W = (Math.max(...xs) - minX + 2) * CELL;
  const H = (Math.max(...ys) - minY + 2) * CELL;
  const at = ([x, y]) => [(x - minX + 1) * CELL, (y - minY + 1) * CELL];
  const cs = contacts(fold);

  let status = <>Sequence {SEQ} · H–H contacts: <b>{cs.length}</b></>;
  let tone;
  if (searched) {
    tone = 'good';
    status = <>Checked all <b>{searched.toLocaleString('en-US')}</b> folds. The best has <b>{cs.length}</b> H–H contacts.</>;
  }

  return (
    <Figure
      title="Folding a toy protein"
      tools={
        <>
          <Button onClick={() => { setSearched(null); setFold(randomFold()); }}>Random fold</Button>
          <Button onClick={() => { const r = searchAll(); setFold(r.best); setSearched(r.count); }}>Search every fold</Button>
          <Button onClick={() => { setSearched(null); setFold(STRAIGHT); }}>Unfold</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-well" style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: Math.min(W * 1.4, 520), height: 'auto' }}
          role="img" aria-label={`Chain folded with ${cs.length} H–H contacts`}>
          {cs.map(([i, j]) => {
            const [x1, y1] = at(fold[i]);
            const [x2, y2] = at(fold[j]);
            return <line key={`c${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="3 3" />;
          })}
          {fold.slice(1).map((p, i) => {
            const [x1, y1] = at(fold[i]);
            const [x2, y2] = at(p);
            return <line key={`b${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fig-ink)" strokeWidth={2.5} />;
          })}
          {fold.map((p, i) => {
            const [x, y] = at(p);
            const h = SEQ[i] === 'H';
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={9} fill={h ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke={h ? 'var(--fig-accent)' : 'var(--fig-ink)'} strokeWidth={1.5} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill={h ? '#fff' : 'var(--fig-ink)'}>{SEQ[i]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
