import React, { useMemo, useState } from 'react';
import { Button, Figure } from './figure';

/* ── Knapsack: pack a bag with a weight limit ───────────────
   0/1 mode: items are all-or-nothing, and the items are chosen
   so that "best value per kg first" (greedy) loses.
   fractional mode: you may take part of an item, and the same
   greedy rule becomes optimal. */

const ITEMS = [
  { name: 'Tent', w: 6, v: 30 },
  { name: 'Sleeping bag', w: 5, v: 24 },
  { name: 'Food box', w: 5, v: 24 },
  { name: 'Water', w: 1, v: 3 },
  { name: 'Jacket', w: 2, v: 5 },
];
const CAP = 10;
const BY_RATIO = ITEMS.map((_, i) => i).sort((a, b) => ITEMS[b].v / ITEMS[b].w - ITEMS[a].v / ITEMS[a].w);

const total = (sel, key) => sel.reduce((s, f, i) => s + f * ITEMS[i][key], 0);
const round = x => Math.round(x * 100) / 100;

function greedy(fractional) {
  const sel = ITEMS.map(() => 0);
  let room = CAP;
  BY_RATIO.forEach(i => {
    if (ITEMS[i].w <= room) { sel[i] = 1; room -= ITEMS[i].w; }
    else if (fractional && room > 0) { sel[i] = room / ITEMS[i].w; room = 0; }
  });
  return sel;
}

function bestWhole() {
  let top = null;
  let topV = -1;
  for (let mask = 0; mask < 1 << ITEMS.length; mask++) {
    const sel = ITEMS.map((_, i) => (mask & (1 << i) ? 1 : 0));
    if (total(sel, 'w') <= CAP && total(sel, 'v') > topV) { topV = total(sel, 'v'); top = sel; }
  }
  return top;
}

export default function KnapsackPacker({ fractional = false }) {
  const [sel, setSel] = useState(() => ITEMS.map(() => 0));
  const optimal = useMemo(() => (fractional ? greedy(true) : bestWhole()), [fractional]);
  const optV = round(total(optimal, 'v'));
  const wholeV = useMemo(() => total(bestWhole(), 'v'), []);

  const w = round(total(sel, 'w'));
  const v = round(total(sel, 'v'));
  const over = w > CAP + 1e-9;
  const toggle = i => setSel(s => s.map((f, j) => (j === i ? (f > 0 ? 0 : 1) : f)));

  let status = <>Click items to pack them. Limit: <b>{CAP} kg</b>{fractional ? '. You may take part of an item.' : ''}</>;
  let tone;
  if (over) { tone = 'bad'; status = <><b>Too heavy</b>: {w} kg in a {CAP} kg bag</>; }
  else if (w) {
    const best = v >= optV - 1e-9;
    tone = best ? 'good' : undefined;
    status = best
      ? <>Value <b>{v}</b> in {w} kg. Nothing beats this{fractional ? <>, and the best with whole items only is {wholeV}</> : ''}.</>
      : <>Value <b>{v}</b> in {w} kg · the best possible is {optV}</>;
  }

  return (
    <Figure
      title={fractional ? 'Fractional knapsack' : '0/1 Knapsack'}
      tools={
        <>
          <Button onClick={() => setSel(greedy(fractional))}>Greedy by value per kg</Button>
          {!fractional && <Button onClick={() => setSel(optimal)}>Best</Button>}
          <Button onClick={() => setSel(ITEMS.map(() => 0))} disabled={!w}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <table className="az-fig-table">
        <thead>
          <tr><th>Item</th><th>Weight</th><th>Value</th><th>Value per kg</th>{fractional && <th style={{ textAlign: 'right' }}>Taken</th>}</tr>
        </thead>
        <tbody>
          {ITEMS.map((it, i) => (
            <tr key={it.name} data-on={String(sel[i] > 0)} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
              <td>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={sel[i] > 0} onChange={() => toggle(i)}
                    style={{ marginRight: 8, accentColor: 'var(--fig-accent)' }} onClick={e => e.stopPropagation()} />
                  {it.name}
                </label>
              </td>
              <td>{it.w} kg</td>
              <td>{it.v}</td>
              <td>{(it.v / it.w).toFixed(1)}</td>
              {fractional && <td style={{ textAlign: 'right' }}>{sel[i] === 0 ? '–' : sel[i] === 1 ? 'all' : `${Math.round(sel[i] * 100)}%`}</td>}
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
          {ITEMS.map((it, i) => sel[i] > 0 && (
            <div key={it.name} title={it.name} style={{
              flex: `0 0 calc(${((it.w * sel[i]) / Math.max(CAP, w)) * 100}% - 3px)`,
              background: over ? 'var(--fig-bad-soft)' : 'var(--fig-accent-soft)',
              border: `1px ${sel[i] < 1 ? 'dashed' : 'solid'} ${over ? 'var(--fig-bad)' : 'var(--fig-accent)'}`,
              borderRadius: 6, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: over ? 'var(--fig-bad)' : 'var(--fig-accent)', whiteSpace: 'nowrap', overflow: 'hidden',
            }}>{sel[i] < 1 ? `${Math.round(sel[i] * 100)}% ${it.name}` : it.name}</div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
