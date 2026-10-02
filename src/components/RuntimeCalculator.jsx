import React, { useState } from 'react';
import { Cpu, Laptop, Timer } from 'lucide-react';
import { Figure, Note, Segmented } from './figure';

/* ── Running time at a given input size (Post 6) ───────────
   Everything is computed in log10 so 2^300 and 300! never
   overflow. */

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[+d]).join('');

const log10Fact = n => { let s = 0; for (let k = 2; k <= n; k++) s += Math.log10(k); return s; };

const ROWS = [
  { key: 'n', label: 'n', kind: 'poly', color: 'var(--az-c1)', log: n => Math.log10(n) },
  { key: 'n2', label: 'n²', kind: 'poly', color: 'var(--az-c2)', log: n => 2 * Math.log10(n) },
  { key: 'n3', label: 'n³', kind: 'poly', color: 'var(--az-c3)', log: n => 3 * Math.log10(n) },
  { key: '2n', label: '2ⁿ', kind: 'exp', color: 'var(--az-c6)', log: n => n * Math.log10(2) },
  { key: 'nf', label: 'n!', kind: 'exp', color: 'var(--az-c7)', log: log10Fact },
];

const MACHINES = [
  { value: 9, label: 'Laptop', sub: '10⁹ steps/s', icon: Laptop },
  { value: 18, label: 'Supercomputer', sub: '10¹⁸ steps/s', icon: Cpu },
];

const PRESETS = [10, 20, 50, 100, 300];

const YEAR = Math.log10(3.156e7);
const UNIVERSE = Math.log10(4.35e17); // age of the universe in seconds

// Bar spans 1 ns … 10^30 s; anything beyond overflows (drawn striped).
const MIN = -9;
const MAX = 30;
const pct = l => `${((Math.min(Math.max(l, MIN), MAX) - MIN) / (MAX - MIN)) * 100}%`;
const MARKS = [
  { at: 0, label: '1 second' },
  { at: YEAR, label: '1 year' },
  { at: UNIVERSE, label: 'Age of universe' },
];

function count(log) {
  if (log < 6) return Math.round(10 ** log).toLocaleString('en-US');
  const e = Math.floor(log);
  return `${(10 ** (log - e)).toFixed(1)} × 10${sup(e)}`;
}

function duration(logSec) {
  if (logSec < -9) return '< 1 ns';
  if (logSec < -6) return `${Math.round(10 ** (logSec + 9))} ns`;
  if (logSec < -3) return `${Math.round(10 ** (logSec + 6))} µs`;
  if (logSec < 0) return `${Math.round(10 ** (logSec + 3))} ms`;
  const s = 10 ** logSec;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${(s / 60).toFixed(0)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
  if (logSec < YEAR) return `${(s / 86400).toFixed(0)} days`;
  const logYears = logSec - YEAR;
  if (logYears < 6) return `${Math.round(10 ** logYears).toLocaleString('en-US')} years`;
  if (logSec < UNIVERSE) return `${count(logYears)} years`;
  const times = logSec - UNIVERSE;
  return times < 3
    ? `${Math.round(10 ** times).toLocaleString('en-US')}× the age of the universe`
    : `10${sup(Math.floor(times))}× the age of the universe`;
}

export default function RuntimeCalculator() {
  const [n, setN] = useState(50);
  const [speed, setSpeed] = useState(9);

  const rows = ROWS.map(r => {
    const steps = r.log(n);
    return { ...r, steps, sec: steps - speed };
  });
  const exp = rows.find(r => r.key === '2n');
  const cube = rows.find(r => r.key === 'n3');

  let tone;
  let note;
  if (exp.sec < 0) {
    note = <>At n = {n}, everything finishes in under a second. Small inputs make every algorithm look fast. This is the trap.</>;
  } else if (exp.sec < UNIVERSE) {
    tone = 'no';
    note = <>At n = {n}, n³ takes <em>{duration(cube.sec)}</em> but 2ⁿ takes <em>{duration(exp.sec)}</em>. Same input, same computer.</>;
  } else {
    tone = 'no';
    note = <>At n = {n}, n³ still finishes in <em>{duration(cube.sec)}</em>. 2ⁿ needs <em>{duration(exp.sec)}</em>{speed === 9 ? '. Switching to a supercomputer a billion times faster barely dents it.' : ', even on a machine a billion times faster than a laptop.'}</>;
  }

  return (
    <Figure
      icon={Timer}
      kicker="Polynomial vs exponential"
      title="How long would it take?"
      tools={
        <Segmented
          label="Computer speed"
          value={speed}
          onChange={setSpeed}
          options={MACHINES.map(m => ({ value: m.value, label: `${m.label} · ${m.sub}`, icon: m.icon }))}
        />
      }
      caption="Bars are on a logarithmic scale: every grid step is 10× longer. A faster computer only shifts every bar left by the same amount; it cannot change their shape."
    >
      <div className="az-runtime__input">
        <label htmlFor="az-runtime-n" className="az-viz-field__label">Input size</label>
        <span className="az-runtime__n">n = {n}</span>
        <input
          id="az-runtime-n"
          type="range"
          min={1}
          max={300}
          value={n}
          onChange={e => setN(+e.target.value)}
          className="az-viz-range"
        />
        <div className="az-viz-segment">
          {PRESETS.map(p => (
            <button key={p} type="button" className={'az-viz-btn' + (p === n ? ' az-viz-btn--on' : '')} onClick={() => setN(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="az-viz__stage az-runtime">
        <div className="az-runtime__scale" aria-hidden="true">
          {MARKS.map(m => (
            <span key={m.label} className="az-runtime__mark" style={{ left: pct(m.at) }}>{m.label}</span>
          ))}
        </div>
        {rows.map(r => (
          <div key={r.key} className="az-runtime__row" style={{ '--bar': r.color }}>
            <span className="az-runtime__label">{r.label}</span>
            <div className="az-runtime__track">
              {MARKS.map(m => <span key={m.label} className="az-runtime__tick" style={{ left: pct(m.at) }} />)}
              <div className="az-runtime__bar" data-overflow={String(r.sec > MAX)} style={{ width: pct(r.sec) }} />
            </div>
            <span className="az-runtime__value">
              <span className="az-runtime__time" data-kind={r.kind}>{duration(r.sec)}</span>
              <span className="az-runtime__steps">{count(r.steps)} steps</span>
            </span>
          </div>
        ))}
      </div>

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
