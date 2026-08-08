import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

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

const MONO = 'var(--ifm-font-family-monospace)';

function GateSVG({ type, a, b }) {
  const idle = 'var(--az-border-subtle)';
  const live = 'var(--viz-accent)';
  const body = 'var(--az-surface)';
  const text = 'var(--az-muted)';

  const bLive = type === 'NOT' ? false : b;
  const out = evalGate(type, a, b);

  const label = (x, y, on, value) => (
    <text x={x} y={y} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={on ? live : text}>
      {value}
    </text>
  );

  if (type === 'NOT') {
    return (
      <svg viewBox="0 0 200 80" style={{ width: '100%', maxWidth: 200 }} role="img" aria-label={`NOT gate, input ${a ? 'true' : 'false'}, output ${out ? 'true' : 'false'}`}>
        <line x1="10" y1="40" x2="60" y2="40" stroke={a ? live : idle} strokeWidth="2" />
        <path d="M60 15 L60 65 L125 40 Z" fill={body} stroke={a ? live : idle} strokeWidth="1.5" />
        <circle cx="130" cy="40" r="5" fill={body} stroke={out ? live : idle} strokeWidth="1.5" />
        <line x1="135" y1="40" x2="188" y2="40" stroke={out ? live : idle} strokeWidth="2" />
        {label(35, 33, a, a ? 'T' : 'F')}
        {label(165, 33, out, out ? 'T' : 'F')}
        <text x="83" y="44" textAnchor="middle" fontSize="11" fontFamily={MONO} fill={text}>NOT</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 100" style={{ width: '100%', maxWidth: 220 }} role="img" aria-label={`${type} gate, inputs ${a ? 'true' : 'false'} and ${b ? 'true' : 'false'}, output ${out ? 'true' : 'false'}`}>
      <line x1="10" y1="30" x2="70" y2="30" stroke={a ? live : idle} strokeWidth="2" />
      <line x1="10" y1="70" x2="70" y2="70" stroke={bLive ? live : idle} strokeWidth="2" />
      {type === 'AND'
        ? <path d="M70 15 L70 85 L105 85 Q135 85 135 50 Q135 15 105 15 Z" fill={body} stroke={a && bLive ? live : idle} strokeWidth="1.5" />
        : <path d="M 70 15 Q 100 15 135 50 Q 100 85 70 85 Q 90 50 70 15 Z" fill={body} stroke={a || bLive ? live : idle} strokeWidth="1.5" />}
      <line x1="135" y1="50" x2="210" y2="50" stroke={out ? live : idle} strokeWidth="2" />
      {label(36, 25, a, a ? 'T' : 'F')}
      {label(36, 65, bLive, b ? 'T' : 'F')}
      {label(185, 45, out, out ? 'T' : 'F')}
      <text x="103" y="54" textAnchor="middle" fontSize="11" fontFamily={MONO} fill={text}>{type}</text>
    </svg>
  );
}

function GatePanel() {
  const [gateIdx, setGateIdx] = useState(0);
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  const gate = GATES[gateIdx];
  const out = evalGate(gate.type, a, gate.single ? false : b);

  const Toggle = ({ label, value, onToggle }) => (
    <div className="az-gate__io-group">
      <span className="az-gate__io-label">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={value}
        className={'az-viz-btn az-viz-btn--wide' + (value ? ' az-viz-btn--on' : '')}
      >
        {value ? 'T' : 'F'}
      </button>
    </div>
  );

  return (
    <div className="az-gate" style={{ '--viz-accent': gate.color }}>
      <div className="az-viz-segment">
        {GATES.map((g, i) => (
          <button
            key={g.type}
            type="button"
            onClick={() => setGateIdx(i)}
            aria-pressed={i === gateIdx}
            className={'az-viz-btn az-viz-btn--grow' + (i === gateIdx ? ' az-viz-btn--on' : '')}
            style={{ '--btn-accent': g.color }}
          >
            {g.symbol} {g.type}
          </button>
        ))}
      </div>

      <div className="az-viz-note">{gate.desc}</div>

      <div className="az-gate__diagram">
        <GateSVG type={gate.type} a={a} b={b} />
      </div>

      <div className="az-gate__io">
        <Toggle
          label={gate.single ? 'Input' : 'Input A'}
          value={a}
          onToggle={() => setA(v => !v)}
        />
        {!gate.single && (
          <Toggle label="Input B" value={b} onToggle={() => setB(v => !v)} />
        )}
        <div className="az-gate__io-group az-gate__io-group--out">
          <span className="az-gate__io-label">Output</span>
          <div className="az-gate__out" data-on={String(out)}>{out ? 'T' : 'F'}</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
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
            <span className="az-viz-row__status">{results[i] ? 'satisfied' : 'violated'}</span>
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

const TABS = ['Logic gates', 'SAT formula'];

function Inner() {
  const [tab, setTab] = useState(0);

  return (
    <div className="az-viz">
      <div className="az-viz__head">
        <span className="az-viz__label">Boolean logic explorer</span>
        <div className="az-viz__tools">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={i === tab}
              onClick={() => setTab(i)}
              className={'az-viz-btn' + (i === tab ? ' az-viz-btn--on' : '')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="az-viz__body">
        {tab === 0 ? <GatePanel /> : <SATPanel />}
      </div>

      <p className="az-viz__foot">
        {tab === 0
          ? 'Flip the inputs to watch the wires and the matching truth-table row light up.'
          : 'Toggle each variable to search for a satisfying assignment.'}
      </p>
    </div>
  );
}

export default function SATExplorer() {
  return (
    <BrowserOnly fallback={<div className="az-viz__loading">Loading explorer</div>}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
