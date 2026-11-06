import React, { useState } from 'react';
import { Figure, Playback, Segmented, usePlayback } from './figure';

/* ── Subset Sum: search for a zero-sum group vs check one ──
   The only negative number sits last, so a search that counts
   upward through subsets must pass 2^(n−1) of them first. */

const POOL = [13, 27, 8, 41, 19, 6, 33, 22, 15, 38, 11, 29, 17, 35, 24];
const FRAMES = 70;

const sumOf = (values, mask) => values.reduce((s, v, i) => (mask & (1 << i) ? s + v : s), 0);
const members = (mask, n) => Array.from({ length: n }, (_, i) => i).filter(i => mask & (1 << i));

function init(n) {
  const values = POOL.slice(0, n - 1);
  values.push(-(values[1] + values[3] + values[n - 3]));
  let cert = 1;
  while (sumOf(values, cert) !== 0) cert++;
  return { n, values, cert, batch: Math.ceil(cert / FRAMES), mask: 0, tried: 0, found: false, checked: 0 };
}

const certSize = s => members(s.cert, s.n).length;
const isDone = s => s.found && s.checked >= certSize(s);

function step(s) {
  let { mask, tried, found } = s;
  for (let b = 0; b < s.batch && !found; b++) {
    mask++; tried++;
    if (sumOf(s.values, mask) === 0) found = true;
  }
  return { ...s, mask, tried, found, checked: Math.min(s.checked + 1, certSize(s)) };
}

const fmt = n => n.toLocaleString('en-US');

function Numbers({ values, active }) {
  return (
    <div className="az-race__nums">
      {values.map((v, i) => <span key={i} className="az-fig-token" data-on={String(active.has(i))}>{v}</span>)}
    </div>
  );
}

export default function SolveVsVerify() {
  const [s, set] = useState(() => init(8));
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 45);
  const load = n => { stop(); set(init(n)); };

  const cert = members(s.cert, s.n);
  const started = s.tried > 0;

  let status = <>Find a group of numbers that adds up to <b>0</b></>;
  if (started && !s.found) status = <>Searching… <b>{fmt(s.tried)}</b> of {fmt(2 ** s.n - 1)} subsets checked</>;
  if (s.found) status = <>Found and verified. Search: <b>{fmt(s.tried)}</b> subsets · check: <b>{cert.length}</b> additions</>;

  return (
    <Figure
      title="Solving vs verifying"
      tools={<Segmented label="How many numbers" value={s.n} onChange={load} options={[8, 12, 16].map(n => ({ value: n, label: `${n} numbers` }))} />}
      status={status}
      tone={s.found ? 'good' : undefined}
    >
      <div className="az-fig-pair">
        <div className="az-fig-pane">
          <div className="az-fig-pane__head">
            <span className="az-fig-label">Solver</span>
            <span className="az-fig-pane__meta">{fmt(s.tried)} subsets tried</span>
          </div>
          <div className="az-fig-well az-race">
            <Numbers values={s.values} active={new Set(members(s.mask, s.n))} />
            <span className="az-race__sum">sum = {started ? sumOf(s.values, s.mask) : '–'}</span>
          </div>
        </div>
        <div className="az-fig-pane">
          <div className="az-fig-pane__head">
            <span className="az-fig-label">Verifier</span>
            <span className="az-fig-pane__meta">{s.checked} additions</span>
          </div>
          <div className="az-fig-well az-race">
            <Numbers values={s.values} active={new Set(started ? cert.slice(0, s.checked) : [])} />
            <span className="az-race__sum">sum = {started ? cert.slice(0, s.checked).reduce((a, i) => a + s.values[i], 0) : '–'}</span>
          </div>
        </div>
      </div>

      <Playback
        onReset={() => load(s.n)}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={toggle}
        done={isDone(s)}
      />
    </Figure>
  );
}
