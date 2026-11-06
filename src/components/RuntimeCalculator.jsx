import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── Running time at input size n (all maths in log10) ──── */

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[+d]).join('');
const log10Fact = n => { let s = 0; for (let k = 2; k <= n; k++) s += Math.log10(k); return s; };

const ROWS = [
  { label: 'n', log: n => Math.log10(n) },
  { label: 'n²', log: n => 2 * Math.log10(n) },
  { label: 'n³', log: n => 3 * Math.log10(n) },
  { label: '2ⁿ', log: n => n * Math.log10(2), exp: true },
  { label: 'n!', log: log10Fact, exp: true },
];

const YEAR = Math.log10(3.156e7);
const UNIVERSE = Math.log10(4.35e17);
const MIN = -9;
const MAX = 30;
const pct = l => `${((Math.min(Math.max(l, MIN), MAX) - MIN) / (MAX - MIN)) * 100}%`;
const MARKS = [{ at: 0, label: '1 sec' }, { at: YEAR, label: '1 year' }, { at: UNIVERSE, label: 'Age of universe' }];

function duration(l) {
  if (l < -9) return '< 1 ns';
  if (l < -6) return `${Math.round(10 ** (l + 9))} ns`;
  if (l < -3) return `${Math.round(10 ** (l + 6))} µs`;
  if (l < 0) return `${Math.round(10 ** (l + 3))} ms`;
  const s = 10 ** l;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
  if (l < YEAR) return `${Math.round(s / 86400)} days`;
  const y = l - YEAR;
  if (y < 6) return `${Math.round(10 ** y).toLocaleString('en-US')} years`;
  if (l < UNIVERSE) return `${(10 ** (y - Math.floor(y))).toFixed(1)} × 10${sup(Math.floor(y))} years`;
  const u = l - UNIVERSE;
  return u < 3 ? `${Math.round(10 ** u).toLocaleString('en-US')} × universe age` : `10${sup(Math.floor(u))} × universe age`;
}

export default function RuntimeCalculator() {
  const [n, setN] = useState(50);
  const [speed, setSpeed] = useState(9);

  return (
    <Figure
      title="How long would it take?"
      tools={
        <Segmented label="Computer" value={speed} onChange={setSpeed}
          options={[{ value: 9, label: 'Laptop' }, { value: 18, label: 'Supercomputer' }]} />
      }
      status={<>n = <b>{n}</b> · {speed === 9 ? '10⁹' : '10¹⁸'} steps per second</>}
    >
      <div className="az-rt__input">
        <label className="az-fig-label" htmlFor="az-rt-n">Input size</label>
        <input id="az-rt-n" className="az-fig-range" type="range" min={1} max={300} value={n} onChange={e => setN(+e.target.value)} />
        <span className="az-rt__n">{n}</span>
      </div>

      <div className="az-rt">
        <div className="az-rt__scale" aria-hidden="true">
          {MARKS.map(m => <span key={m.label} style={{ left: pct(m.at) }}>{m.label}</span>)}
        </div>
        {ROWS.map(r => {
          const sec = r.log(n) - speed;
          return (
            <div key={r.label} className="az-rt__row" data-exp={String(!!r.exp)}>
              <span className="az-rt__label">{r.label}</span>
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
