import React, { useState } from 'react';
import { Binary, Check, CircuitBoard, Sigma, X } from 'lucide-react';
import { Button, Figure, Note, Segmented } from './figure';

/* ── Gates ───────────────────────────────────────────────── */

function evalGate(type, a, b) {
  switch (type) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'NOT': return !a;
    default: return false;
  }
}

const GATES = [
  {
    type: 'AND',
    symbol: '∧',
    color: 'var(--az-c1)',
    desc: 'True only when both inputs are true.',
    table: [
      { a: false, b: false, out: false },
      { a: false, b: true, out: false },
      { a: true, b: false, out: false },
      { a: true, b: true, out: true },
    ],
  },
  {
    type: 'OR',
    symbol: '∨',
    color: 'var(--az-c2)',
    desc: 'True when at least one input is true.',
    table: [
      { a: false, b: false, out: false },
      { a: false, b: true, out: true },
      { a: true, b: false, out: true },
      { a: true, b: true, out: true },
    ],
  },
  {
    type: 'NOT',
    symbol: '¬',
    color: 'var(--az-c5)',
    desc: 'Flips the input. True becomes false, false becomes true.',
    table: [
      { a: false, out: true },
      { a: true, out: false },
    ],
    single: true,
  },
];

const IDLE = 'var(--az-muted-dim)';
const LIVE = 'var(--viz-accent)';

function Wire({ d, on }) {
  return <path d={d} fill="none" stroke={on ? LIVE : IDLE} strokeWidth={on ? 3 : 2} strokeLinecap="round"
    style={{ transition: 'stroke 0.18s ease' }} />;
}

function Badge({ x, y, on, label }) {
  return (
    <g>
      <rect x={x - 20} y={y - 13} width={40} height={26} rx={7}
        fill={on ? LIVE : 'var(--az-bg)'} fillOpacity={on ? 0.16 : 1}
        stroke={on ? LIVE : 'var(--az-border-subtle)'} strokeWidth={1.25} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="600"
        fill={on ? LIVE : 'var(--az-muted)'}>{label}</text>
    </g>
  );
}

function GateSVG({ type, a, b }) {
  const out = evalGate(type, a, b);
  const tf = v => (v ? 'T' : 'F');
  const single = type === 'NOT';
  const bodyOn = single ? a : type === 'AND' ? a && b : a || b;
  const body = {
    AND: 'M120 30 L120 130 L165 130 Q215 130 215 80 Q215 30 165 30 Z',
    OR: 'M115 30 Q170 30 215 80 Q170 130 115 130 Q140 80 115 30 Z',
    NOT: 'M120 35 L120 125 L200 80 Z',
  }[type];

  return (
    <svg viewBox="0 0 340 160" className="az-viz-svg" style={{ maxWidth: 420 }} role="img"
      aria-label={`${type} gate: ${single ? `input ${tf(a)}` : `inputs ${tf(a)} and ${tf(b)}`}, output ${tf(out)}`}>
      {single
        ? <Wire d="M52 80 L120 80" on={a} />
        : <>
          <Wire d="M52 50 L124 50" on={a} />
          <Wire d="M52 110 L124 110" on={b} />
        </>}
      <path d={body} fill="var(--az-surface)" stroke={bodyOn ? LIVE : IDLE} strokeWidth={2} strokeLinejoin="round"
        style={{ transition: 'stroke 0.18s ease' }} />
      {single && <circle cx={208} cy={80} r={7} fill="var(--az-surface)" stroke={out ? LIVE : IDLE} strokeWidth={2} />}
      <Wire d={`M${single ? 215 : 215} 80 L288 80`} on={out} />
      <text x={single ? 150 : 162} y={81} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="500"
        fill="var(--az-text)">{type}</text>
      {single
        ? <Badge x={32} y={80} on={a} label={tf(a)} />
        : <>
          <Badge x={32} y={50} on={a} label={tf(a)} />
          <Badge x={32} y={110} on={b} label={tf(b)} />
        </>}
      <Badge x={310} y={80} on={out} label={tf(out)} />
    </svg>
  );
}

function InputToggle({ label, value, onToggle }) {
  return (
    <Button pressed={value} onClick={onToggle} className="az-viz-btn--wide">
      {label} = {value ? 'T' : 'F'}
    </Button>
  );
}

