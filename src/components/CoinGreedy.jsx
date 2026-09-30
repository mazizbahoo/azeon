import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── Greedy change-making vs the true minimum ───────────────
   Greedy: always hand over the biggest coin that still fits.
   Best: dynamic programming over every amount up to the target. */

const SYSTEMS = {
  std: { label: '1, 2, 5, 10, 20, 50', coins: [1, 2, 5, 10, 20, 50] },
  odd: { label: '1, 3, 4', coins: [1, 3, 4] },
  odd2: { label: '1, 10, 25', coins: [1, 10, 25] },
};

function greedy(coins, amount) {
  const out = [];
  let left = amount;
  [...coins].sort((a, b) => b - a).forEach(c => { while (left >= c) { out.push(c); left -= c; } });
  return out;
}

function best(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  const from = Array(amount + 1).fill(0);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) coins.forEach(c => { if (c <= a && dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; from[a] = c; } });
  const out = [];
  for (let a = amount; a > 0; a -= from[a]) out.push(from[a]);
  return out.sort((x, y) => y - x);
}

function Coins({ label, list, bad }) {
  return (
    <div className="az-fig-pane">
      <div className="az-fig-pane__head"><span className="az-fig-label">{label}</span><span className="az-fig-pane__meta">{list.length} coin{list.length === 1 ? '' : 's'}</span></div>
      <div className="az-fig-well" style={{ padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 52 }}>
        {list.map((c, i) => (
          <span key={i} className="az-fig-token" data-bad={String(bad)} style={{ borderRadius: 999, minWidth: 34 }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

export default function CoinGreedy() {
  const [sys, setSys] = useState('odd');
  const [amount, setAmount] = useState(6);
  const coins = SYSTEMS[sys].coins;
  const g = greedy(coins, amount);
  const b = best(coins, amount);
  const worse = g.length > b.length;

  return (
    <Figure
      title="Making change"
      tools={<Segmented label="Coins" value={sys} onChange={setSys}
        options={Object.entries(SYSTEMS).map(([value, s]) => ({ value, label: s.label }))} />}
      status={worse
        ? <>Greedy uses <b>{g.length}</b> coins, but <b>{b.length}</b> is possible</>
        : <>Greedy uses <b>{g.length}</b>: as few as possible</>}
      tone={worse ? 'bad' : 'good'}
    >
      <div className="az-rt__input">
        <label className="az-fig-label" htmlFor="az-coin-amt">Amount</label>
        <input id="az-coin-amt" className="az-fig-range" type="range" min={1} max={99} value={amount} onChange={e => setAmount(+e.target.value)} />
        <span className="az-rt__n">{amount}</span>
      </div>
      <div className="az-fig-pair">
        <Coins label="Greedy" list={g} bad={worse} />
        <Coins label="Fewest possible" list={b} bad={false} />
      </div>
    </Figure>
  );
}
