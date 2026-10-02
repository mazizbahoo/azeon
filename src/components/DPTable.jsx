import React, { useState } from 'react';
import { Figure, Playback, Segmented, usePlayback } from './figure';

/* ── Knapsack by dynamic programming ────────────────────────
   best[i][c] = best value using the first i items with capacity c.
   Each cell looks at most two cells in the row above. The table
   has (n + 1) × (W + 1) cells, so its width grows with the VALUE
   of W, not with how many digits W has. */

const ITEMS = [{ name: 'A', w: 2, v: 3 }, { name: 'B', w: 3, v: 4 }, { name: 'C', w: 4, v: 5 }, { name: 'D', w: 5, v: 6 }];
const W = 8;
const ROWS = ITEMS.length + 1;
const COLS = W + 1;

function fullTable() {
  const t = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let i = 1; i < ROWS; i++) {
    const { w, v } = ITEMS[i - 1];
    for (let c = 0; c < COLS; c++) t[i][c] = Math.max(t[i - 1][c], c >= w ? t[i - 1][c - w] + v : -1);
  }
  return t;
}
const TABLE = fullTable();
const TOTAL = (ROWS - 1) * COLS;

const init = () => ({ k: 0 });
const step = s => ({ k: Math.min(TOTAL, s.k + 1) });
const isDone = s => s.k >= TOTAL;

export default function DPTable() {
  const [s, set] = useState(init);
  const [scale, setScale] = useState(1);
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 260);

  const filled = (i, c) => i === 0 || (i - 1) * COLS + c < s.k;
  const cur = s.k > 0 && !isDone(s) ? { i: Math.floor((s.k - 1) / COLS) + 1, c: (s.k - 1) % COLS } : null;
  const deps = cur ? [[cur.i - 1, cur.c], ...(cur.c >= ITEMS[cur.i - 1].w ? [[cur.i - 1, cur.c - ITEMS[cur.i - 1].w]] : [])] : [];
  const isDep = (i, c) => deps.some(([a, b]) => a === i && b === c);

  const cells = (ITEMS.length + 1) * (W * scale + 1);
  let status = <>Press <b>Step</b> to fill the table one cell at a time</>;
  if (cur) {
    const { name, w, v } = ITEMS[cur.i - 1];
    status = <>Row {name}, capacity {cur.c}: {cur.c >= w
      ? <>best of skipping {name} ({TABLE[cur.i - 1][cur.c]}) or taking it ({TABLE[cur.i - 1][cur.c - w]} + {v})</>
      : <>{name} weighs {w}, too heavy, so copy {TABLE[cur.i - 1][cur.c]} from above</>} = <b>{TABLE[cur.i][cur.c]}</b></>;
  }
  if (isDone(s)) status = <>Best value with capacity {W}: <b>{TABLE[ROWS - 1][W]}</b>, after filling {TOTAL} cells</>;

  return (
    <Figure
      title="Filling the knapsack table"
      tools={<Segmented label="Scale the weights" value={scale} onChange={setScale}
        options={[1, 10, 100, 1000].map(x => ({ value: x, label: `weights × ${x}` }))} />}
      status={status}
      tone={isDone(s) ? 'good' : undefined}
    >
      <div style={{ overflowX: 'auto' }}>
        <table className="az-fig-table" style={{ minWidth: 420 }}>
          <thead>
            <tr>
              <th>Item (w, v)</th>
              {Array.from({ length: COLS }, (_, c) => <th key={c} style={{ textAlign: 'center' }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {TABLE.map((row, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }}>{i === 0 ? 'none' : `${ITEMS[i - 1].name} (${ITEMS[i - 1].w}, ${ITEMS[i - 1].v})`}</td>
                {row.map((val, c) => {
                  const here = cur && cur.i === i && cur.c === c;
                  const dep = isDep(i, c);
                  return (
                    <td key={c} style={{
                      textAlign: 'center', fontWeight: here ? 700 : 400,
                      color: here ? 'var(--fig-accent)' : filled(i, c) ? 'var(--fig-ink)' : 'transparent',
                      background: here ? 'var(--fig-accent-soft)' : dep ? 'var(--fig-well)' : undefined,
                      boxShadow: dep ? 'inset 0 0 0 1.5px var(--fig-accent)' : undefined,
                    }}>{filled(i, c) || here ? val : '·'}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="az-fig-formula">
        with weights × {scale}: capacity {(W * scale).toLocaleString('en-US')}, so the table needs {cells.toLocaleString('en-US')} cells
      </div>
      <Playback onReset={() => { stop(); set(init()); }} onStep={() => set(step)} playing={playing} onTogglePlay={toggle} done={isDone(s)} />
    </Figure>
  );
}
