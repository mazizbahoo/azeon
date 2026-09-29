import React, { useMemo, useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── An FPTAS for knapsack: round values, then solve exactly ─
   Scale every value down by K = ε · (largest value) / n and drop
   the fraction. Solve the rounded problem exactly with dynamic
   programming over total value. The answer is guaranteed to be
   worth at least (1 − ε) × the true optimum. Smaller ε: bigger
   table, tighter guarantee. */

const ITEMS = [[15, 583], [22, 484], [28, 509], [29, 310], [27, 486], [15, 565], [35, 350], [22, 558], [10, 390], [30, 512]];
const CAP = 100;
const N = ITEMS.length;

function optimum() {
  let best = 0;
  for (let m = 0; m < 1 << N; m++) {
    let w = 0;
    let v = 0;
    for (let i = 0; i < N; i++) if (m & (1 << i)) { w += ITEMS[i][0]; v += ITEMS[i][1]; }
    if (w <= CAP && v > best) best = v;
  }
  return best;
}

function fptas(eps) {
  const vmax = Math.max(...ITEMS.map(x => x[1]));
  const K = (eps * vmax) / N;
  const sv = ITEMS.map(x => Math.floor(x[1] / K));
  const V = sv.reduce((a, b) => a + b, 0);
  // dp[v] = least weight that reaches rounded value exactly v
  let dp = Array(V + 1).fill(Infinity);
  let pick = Array.from({ length: V + 1 }, () => []);
  dp[0] = 0;
  ITEMS.forEach(([w], i) => {
    const nd = dp.slice();
    const np = pick.slice();
    for (let v = V; v >= sv[i]; v--) {
      if (dp[v - sv[i]] + w < nd[v]) { nd[v] = dp[v - sv[i]] + w; np[v] = [...pick[v - sv[i]], i]; }
    }
    dp = nd; pick = np;
  });
  let best = 0;
  for (let v = V; v >= 0; v--) if (dp[v] <= CAP) { best = v; break; }
  const chosen = pick[best];
  return { K, sv, cells: N * (V + 1), chosen, value: chosen.reduce((s, i) => s + ITEMS[i][1], 0) };
}

const EPS = [0.9, 0.5, 0.25, 0.1, 0.05];

export default function FPTASKnapsack() {
  const [eps, setEps] = useState(0.5);
  const opt = useMemo(optimum, []);
  const r = useMemo(() => fptas(eps), [eps]);

  return (
    <Figure
      title="Trade accuracy for time"
      tools={<Segmented label="ε" value={eps} onChange={setEps} options={EPS.map(e => ({ value: e, label: `ε = ${e}` }))} />}
      status={<>Found <b>{r.value}</b> ({((r.value / opt) * 100).toFixed(1)}% of the best, {opt}) · guaranteed at least <b>{Math.ceil((1 - eps) * opt)}</b> · table size {r.cells.toLocaleString('en-US')} cells</>}
      tone={r.value === opt ? 'good' : undefined}
    >
      <table className="az-fig-table">
        <thead>
          <tr><th>Item</th><th style={{ textAlign: 'right' }}>Weight</th><th style={{ textAlign: 'right' }}>Value</th><th style={{ textAlign: 'right' }}>Rounded value</th></tr>
        </thead>
        <tbody>
          {ITEMS.map(([w, v], i) => (
            <tr key={i} data-on={String(r.chosen.includes(i))}>
              <td>{i + 1}</td>
              <td style={{ textAlign: 'right' }}>{w}</td>
              <td style={{ textAlign: 'right' }}>{v}</td>
              <td style={{ textAlign: 'right' }}>{r.sv[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="az-fig-formula">bag holds {CAP} · values divided by K = {r.K.toFixed(1)} and rounded down</div>
    </Figure>
  );
}
