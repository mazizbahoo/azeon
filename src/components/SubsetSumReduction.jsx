import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── 3-SAT → Subset Sum: digits as bookkeeping ──────────────
   φ = (x₁ ∨ x₂ ∨ x₃) ∧ (¬x₁ ∨ ¬x₂ ∨ x₃)
   Columns: x₁ x₂ x₃ | C₁ C₂. Target 1 1 1 | 3 3. */

const CLAUSES = [
  [[1, false], [2, false], [3, false]],
  [[1, true], [2, true], [3, false]],
];
const VARS = [1, 2, 3];
const SUB = ['', '₁', '₂', '₃'];
const COLS = ['x₁', 'x₂', 'x₃', 'C₁', 'C₂'];
const TARGET = [1, 1, 1, 3, 3];

const litRow = (v, neg) => [
  ...VARS.map(u => (u === v ? 1 : 0)),
  ...CLAUSES.map(c => (c.some(([u, n]) => u === v && n === neg) ? 1 : 0)),
];
const ROWS = [
  ...VARS.flatMap(v => [
    { id: `y${v}`, label: `x${SUB[v]} true`, digits: litRow(v, false), v, neg: false },
    { id: `z${v}`, label: `x${SUB[v]} false`, digits: litRow(v, true), v, neg: true },
  ]),
  ...CLAUSES.flatMap((_, j) => [0, 1].map(k => ({
    id: `s${j}${k}`, label: `slack C${SUB[j + 1]}`, digits: VARS.map(() => 0).concat(CLAUSES.map((__, i) => (i === j ? 1 : 0))), clause: j, k,
  }))),
];

const lit = ([v, neg]) => `${neg ? '¬' : ''}x${SUB[v]}`;
const truthOf = (assign, [v, neg]) => assign[v] !== neg;

export default function SubsetSumReduction() {
  const [assign, setAssign] = useState({ 1: true, 2: false, 3: false });

  const trueCount = CLAUSES.map(c => c.filter(l => truthOf(assign, l)).length);
  const slackUsed = trueCount.map(t => Math.min(2, 3 - t));
  const picked = ROWS.filter(r => (r.v ? assign[r.v] !== r.neg : r.k < slackUsed[r.clause]));
  const sums = COLS.map((_, c) => picked.reduce((s, r) => s + r.digits[c], 0));
  const ok = sums.every((s, c) => s === TARGET[c]);
  const failed = CLAUSES.findIndex((_, j) => sums[3 + j] !== 3);

  return (
    <Figure
      title="3-SAT to Subset Sum"
      tools={
        <>
          {VARS.map(v => (
            <Segmented key={v} label={`x${v}`} value={assign[v]} onChange={val => setAssign(a => ({ ...a, [v]: val }))}
              options={[{ value: true, label: `x${SUB[v]} = T` }, { value: false, label: 'F' }]} />
          ))}
        </>
      }
      status={ok
        ? <>Chosen numbers add up to <b>{TARGET.join('')}</b> exactly. The assignment satisfies φ.</>
        : <>Clause C{SUB[failed + 1]} has no true literal, so its column reaches only <b>{sums[3 + failed]}</b>, not 3. No subset hits the target.</>}
      tone={ok ? 'good' : 'bad'}
    >
      <div className="az-fig-formula">
        φ = {CLAUSES.map(c => `(${c.map(lit).join(' ∨ ')})`).join(' ∧ ')}
      </div>
      <table className="az-fig-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr><th>Number</th>{COLS.map(c => <th key={c} style={{ textAlign: 'center' }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {ROWS.map(r => {
            const on = picked.includes(r);
            return (
              <tr key={r.id} data-on={String(on)}>
                <td>{r.label}</td>
                {r.digits.map((d, c) => <td key={c} style={{ textAlign: 'center' }}>{d}</td>)}
              </tr>
            );
          })}
          <tr>
            <td style={{ color: 'var(--fig-ink)', fontWeight: 600 }}>Sum of chosen</td>
            {sums.map((s, c) => (
              <td key={c} style={{ textAlign: 'center', fontWeight: 600, color: s === TARGET[c] ? 'var(--fig-accent)' : 'var(--fig-bad)' }}>{s}</td>
            ))}
          </tr>
          <tr>
            <td style={{ color: 'var(--fig-ink)' }}>Target</td>
            {TARGET.map((t, c) => <td key={c} style={{ textAlign: 'center', color: 'var(--fig-ink)' }}>{t}</td>)}
          </tr>
        </tbody>
      </table>
    </Figure>
  );
}
