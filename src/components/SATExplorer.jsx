import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button, Figure, Segmented } from './figure';

/* ── Gates ───────────────────────────────────────────────── */

const GATES = {
  AND: { fn: (a, b) => a && b, body: 'M110 25 L110 115 L150 115 Q195 115 195 70 Q195 25 150 25 Z' },
  OR: { fn: (a, b) => a || b, body: 'M105 25 Q155 25 195 70 Q155 115 105 115 Q128 70 105 25 Z' },
  NOT: { fn: a => !a, body: 'M110 30 L110 110 L182 70 Z', single: true },
};
const tf = v => (v ? 'T' : 'F');

function Wire({ d, on }) {
  return <path d={d} fill="none" stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on ? 2.5 : 1.75}
    strokeLinecap="round" style={{ transition: 'stroke 0.15s' }} />;
}

function Value({ x, y, on }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500"
      fill={on ? 'var(--fig-accent)' : 'var(--fig-faint)'}>{tf(on)}</text>
  );
}

function GateDiagram({ type, a, b }) {
  const g = GATES[type];
  const out = g.fn(a, b);
  return (
    <svg viewBox="0 0 300 140" className="az-fig-svg" style={{ maxWidth: 380, margin: '0 auto' }} role="img"
      aria-label={`${type} gate: ${g.single ? tf(a) : `${tf(a)}, ${tf(b)}`} gives ${tf(out)}`}>
      {g.single
        ? <Wire d="M40 70 L110 70" on={a} />
        : <><Wire d="M40 45 L114 45" on={a} /><Wire d="M40 95 L114 95" on={b} /></>}
      <path d={g.body} fill="var(--fig-bg)" stroke="var(--fig-line-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      {g.single && <circle cx="189" cy="70" r="6" fill="var(--fig-bg)" stroke="var(--fig-line-strong)" strokeWidth="1.5" />}
      <Wire d={`M${g.single ? 195 : 195} 70 L262 70`} on={out} />
      <text x={g.single ? 138 : 148} y="71" textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fill="var(--fig-muted)">{type}</text>
      {g.single ? <Value x={24} y={70} on={a} /> : <><Value x={24} y={45} on={a} /><Value x={24} y={95} on={b} /></>}
      <Value x={278} y={70} on={out} />
    </svg>
  );
}

function GatesPanel() {
  const [type, setType] = useState('AND');
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const g = GATES[type];
  const rows = g.single ? [[false], [true]] : [[false, false], [false, true], [true, false], [true, true]];

  return (
    <>
      <div className="az-sat__row">
        <Segmented label="Gate" value={type} onChange={setType} options={Object.keys(GATES).map(k => ({ value: k, label: k }))} />
        <div className="az-sat__inputs">
          <Button pressed={a} onClick={() => setA(v => !v)}>{g.single ? 'Input' : 'A'} = {tf(a)}</Button>
          {!g.single && <Button pressed={b} onClick={() => setB(v => !v)}>B = {tf(b)}</Button>}
        </div>
      </div>

      <div className="az-fig-well" style={{ padding: '12px 8px' }}>
        <GateDiagram type={type} a={a} b={b} />
      </div>

      <div className="az-fig-well">
        <table className="az-fig-table">
          <thead>
            <tr>{g.single ? <th>Input</th> : <><th>A</th><th>B</th></>}<th>Output</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.join()} data-on={String(r[0] === a && (g.single || r[1] === b))}>
                {r.map((v, i) => <td key={i}>{tf(v)}</td>)}
                <td>{tf(g.fn(r[0], r[1]))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── SAT formula ─────────────────────────────────────────── */

// φ = (x₁ ∨ ¬x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)
const CLAUSES = [
  { lits: [[0, false], [1, true]], label: 'x₁ ∨ ¬x₂' },
  { lits: [[0, true], [2, false]], label: '¬x₁ ∨ x₃' },
  { lits: [[1, false], [2, true]], label: 'x₂ ∨ ¬x₃' },
];
const VARS = ['x₁', 'x₂', 'x₃'];

function FormulaPanel({ vals, setVals }) {
  const results = CLAUSES.map(c => c.lits.some(([v, neg]) => (neg ? !vals[v] : vals[v])));
  return (
    <>
      <div className="az-fig-formula">φ = {CLAUSES.map(c => `(${c.label})`).join(' ∧ ')}</div>
      <div className="az-sat__inputs" style={{ justifyContent: 'center' }}>
        {VARS.map((name, i) => (
          <Button key={name} pressed={vals[i]} onClick={() => setVals(v => v.map((x, j) => (j === i ? !x : x)))}>
            {name} = {tf(vals[i])}
          </Button>
        ))}
      </div>
      <div className="az-fig-well">
        <table className="az-fig-table">
          <thead><tr><th>Clause</th><th style={{ textAlign: 'right' }}>Value</th></tr></thead>
          <tbody>
            {CLAUSES.map((c, i) => (
              <tr key={c.label}>
                <td>({c.label})</td>
                <td style={{ textAlign: 'right' }}>
                  {results[i]
                    ? <Check size={15} strokeWidth={2.5} color="var(--fig-accent)" aria-label="true" />
                    : <X size={15} strokeWidth={2.5} color="var(--fig-bad)" aria-label="false" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Shell ───────────────────────────────────────────────── */

export default function SATExplorer() {
  const [tab, setTab] = useState('gates');
  const [vals, setVals] = useState([true, true, true]);
  const sat = CLAUSES.every(c => c.lits.some(([v, neg]) => (neg ? !vals[v] : vals[v])));

  return (
    <Figure
      title="Boolean logic"
      tools={<Segmented label="View" value={tab} onChange={setTab} options={[{ value: 'gates', label: 'Gates' }, { value: 'sat', label: 'SAT formula' }]} />}
      status={tab === 'sat' ? (sat ? <><b>Satisfied</b>: every clause is true</> : <><b>Not satisfied</b>: a clause is false</>) : undefined}
      tone={tab === 'sat' ? (sat ? 'good' : 'bad') : undefined}
    >
      {tab === 'gates' ? <GatesPanel /> : <FormulaPanel vals={vals} setVals={setVals} />}
    </Figure>
  );
}
