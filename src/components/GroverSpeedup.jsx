import React, { useState } from 'react';
import { Figure } from './figure';

/* ── Brute force vs Grover on n-variable SAT ────────────────
   Classical: 2^n tries. Grover: about (π/4)·2^(n/2) steps.
   Both shown at an optimistic 10^9 steps per second. */

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[+d]).join('');
const YEAR = Math.log10(3.156e7);
const UNIVERSE = Math.log10(4.35e17);
const MIN = -6;
const MAX = 30;
const pct = l => `${((Math.min(Math.max(l, MIN), MAX) - MIN) / (MAX - MIN)) * 100}%`;
const MARKS = [{ at: 0, label: '1 sec' }, { at: YEAR, label: '1 year' }, { at: UNIVERSE, label: 'Age of universe' }];

const big = l => (l < 6 ? Math.round(10 ** l).toLocaleString('en-US') : `${(10 ** (l - Math.floor(l))).toFixed(1)} × 10${sup(Math.floor(l))}`);
function duration(l) {
  if (l < -3) return 'under a millisecond';
  if (l < 0) return `${Math.round(10 ** (l + 3))} ms`;
  if (l < Math.log10(60)) return `${(10 ** l).toFixed(1)} s`;
  if (l < Math.log10(3600)) return `${Math.round(10 ** l / 60)} min`;
  if (l < Math.log10(86400)) return `${(10 ** l / 3600).toFixed(1)} hours`;
  if (l < YEAR) return `${Math.round(10 ** l / 86400)} days`;
  if (l < UNIVERSE) return `${big(l - YEAR)} years`;
  return `${big(l - UNIVERSE)} × universe age`;
}

export default function GroverSpeedup() {
  const [n, setN] = useState(60);
  const rows = [
    { label: 'Classical brute force', short: '2ⁿ', steps: n * Math.log10(2) },
    { label: 'Grover search', short: '√2ⁿ', steps: (n / 2) * Math.log10(2) + Math.log10(Math.PI / 4) },
  ];

  return (
    <Figure
      title="Searching 2ⁿ possibilities"
      status={<>n = <b>{n}</b> variables · 2ⁿ row: brute force, {big(rows[0].steps)} tries · √2ⁿ row: Grover, about {big(rows[1].steps)} steps</>}
    >
      <div className="az-rt__input">
        <label className="az-fig-label" htmlFor="az-gr-n">Variables</label>
        <input id="az-gr-n" className="az-fig-range" type="range" min={10} max={200} value={n} onChange={e => setN(+e.target.value)} />
        <span className="az-rt__n">{n}</span>
      </div>
      <div className="az-rt">
        <div className="az-rt__scale" aria-hidden="true">
          {MARKS.map(m => <span key={m.label} style={{ left: pct(m.at) }}>{m.label}</span>)}
        </div>
        {rows.map(r => {
          const sec = r.steps - 9;
          return (
            <div key={r.label} className="az-rt__row" data-exp="true">
              <span className="az-rt__label" title={r.label}>{r.short}</span>
              <div className="az-rt__track">
                {MARKS.map(m => <i key={m.label} style={{ left: pct(m.at) }} />)}
                <div className="az-rt__bar" data-over={String(sec > MAX)} style={{ width: pct(sec) }} />
              </div>
              <span className="az-rt__time">{duration(sec)}</span>
            </div>
          );
        })}
      </div>
    </Figure>
  );
}
