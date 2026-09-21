import React, { useState } from 'react';
import { Button, Figure } from './figure';

/* ── Currency arbitrage as a negative cycle ─────────────────
   Made-up exchange rates with a small fee built in, plus one
   deliberately mispriced rate (EUR → GBP). A loop whose rates
   multiply to more than 1 makes money. Bellman–Ford finds one
   in polynomial time using weights −log(rate). */

const CUR = ['USD', 'EUR', 'GBP', 'JPY'];
const VALUE = [1, 1.09, 1.27, 0.0068]; // made-up values in USD
const FEE = 0.998;
const RATE = CUR.map((_, i) => CUR.map((__, j) => (i === j ? 1 : (VALUE[i] / VALUE[j]) * FEE)));
RATE[1][2] = 0.87; // the mispriced quote

function bellmanFord() {
  const n = CUR.length;
  const w = (i, j) => -Math.log(RATE[i][j]);
  const dist = Array(n).fill(0);
  const prev = Array(n).fill(-1);
  let last = -1;
  for (let k = 0; k < n; k++) {
    last = -1;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i !== j && dist[i] + w(i, j) < dist[j] - 1e-12) { dist[j] = dist[i] + w(i, j); prev[j] = i; last = j; }
    }
  }
  if (last < 0) return null;
  let v = last;
  for (let k = 0; k < n; k++) v = prev[v];
  const cycle = [v];
  for (let u = prev[v]; u !== v; u = prev[u]) cycle.push(u);
  cycle.push(v);
  return cycle.reverse();
}

const fmt = (x, cur) => `${x.toLocaleString('en-US', { maximumFractionDigits: cur === 'JPY' ? 0 : 2, minimumFractionDigits: cur === 'JPY' ? 0 : 2 })} ${cur}`;

export default function ArbitrageCycle() {
  const [path, setPath] = useState([0]);
  const add = i => setPath(p => (p[p.length - 1] === i ? p : [...p, i]));

  const amounts = path.reduce((acc, c, k) => (k === 0 ? [1000] : [...acc, acc[k - 1] * RATE[path[k - 1]][c]]), []);
  const closed = path.length > 2 && path[path.length - 1] === path[0];
  const final = amounts[amounts.length - 1];

  let status = <>Start with 1,000 {CUR[path[0]]}. Click currencies to trade, and come back to {CUR[path[0]]} to finish the loop.</>;
  let tone;
  if (closed) {
    const gain = (final / 1000 - 1) * 100;
    tone = gain > 0 ? 'good' : 'bad';
    status = <>Back to <b>{fmt(final, CUR[path[0]])}</b>: {gain > 0 ? 'a profit' : 'a loss'} of <b>{Math.abs(gain).toFixed(2)}%</b></>;
  }

  return (
    <Figure
      title="Trading in a loop"
      tools={
        <>
          <Button onClick={() => { const c = bellmanFord(); if (c) setPath(c); }}>Find a profitable loop</Button>
          <Button onClick={() => setPath([path[0]])} disabled={path.length < 2}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {CUR.map((c, i) => (
          <Button key={c} onClick={() => add(i)} disabled={closed}>{c}</Button>
        ))}
      </div>
      <div className="az-fig-well" style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 54 }}>
        {path.map((c, k) => (
          <React.Fragment key={k}>
            {k > 0 && <span style={{ color: 'var(--fig-muted)' }}>→</span>}
            <span className="az-fig-token" data-on={String(k === path.length - 1)}>{fmt(amounts[k], CUR[c])}</span>
          </React.Fragment>
        ))}
      </div>
      <table className="az-fig-table">
        <thead><tr><th>1 unit of</th>{CUR.map(c => <th key={c} style={{ textAlign: 'right' }}>→ {c}</th>)}</tr></thead>
        <tbody>
          {CUR.map((a, i) => (
            <tr key={a}>
              <td>{a}</td>
              {CUR.map((b, j) => (
                <td key={b} style={{ textAlign: 'right', color: i === 1 && j === 2 ? 'var(--fig-accent)' : undefined }}>
                  {i === j ? '–' : RATE[i][j] < 0.01 ? RATE[i][j].toFixed(5) : RATE[i][j].toFixed(4)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Figure>
  );
}
