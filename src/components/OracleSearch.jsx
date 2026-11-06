import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Figure, Playback, usePlayback } from './figure';

/* ── Finding an answer with a yes/no oracle ─────────────────
   The oracle only says whether a formula is satisfiable. Fix
   one variable at a time, asking "still satisfiable?" each time:
   n questions instead of 2^n tries. */

const SUB = ['', '₁', '₂', '₃', '₄'];
// φ = (x₁ ∨ x₂) ∧ (¬x₁ ∨ x₃) ∧ (¬x₂ ∨ ¬x₃) ∧ (x₃ ∨ x₄) ∧ (¬x₄ ∨ ¬x₁)
const CLAUSES = [[[1, 0], [2, 0]], [[1, 1], [3, 0]], [[2, 1], [3, 1]], [[3, 0], [4, 0]], [[4, 1], [1, 1]]];
const N = 4;
const lit = ([v, neg]) => `${neg ? '¬' : ''}x${SUB[v]}`;
const FORMULA = CLAUSES.map(c => `(${c.map(lit).join(' ∨ ')})`).join(' ∧ ');

const satisfies = a => CLAUSES.every(c => c.some(([v, neg]) => a[v] !== !!neg));
// The "oracle": a black box. Inside, it is just brute force, but the machine can't see that.
function oracle(fixed) {
  const free = [];
  for (let v = 1; v <= N; v++) if (fixed[v] === undefined) free.push(v);
  for (let m = 0; m < 1 << free.length; m++) {
    const a = { ...fixed };
    free.forEach((v, i) => { a[v] = !!(m & (1 << i)); });
    if (satisfies(a)) return true;
  }
  return false;
}

const init = () => ({ fixed: {}, log: [] });
const step = s => {
  const v = s.log.length + 1;
  const tryTrue = { ...s.fixed, [v]: true };
  const yes = oracle(tryTrue);
  return { fixed: yes ? tryTrue : { ...s.fixed, [v]: false }, log: [...s.log, { v, yes }] };
};
const isDone = s => s.log.length >= N;
const tf = b => (b ? 'T' : 'F');

export default function OracleSearch() {
  const [s, set] = useState(init);
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 900);

  const fixedText = v => (s.fixed[v] === undefined ? '?' : tf(s.fixed[v]));
  const status = isDone(s)
    ? <>Found x₁…x₄ = <b>{[1, 2, 3, 4].map(fixedText).join(', ')}</b> with <b>{N}</b> oracle questions. Brute force could need {2 ** N} tries.</>
    : <>The oracle only answers yes or no: <i>is this formula satisfiable?</i> Press <b>Step</b> to ask it.</>;

  return (
    <Figure title="Search with a yes/no oracle" status={status} tone={isDone(s) ? 'good' : undefined}>
      <div className="az-fig-formula">φ = {FORMULA}</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[1, 2, 3, 4].map(v => (
          <span key={v} className="az-fig-token" data-on={String(s.fixed[v] !== undefined)} style={{ minWidth: 64 }}>
            x{SUB[v]} = {fixedText(v)}
          </span>
        ))}
      </div>
      <div className="az-fig-well" style={{ padding: 12, minHeight: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {s.log.length === 0 && <span style={{ color: 'var(--fig-muted)', margin: 'auto' }}>No questions asked yet</span>}
        {s.log.map(({ v, yes }) => (
          <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} strokeWidth={2} color="var(--fig-accent)" aria-hidden="true" />
            <span>Is φ satisfiable with {[...Array(v - 1).keys()].map(i => `x${SUB[i + 1]}=${tf(s.fixed[i + 1])}, `).join('')}x{SUB[v]}=T?</span>
            <b style={{ marginLeft: 'auto', color: yes ? 'var(--fig-accent)' : 'var(--fig-bad)' }}>{yes ? 'Yes' : 'No'}</b>
            <span style={{ color: 'var(--fig-muted)' }}>→ x{SUB[v]} = {tf(yes)}</span>
          </div>
        ))}
      </div>
      <Playback onReset={() => { stop(); set(init()); }} onStep={() => set(step)} playing={playing} onTogglePlay={toggle} done={isDone(s)} />
    </Figure>
  );
}
