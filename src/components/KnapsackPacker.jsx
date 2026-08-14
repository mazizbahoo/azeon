import React, { useMemo, useState } from 'react';
import { Button, Figure } from './figure';

/* ── 0/1 Knapsack: pack a bag with a weight limit ───────────
   The items are chosen so that "best value per kg first"
   (greedy) loses to the true optimum. */

const ITEMS = [
  { name: 'Tent', w: 6, v: 30 },
  { name: 'Sleeping bag', w: 5, v: 24 },
  { name: 'Food box', w: 5, v: 24 },
  { name: 'Water', w: 1, v: 3 },
  { name: 'Jacket', w: 2, v: 5 },
];
const CAP = 10;

const total = (sel, key) => sel.reduce((s, on, i) => s + (on ? ITEMS[i][key] : 0), 0);

function greedy() {
  const order = ITEMS.map((it, i) => i).sort((a, b) => ITEMS[b].v / ITEMS[b].w - ITEMS[a].v / ITEMS[a].w);
  const sel = ITEMS.map(() => false);
  let room = CAP;
  order.forEach(i => { if (ITEMS[i].w <= room) { sel[i] = true; room -= ITEMS[i].w; } });
  return sel;
}

function best() {
  let top = null;
  let topV = -1;
  for (let mask = 0; mask < 1 << ITEMS.length; mask++) {
    const sel = ITEMS.map((_, i) => !!(mask & (1 << i)));
    if (total(sel, 'w') <= CAP && total(sel, 'v') > topV) { topV = total(sel, 'v'); top = sel; }
  }
  return top;
}

export default function KnapsackPacker() {
  const [sel, setSel] = useState(() => ITEMS.map(() => false));
  const optimal = useMemo(best, []);
  const optV = total(optimal, 'v');

  const w = total(sel, 'w');
  const v = total(sel, 'v');
  const over = w > CAP;
  const toggle = i => setSel(s => s.map((on, j) => (j === i ? !on : on)));

  let status = <>Click items to pack them. Limit: <b>{CAP} kg</b></>;
  let tone;
  if (over) { tone = 'bad'; status = <><b>Too heavy</b>: {w} kg in a {CAP} kg bag</>; }
  else if (w) {
    tone = v === optV ? 'good' : undefined;
    status = v === optV
      ? <>Value <b>{v}</b> in {w} kg. Nothing beats this.</>
      : <>Value <b>{v}</b> in {w} kg · the best possible is {optV}</>;
  }

  return (
    <Figure
      title="0/1 Knapsack"
      tools={
        <>
          <Button onClick={() => setSel(greedy())}>Greedy by value per kg</Button>
          <Button onClick={() => setSel(optimal)}>Best</Button>
          <Button onClick={() => setSel(ITEMS.map(() => false))} disabled={!w}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <table className="az-fig-table">
        <thead>
          <tr><th>Item</th><th>Weight</th><th>Value</th><th>Value per kg</th></tr>
        </thead>
        <tbody>
          {ITEMS.map((it, i) => (
            <tr key={it.name} data-on={String(sel[i])} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
              <td>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={sel[i]} onChange={() => toggle(i)}
                    style={{ marginRight: 8, accentColor: 'var(--fig-accent)' }} onClick={e => e.stopPropagation()} />
                  {it.name}
                </label>
              </td>
              <td>{it.w} kg</td>
              <td>{it.v}</td>
              <td>{(it.v / it.w).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <div className="az-fig-pane__head" style={{ marginBottom: 6 }}>
          <span className="az-fig-label">Bag</span>
          <span className="az-fig-pane__meta">{w} / {CAP} kg</span>
        </div>
        <div className="az-fig-well" style={{ display: 'flex', height: 34, overflow: 'hidden', padding: 3, gap: 3 }}>
          {ITEMS.map((it, i) => sel[i] && (
            <div key={it.name} title={it.name} style={{
              flex: `0 0 calc(${(it.w / Math.max(CAP, w)) * 100}% - 3px)`,
              background: over ? 'var(--fig-bad-soft)' : 'var(--fig-accent-soft)',
              border: `1px solid ${over ? 'var(--fig-bad)' : 'var(--fig-accent)'}`,
              borderRadius: 6, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: over ? 'var(--fig-bad)' : 'var(--fig-accent)', whiteSpace: 'nowrap', overflow: 'hidden',
            }}>{it.name}</div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
