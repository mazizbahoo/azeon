import React, { useMemo, useState } from 'react';
import { Button, Figure } from './figure';

/* ── Crew pairing as set partitioning ───────────────────────
   Every flight must be covered by exactly one chosen pairing.
   Costs are made-up units. "Cheapest" tries every combination. */

const FLIGHTS = ['LHE→KHI', 'KHI→LHE', 'LHE→ISB', 'ISB→LHE', 'KHI→ISB', 'ISB→KHI'];
const PAIRINGS = [
  { id: 'A', flights: [0, 1], cost: 5 },
  { id: 'B', flights: [2, 3], cost: 5 },
  { id: 'C', flights: [4, 5], cost: 6 },
  { id: 'D', flights: [0, 4, 3], cost: 8 },
  { id: 'E', flights: [2, 5, 1], cost: 8 },
  { id: 'F', flights: [0, 1, 2, 3], cost: 9 },
  { id: 'G', flights: [2, 5, 4, 3], cost: 11 },
];

const coverCount = sel => FLIGHTS.map((_, f) => sel.filter(i => PAIRINGS[i].flights.includes(f)).length);
const costOf = sel => sel.reduce((s, i) => s + PAIRINGS[i].cost, 0);

function cheapest() {
  let best = null;
  for (let m = 1; m < 1 << PAIRINGS.length; m++) {
    const sel = PAIRINGS.map((_, i) => i).filter(i => m & (1 << i));
    if (coverCount(sel).every(c => c === 1) && (!best || costOf(sel) < costOf(best))) best = sel;
  }
  return best;
}

export default function CrewPairing() {
  const [sel, setSel] = useState([]);
  const best = useMemo(cheapest, []);
  const counts = coverCount(sel);
  const toggle = i => setSel(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]));

  const missing = counts.filter(c => c === 0).length;
  const doubled = counts.filter(c => c > 1).length;
  const cost = costOf(sel);

  let status = <>Choose pairings so every flight is flown by exactly one crew</>;
  let tone;
  if (doubled) { tone = 'bad'; status = <><b>{doubled}</b> flight{doubled > 1 ? 's have' : ' has'} two crews. One of them would be riding as passengers.</>; }
  else if (sel.length && missing) status = <>Cost so far <b>{cost}</b> · {missing} flight{missing > 1 ? 's' : ''} still uncovered</>;
  else if (sel.length) {
    tone = cost === costOf(best) ? 'good' : undefined;
    status = cost === costOf(best)
      ? <>Every flight covered once, for <b>{cost}</b>. That's the cheapest possible.</>
      : <>Every flight covered once, for <b>{cost}</b>. The cheapest possible is {costOf(best)}.</>;
  }

  return (
    <Figure
      title="Cover every flight once"
      tools={
        <>
          <Button onClick={() => setSel(best)}>Cheapest</Button>
          <Button onClick={() => setSel([])} disabled={!sel.length}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {FLIGHTS.map((f, i) => (
          <span key={f} className="az-fig-token" data-on={String(counts[i] === 1)} data-bad={String(counts[i] > 1)} style={{ minWidth: 86 }}>
            {f}
          </span>
        ))}
      </div>
      <table className="az-fig-table">
        <thead><tr><th>Pairing</th><th>Flights, in order</th><th style={{ textAlign: 'right' }}>Cost</th></tr></thead>
        <tbody>
          {PAIRINGS.map((p, i) => (
            <tr key={p.id} data-on={String(sel.includes(i))} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
              <td>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={sel.includes(i)} onChange={() => toggle(i)} onClick={e => e.stopPropagation()}
                    style={{ marginRight: 8, accentColor: 'var(--fig-accent)' }} />
                  {p.id}
                </label>
              </td>
              <td>{p.flights.map(f => FLIGHTS[f]).join(', ')}</td>
              <td style={{ textAlign: 'right' }}>{p.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Figure>
  );
}