function GatePanel() {
  const [gateIdx, setGateIdx] = useState(0);
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  const gate = GATES[gateIdx];

  return (
    <div className="az-gate" style={{ '--viz-accent': gate.color }}>
      <Segmented
        label="Gate"
        grow
        value={gateIdx}
        onChange={setGateIdx}
        options={GATES.map((g, i) => ({ value: i, label: `${g.symbol} ${g.type}`, accent: g.color }))}
      />

      <Note>{gate.desc}</Note>

      <div className="az-gate__diagram">
        <GateSVG type={gate.type} a={a} b={b} />
      </div>

      <div className="az-viz-controls">
        <InputToggle label={gate.single ? 'Input' : 'A'} value={a} onToggle={() => setA(v => !v)} />
        {!gate.single && <InputToggle label="B" value={b} onToggle={() => setB(v => !v)} />}
      </div>

      <div className="az-viz__stage" style={{ overflowX: 'auto' }}>
        <table className="az-viz-table">
          <thead>
            <tr>
              {!gate.single && <th>A</th>}
              <th>{gate.single ? 'Input' : 'B'}</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {gate.table.map((row, i) => {
              const isActive = gate.single ? row.a === a : row.a === a && row.b === b;
              return (
                <tr key={i} data-active={String(isActive)}>
                  {!gate.single && <td>{row.a ? 'T' : 'F'}</td>}
                  <td>{gate.single ? (row.a ? 'T' : 'F') : (row.b ? 'T' : 'F')}</td>
                  <td>{row.out ? 'T' : 'F'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── SAT formula ─────────────────────────────────────────── */

// φ = (x₁ ∨ ¬x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)
const CLAUSES = [
  { vars: [0, 1], negated: [false, true], label: '(x₁ ∨ ¬x₂)' },
  { vars: [0, 2], negated: [true, false], label: '(¬x₁ ∨ x₃)' },
  { vars: [1, 2], negated: [false, true], label: '(x₂ ∨ ¬x₃)' },
];

function evalClause(clause, vals) {
  return clause.vars.some((vi, i) => (clause.negated[i] ? !vals[vi] : vals[vi]));
}

function SATPanel() {
  const [vals, setVals] = useState([true, true, true]);
  const results = CLAUSES.map(c => evalClause(c, vals));
  const allSat = results.every(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="az-viz-formula az-viz-formula--plain">
        φ = (x₁ ∨ ¬x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)
      </div>

      <div className="az-viz-segment" style={{ justifyContent: 'center' }}>
        {['x₁', 'x₂', 'x₃'].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={vals[i]}
            onClick={() => setVals(v => v.map((x, j) => (j === i ? !x : x)))}
            className={'az-viz-btn az-viz-btn--wide' + (vals[i] ? ' az-viz-btn--on' : '')}
          >
            {label} = {vals[i] ? 'T' : 'F'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CLAUSES.map((clause, i) => (
          <div key={clause.label} className={'az-viz-row ' + (results[i] ? 'az-viz-row--ok' : 'az-viz-row--no')}>
            <span>{clause.label}</span>
            <span className="az-viz-row__status">
              {results[i]
                ? <><Check size={13} strokeWidth={2.5} aria-hidden="true" />satisfied</>
                : <><X size={13} strokeWidth={2.5} aria-hidden="true" />violated</>}
            </span>
          </div>
        ))}
      </div>

      <div className={'az-viz-verdict ' + (allSat ? 'az-viz-verdict--ok' : 'az-viz-verdict--no')}>
        <div className="az-viz-verdict__label">Formula status</div>
        <div className="az-viz-verdict__value">{allSat ? 'Satisfiable' : 'Not satisfied'}</div>
        <div className="az-viz-verdict__sub">
          {allSat
            ? 'This assignment is a valid certificate.'
            : 'At least one clause is still false.'}
        </div>
      </div>
    </div>
  );
}

/* ── Shell ───────────────────────────────────────────────── */

export default function SATExplorer() {
  const [tab, setTab] = useState('gates');

  return (
    <Figure
      icon={Binary}
      kicker="Boolean logic"
      title={tab === 'gates' ? 'Logic gates' : 'Is this formula satisfiable?'}
      tools={
        <Segmented
          label="View"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'gates', label: 'Gates', icon: CircuitBoard },
            { value: 'sat', label: 'SAT formula', icon: Sigma },
          ]}
        />
      }
      caption={tab === 'gates'
        ? 'Flip the inputs to watch the wires and the matching truth-table row light up.'
        : 'Toggle each variable to search for a satisfying assignment. Checking one assignment is fast; finding one is the hard part.'}
    >
      {tab === 'gates' ? <GatePanel /> : <SATPanel />}
    </Figure>
  );
}
