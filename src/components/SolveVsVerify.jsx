import React, { useState } from 'react';
import { Scale, Search, ShieldCheck } from 'lucide-react';
import { Figure, Note, Playback, Segmented, Stage, Stat, Stats, usePlayback } from './figure';

/* ── Solving vs verifying Subset Sum (Post 9) ───────────────
   One negative number sits last, so any zero-sum subset must
   include it, and a brute-force search that counts upward
   through subsets has to get through 2^(n−1) of them first. */

const POOL = [13, 27, 8, 41, 19, 6, 33, 22, 15, 38, 11, 29, 17, 35, 24];
const SIZES = [8, 12, 16];
const TICKS = 70; // the solver's animation spans about this many frames

function instance(n) {
  const values = POOL.slice(0, n - 1);
  values.push(-(values[1] + values[3] + values[n - 3]));
  return values;
}

const sumOf = (values, mask) => values.reduce((s, v, i) => (mask & (1 << i) ? s + v : s), 0);
const members = (mask, n) => Array.from({ length: n }, (_, i) => i).filter(i => mask & (1 << i));

function firstZero(values) {
  for (let m = 1; m < 2 ** values.length; m++) if (sumOf(values, m) === 0) return m;
  return 0;
}

function init(n) {
  const values = instance(n);
  const cert = firstZero(values);
  return {
    n, values, cert,
    batch: Math.max(1, Math.ceil(cert / TICKS)),
    mask: 0, tried: 0, found: false,
    vStep: 0, vSum: 0,
  };
}

const vDone = s => s.vStep >= members(s.cert, s.n).length;
const isDone = s => s.found && vDone(s);

function step(s) {
  let { mask, tried, found } = s;
  for (let b = 0; b < s.batch && !found; b++) {
    mask += 1;
    tried += 1;
    if (sumOf(s.values, mask) === 0) found = true;
  }
  const certIdx = members(s.cert, s.n);
  const vStep = Math.min(s.vStep + 1, certIdx.length);
  const vSum = certIdx.slice(0, vStep).reduce((a, i) => a + s.values[i], 0);
  return { ...s, mask, tried, found, vStep, vSum };
}

const fmt = n => n.toLocaleString('en-US');

function Numbers({ values, active, tone, done }) {
  return (
    <div className="az-race__numbers">
      {values.map((v, i) => (
        <span key={i} className="az-race__num" data-on={String(active.has(i))} data-tone={tone} data-done={String(done)}>
          {v}
        </span>
      ))}
    </div>
  );
}

export default function SolveVsVerify() {
  const [s, set] = useState(() => init(8));
  const [playing, togglePlay, stop] = usePlayback(s, set, step, isDone, 45);

  const load = n => { stop(); set(init(n)); };
  const certIdx = members(s.cert, s.n);
  const verifierSet = new Set(certIdx.slice(0, s.vStep));
  const solverSet = new Set(members(s.mask, s.n));
  const total = 2 ** s.n - 1;
  const started = s.tried > 0;

  let note;
  let tone;
  if (!started) {
    note = <>Is there a group of these {s.n} numbers that adds up to exactly <em>0</em>? The solver has to search for one. The verifier is handed a claimed answer and only has to check it. Press Play to race them.</>;
  } else if (!s.found) {
    note = <>The verifier is {vDone(s) ? 'already done' : 'adding up the claim'}. The solver has checked <em>{fmt(s.tried)}</em> of {fmt(total)} possible subsets and is still searching.</>;
  } else {
    tone = 'ok';
    note = <>Both agree: {'{'}{certIdx.map(i => s.values[i]).join(', ')}{'}'} sums to 0. Verifying took <em>{certIdx.length} additions</em>. Finding it took <em>{fmt(s.tried)} subset checks</em>. Add four more numbers and the search grows 16×; the check barely changes.</>;
  }

  return (
    <Figure
      icon={Scale}
      kicker="Solving vs verifying"
      title="Subset Sum: find a group that adds to zero"
      tools={
        <Segmented
          label="How many numbers"
          value={s.n}
          onChange={load}
          options={SIZES.map(n => ({ value: n, label: `n = ${n}` }))}
        />
      }
      caption={`The solver checks subsets in order, as a brute-force search would. With n = ${s.n} there are 2${s.n === 8 ? '⁸' : s.n === 12 ? '¹²' : '¹⁶'} − 1 = ${fmt(total)} non-empty subsets.`}
    >
      <div className="az-viz-pair">
        <Stage label="Solver" aside={s.found ? 'found it' : started ? 'searching…' : 'ready'}>
          <div className="az-race">
            <Numbers values={s.values} active={solverSet} tone={s.found ? 'ok' : 'search'} done={s.found} />
            <div className="az-race__line">
              <Search size={14} strokeWidth={2} aria-hidden="true" />
              current subset sums to <strong>{started ? sumOf(s.values, s.mask) : '–'}</strong>
            </div>
            <div className="az-race__meter" aria-hidden="true">
              <span style={{ width: `${(s.tried / total) * 100}%` }} />
            </div>
          </div>
        </Stage>
        <Stage label="Verifier" aside={vDone(s) && started ? 'verified' : started ? 'checking…' : 'ready'}>
          <div className="az-race">
            <Numbers values={s.values} active={verifierSet} tone="ok" done={vDone(s) && started} />
            <div className="az-race__line">
              <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />
              claim {'{'}{certIdx.map(i => s.values[i]).join(', ')}{'}'} sums to <strong>{started ? s.vSum : '–'}</strong>
            </div>
            <div className="az-race__meter" data-tone="ok" aria-hidden="true">
              <span style={{ width: `${(s.vStep / certIdx.length) * 100}%` }} />
            </div>
          </div>
        </Stage>
      </div>

      <Stats cols={2}>
        <Stat value={fmt(s.tried)} label="Solver: subsets checked" tone={s.found ? 'no' : undefined} />
        <Stat value={s.vStep} label="Verifier: additions" tone={started && vDone(s) ? 'ok' : undefined} />
      </Stats>

      <Playback
        onReset={() => load(s.n)}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={togglePlay}
        done={isDone(s)}
      />

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
