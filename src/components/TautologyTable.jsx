import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── Tautology checker: the whole truth table ───────────────
   A tautology is true on every row. One false row is a short
   certificate that a formula is NOT a tautology. */

const imp = (a, b) => !a || b;
const FORMULAS = [
  { id: 'lem', label: 'x ∨ ¬x', vars: ['x'], f: ({ x }) => x || !x },
  { id: 'dm', label: '¬(x ∧ y) ↔ (¬x ∨ ¬y)', vars: ['x', 'y'], f: ({ x, y }) => !(x && y) === (!x || !y) },
  { id: 'conv', label: '(x → y) → (y → x)', vars: ['x', 'y'], f: ({ x, y }) => imp(imp(x, y), imp(y, x)) },
  { id: 'peirce', label: '((x → y) → x) → x', vars: ['x', 'y'], f: ({ x, y }) => imp(imp(imp(x, y), x), x) },
  { id: 'chain', label: '(x → y) ∨ (y → z)', vars: ['x', 'y', 'z'], f: ({ x, y, z }) => imp(x, y) || imp(y, z) },
  { id: 'three', label: '(x ∧ y) ∨ (¬x ∧ z) ∨ (¬y ∧ ¬z)', vars: ['x', 'y', 'z'], f: ({ x, y, z }) => (x && y) || (!x && z) || (!y && !z) },
];

const rows = vars => Array.from({ length: 2 ** vars.length }, (_, m) =>
  Object.fromEntries(vars.map((v, i) => [v, !(m & (1 << (vars.length - 1 - i)))])));
const tf = b => (b ? 'T' : 'F');

export default function TautologyTable() {
  const [id, setId] = useState('dm');
  const formula = FORMULAS.find(f => f.id === id);
  const table = rows(formula.vars).map(r => ({ r, out: formula.f(r) }));
  const falseRows = table.filter(t => !t.out);
  const first = falseRows[0];

  return (
    <Figure
      title="Is it a tautology?"
      tools={<Segmented label="Formula" value={id} onChange={setId}
        options={FORMULAS.map((f, i) => ({ value: f.id, label: `${i + 1}` }))} />}
      status={falseRows.length === 0
        ? <><b>Tautology</b>: true on all {table.length} rows. To be sure, every row had to be checked.</>
        : <><b>Not a tautology</b>. The row {formula.vars.map(v => `${v}=${tf(first.r[v])}`).join(', ')} makes it false, and that one row is all the proof you need.</>}
      tone={falseRows.length === 0 ? 'good' : 'bad'}
    >
      <div className="az-fig-formula" style={{ fontSize: 14 }}>{formula.label}</div>
      <table className="az-fig-table">
        <thead>
          <tr>
            {formula.vars.map(v => <th key={v} style={{ textAlign: 'center' }}>{v}</th>)}
            <th style={{ textAlign: 'center' }}>Formula</th>
          </tr>
        </thead>
        <tbody>
          {table.map(({ r, out }, k) => (
            <tr key={k} data-on={String(r === first?.r)}>
              {formula.vars.map(v => <td key={v} style={{ textAlign: 'center' }}>{tf(r[v])}</td>)}
              <td style={{ textAlign: 'center', fontWeight: 600, color: out ? 'var(--fig-ink)' : 'var(--fig-bad)' }}>{tf(out)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Figure>
  );
}
