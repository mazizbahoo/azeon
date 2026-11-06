import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── The classical skeleton of Shor's algorithm ─────────────
   Powers of a mod N repeat with some period r. If r is even
   and a^(r/2) ≢ −1, then gcd(a^(r/2) ± 1, N) are factors.
   A quantum computer is only needed to find r for huge N. */

const NS = [15, 21, 33, 35];
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

function period(a, N) {
  let x = a % N;
  let r = 1;
  while (x !== 1) { x = (x * a) % N; r++; }
  return r;
}
const powmod = (a, e, N) => { let r = 1; for (let i = 0; i < e; i++) r = (r * a) % N; return r; };

export default function PeriodFinder() {
  const [N, setN] = useState(15);
  const [a, setA] = useState(7);
  const g = gcd(a, N);

  const pick = n => { setN(n); setA(a < n ? a : 2); };

  let seq = [];
  let r = null;
  let status;
  let tone;
  if (g !== 1) {
    tone = 'good';
    status = <>Lucky guess: gcd({a}, {N}) = <b>{g}</b> is already a factor. {N} = {g} × {N / g}</>;
  } else {
    r = period(a, N);
    seq = Array.from({ length: Math.min(r * 2 + 1, 25) }, (_, x) => powmod(a, x, N));
    if (r % 2 === 1) {
      tone = 'bad';
      status = <>Period r = <b>{r}</b> is odd, so this a doesn't help. Pick another a and try again.</>;
    } else {
      const y = powmod(a, r / 2, N);
      if (y === N - 1) {
        tone = 'bad';
        status = <>Period r = {r}, but {a}^{r / 2} mod {N} = {y} = −1 mod {N}. <b>Unlucky</b>: pick another a.</>;
      } else {
        const p = gcd(y - 1, N);
        const q = gcd(y + 1, N);
        tone = 'good';
        status = <>Period r = <b>{r}</b>. {a}^{r / 2} mod {N} = {y}. gcd({y} − 1, {N}) = <b>{p}</b>, gcd({y} + 1, {N}) = <b>{q}</b>. So {N} = {p} × {q}</>;
      }
    }
  }

  return (
    <Figure
      title="Factoring by finding a period"
      tools={<Segmented label="Number to factor" value={N} onChange={pick} options={NS.map(n => ({ value: n, label: `N = ${n}` }))} />}
      status={status}
      tone={tone}
    >
      <div className="az-rt__input">
        <label className="az-fig-label" htmlFor="az-pf-a">Random guess a</label>
        <input id="az-pf-a" className="az-fig-range" type="range" min={2} max={N - 1} value={a} onChange={e => setA(+e.target.value)} />
        <span className="az-rt__n">{a}</span>
      </div>
      {g === 1 && (
        <div className="az-fig-well" style={{ padding: 12 }}>
          <div className="az-fig-label" style={{ marginBottom: 8 }}>{a}^x mod {N}, for x = 0, 1, 2, …</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {seq.map((v, x) => (
              <span key={x} className="az-fig-token" data-on={String(v === 1)} title={`x = ${x}`}>{v}</span>
            ))}
            {seq.length < r * 2 + 1 && <span className="az-fig-token" data-dim="true">…</span>}
          </div>
        </div>
      )}
    </Figure>
  );
}
