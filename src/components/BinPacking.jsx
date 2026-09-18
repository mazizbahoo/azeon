import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── Bin packing: jobs onto servers of capacity 10 ──────────
   First Fit takes jobs in arrival order; First Fit Decreasing
   sorts biggest first. Sum of sizes / capacity is a lower bound
   on the number of servers any method can use. */

const CAP = 10;
const JOBS = [2, 5, 4, 7, 1, 3, 8, 2, 6, 2];

function firstFit(items) {
  const bins = [];
  items.forEach((x, k) => {
    const b = bins.find(bin => bin.reduce((s, it) => s + it.size, 0) + x <= CAP);
    const item = { size: x, k };
    if (b) b.push(item); else bins.push([item]);
  });
  return bins;
}

const ORDERS = {
  ff: { label: 'Arrival order', items: JOBS },
  ffd: { label: 'Biggest first', items: [...JOBS].sort((a, b) => b - a) },
};

const H = 200;

export default function BinPacking() {
  const [mode, setMode] = useState('ff');
  const bins = firstFit(ORDERS[mode].items);
  const total = JOBS.reduce((s, x) => s + x, 0);
  const bound = Math.ceil(total / CAP);
  const waste = bins.length * CAP - total;

  return (
    <Figure
      title="Pack jobs onto servers"
      tools={<Segmented label="Order" value={mode} onChange={setMode}
        options={Object.entries(ORDERS).map(([value, o]) => ({ value, label: o.label }))} />}
      status={<>Servers used: <b>{bins.length}</b> · capacity wasted: {waste} · no method can use fewer than {bound}</>}
      tone={bins.length === bound ? 'good' : undefined}
    >
      <div className="az-fig-formula">jobs in {mode === 'ff' ? 'arrival' : 'sorted'} order: {ORDERS[mode].items.join(', ')} · each server holds {CAP}</div>
      <div className="az-fig-well" style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: 14, alignItems: 'flex-end' }}>
        {bins.map((bin, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 54, height: H, border: '1px solid var(--fig-line-strong)', borderRadius: 8, display: 'flex',
              flexDirection: 'column-reverse', padding: 2, gap: 2, background: 'var(--fig-bg)' }}>
              {bin.map(it => (
                <div key={it.k} style={{ height: `calc(${(it.size / CAP) * 100}% - 2px)`, background: 'var(--fig-accent-soft)',
                  border: '1px solid var(--fig-accent)', borderRadius: 5, color: 'var(--fig-accent)', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.size}</div>
              ))}
            </div>
            <span className="az-fig-pane__meta">server {i + 1}</span>
          </div>
        ))}
      </div>
    </Figure>
  );
}
