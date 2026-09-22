import React, { useMemo, useState } from 'react';
import { Button, Figure, svgButton } from './figure';

/* ── Connecting pins with the least wire ────────────────────
   Chip wires run horizontally and vertically, so distance is
   |dx| + |dy|. Joining only the pins is a minimum spanning tree
   (easy). Adding extra junction points can shorten it: that's a
   Steiner tree (NP-Hard). Best junctions lie on the grid lines
   through the pins (Hanan, 1966), so small cases can be searched. */

const PINS = [[1, 1], [7, 2], [4, 6], [1, 7], [8, 7]];
const GRID = 9;
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

function mst(points) {
  const n = points.length;
  const inTree = [0];
  const edges = [];
  let total = 0;
  while (inTree.length < n) {
    let best = null;
    inTree.forEach(i => points.forEach((_, j) => {
      if (inTree.includes(j)) return;
      const d = dist(points[i], points[j]);
      if (!best || d < best.d) best = { i, j, d };
    }));
    inTree.push(best.j); edges.push([best.i, best.j]); total += best.d;
  }
  return { edges, total };
}

const key = p => `${p[0]},${p[1]}`;
const HANAN = [...new Set(PINS.map(p => p[0]))].flatMap(x => [...new Set(PINS.map(p => p[1]))].map(y => [x, y]))
  .filter(p => !PINS.some(q => key(q) === key(p)));

function bestSteiner() {
  let best = { extra: [], total: mst(PINS).total };
  const k = HANAN.length;
  for (let a = 0; a < k; a++) {
    const t1 = mst([...PINS, HANAN[a]]).total;
    if (t1 < best.total) best = { extra: [HANAN[a]], total: t1 };
    for (let b = a + 1; b < k; b++) {
      const t2 = mst([...PINS, HANAN[a], HANAN[b]]).total;
      if (t2 < best.total) best = { extra: [HANAN[a], HANAN[b]], total: t2 };
      for (let c = b + 1; c < k; c++) {
        const t3 = mst([...PINS, HANAN[a], HANAN[b], HANAN[c]]).total;
        if (t3 < best.total) best = { extra: [HANAN[a], HANAN[b], HANAN[c]], total: t3 };
      }
    }
  }
  return best;
}

const CELL = 40;
const PAD = 24;
const S = PAD * 2 + (GRID - 1) * CELL;
const at = ([x, y]) => [PAD + x * CELL, PAD + y * CELL];

export default function SteinerWires() {
  const [extra, setExtra] = useState([]);
  const best = useMemo(bestSteiner, []);
  const base = mst(PINS).total;
  const points = [...PINS, ...extra];
  const tree = mst(points);

  const toggle = p => setExtra(e => (e.some(q => key(q) === key(p)) ? e.filter(q => key(q) !== key(p)) : [...e, p]));

  const tone = tree.total <= best.total ? 'good' : tree.total > base ? 'bad' : undefined;
  return (
    <Figure
      title="Wire up the pins"
      tools={
        <>
          <Button onClick={() => setExtra(best.extra)}>Best junctions</Button>
          <Button onClick={() => setExtra([])} disabled={!extra.length}>Clear</Button>
        </>
      }
      status={<>Wire length: <b>{tree.total}</b> · pins only: {base} · best possible here: {best.total}. Click empty grid points to add junctions.</>}
      tone={tone}
    >
      <div className="az-fig-well" style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${S} ${S}`} className="az-fig-svg" style={{ maxWidth: 420 }} role="group" aria-label="Grid with pins to connect">
          {Array.from({ length: GRID }, (_, x) => Array.from({ length: GRID }, (__, y) => {
            const p = [x, y];
            if (PINS.some(q => key(q) === key(p))) return null;
            const on = extra.some(q => key(q) === key(p));
            const [cx, cy] = at(p);
            return (
              <g key={key(p)} {...svgButton(() => toggle(p), `Junction at ${x}, ${y}`, on)}>
                <circle cx={cx} cy={cy} r={12} fill="transparent" />
                <circle className="az-fig-node" cx={cx} cy={cy} r={on ? 6 : 2.5} fill={on ? 'var(--fig-ink)' : 'var(--fig-line-strong)'} />
              </g>
            );
          }))}
          {tree.edges.map(([i, j]) => {
            const [x1, y1] = at(points[i]);
            const [x2, y2] = at(points[j]);
            return <path key={`${i}-${j}`} d={`M${x1},${y1} L${x2},${y1} L${x2},${y2}`} fill="none" stroke="var(--fig-accent)" strokeWidth={3} strokeLinejoin="round" />;
          })}
          {PINS.map(p => {
            const [cx, cy] = at(p);
            return <rect key={key(p)} x={cx - 9} y={cy - 9} width={18} height={18} rx={3} fill="var(--fig-accent)" />;
          })}
        </svg>
      </div>
    </Figure>
  );
}
