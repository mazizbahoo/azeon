import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

/* ── Gate logic ─────────────────────────────────────────── */

function evalGate(type, a, b) {
  switch (type) {
    case 'AND': return a && b;
    case 'OR':  return a || b;
    case 'NOT': return !a;
    default:    return false;
  }
}

const GATES = [
  {
    type: 'AND',
    symbol: '∧',
    color: '#5e9e5e',
    desc: 'True only when both inputs are true.',
    table: [
      { a: false, b: false, out: false },
      { a: false, b: true,  out: false },
      { a: true,  b: false, out: false },
      { a: true,  b: true,  out: true  },
    ],
  },
  {
    type: 'OR',
    symbol: '∨',
    color: '#5e7bb1',
    desc: 'True when at least one input is true.',
    table: [
      { a: false, b: false, out: false },
      { a: false, b: true,  out: true  },
      { a: true,  b: false, out: true  },
      { a: true,  b: true,  out: true  },
    ],
  },
  {
    type: 'NOT',
    symbol: '¬',
    color: '#b17a5e',
    desc: 'Flips the input. True becomes false, false becomes true.',
    table: [
      { a: false, out: true  },
      { a: true,  out: false },
    ],
    single: true,
  },
];

/* ── Gate diagram SVG ──────────────────────────────────────
   Drawn inline so no external assets needed.
────────────────────────────────────────────────────────── */

function GateSVG({ type, a, b, color, dark }) {
  const wire   = 'var(--az-border)';
  const wireLo = 'var(--az-border-subtle)';
  const body   = 'var(--az-surface)';
  const active = color;
  const text   = 'var(--az-text)';

  const aLive = a;
  const bLive = type === 'NOT' ? false : b;
  const outLive = evalGate(type, a, b);

  const wireA   = aLive   ? active : wire;
  const wireB   = bLive   ? active : wire;
  const wireOut = outLive ? active : wire;

  const mono = 'JetBrains Mono, monospace';

  if (type === 'NOT') {
    return (
      <svg viewBox="0 0 200 80" style={{ width: '100%', maxWidth: 200 }}>
        {/* input wire */}
        <line x1="10" y1="40" x2="70" y2="40" stroke={wireA} strokeWidth="2" />
        {/* body */}
        <path d="M70 18 L70 62 L118 40 Z" fill={body} stroke={aLive ? active : wireLo} strokeWidth="1.5" />
        {/* NOT circle */}
        <circle cx="122" cy="40" r="6" fill={body} stroke={outLive ? active : wireLo} strokeWidth="1.5" />
        {/* output wire */}
        <line x1="128" y1="40" x2="188" y2="40" stroke={wireOut} strokeWidth="2" />
        {/* labels */}
        <text x="36" y="35" textAnchor="middle" fontSize="11" fontFamily={mono} fill={aLive ? active : text} opacity={aLive ? 1 : 0.45}>{a ? 'T' : 'F'}</text>
        <text x="162" y="35" textAnchor="middle" fontSize="11" fontFamily={mono} fill={outLive ? active : text} opacity={outLive ? 1 : 0.45}>{outLive ? 'T' : 'F'}</text>
        <text x="94" y="44" textAnchor="middle" fontSize="13" fontFamily={mono} fill={text} opacity={0.5}>NOT</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 100" style={{ width: '100%', maxWidth: 220 }}>
      {/* input wires */}
      <line x1="10" y1="30" x2="70" y2="30" stroke={wireA} strokeWidth="2" />
      <line x1="10" y1="70" x2="70" y2="70" stroke={wireB} strokeWidth="2" />
      {/* body */}
      {type === 'AND'
        ? <path d="M70 15 L70 85 L105 85 Q135 85 135 50 Q135 15 105 15 Z" fill={body} stroke={(aLive && bLive) ? active : wireLo} strokeWidth="1.5" />
        : <path d="M70 15 Q90 15 105 50 Q90 85 70 85 L70 85 Q100 70 115 50 Q100 30 70 15 Z M70 15 L95 15 Q125 15 135 50 Q125 85 95 85 L70 85" fill={body} stroke={(aLive || bLive) ? active : wireLo} strokeWidth="1.5" />
      }
      {/* output wire */}
      <line x1="135" y1="50" x2="210" y2="50" stroke={wireOut} strokeWidth="2" />
      {/* input labels */}
      <text x="36" y="26" textAnchor="middle" fontSize="11" fontFamily={mono} fill={aLive ? active : text} opacity={aLive ? 1 : 0.45}>{a ? 'T' : 'F'}</text>
      <text x="36" y="66" textAnchor="middle" fontSize="11" fontFamily={mono} fill={bLive ? active : text} opacity={bLive ? 1 : 0.45}>{b ? 'T' : 'F'}</text>
      {/* output label */}
      <text x="185" y="45" textAnchor="middle" fontSize="11" fontFamily={mono} fill={outLive ? active : text} opacity={outLive ? 1 : 0.45}>{outLive ? 'T' : 'F'}</text>
      {/* gate label */}
      <text x="103" y="54" textAnchor="middle" fontSize="12" fontFamily={mono} fill={text} opacity={0.5}>{type}</text>
    </svg>
  );
}

/* ── Gate explorer panel ────────────────────────────────── */

function GatePanel({ dark }) {
  const [gateIdx, setGateIdx] = useState(0);
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  const gate   = GATES[gateIdx];
  const out    = evalGate(gate.type, a, gate.single ? false : b);
  const mono   = 'JetBrains Mono, monospace';
  const serif  = 'DM Serif Display, Georgia, serif';
  const accent = gate.color;

  const bdr    = 'var(--az-border)';
  const bdrSub = 'var(--az-border-subtle)';
  const bg     = 'var(--az-surface)';
  const bgEl   = 'var(--az-elevated)';
  const tPri   = 'var(--az-text)';
  const tMut   = 'var(--az-text)';

  function ToggleBtn({ val, onToggle, label }) {
    return (
      <button
        onClick={onToggle}
        style={{
          fontFamily: mono,
          fontSize: 13,
          fontWeight: 600,
          width: 52,
          height: 36,
          borderRadius: 8,
          border: `1px solid ${val ? accent : bdr}`,
          background: val ? `${accent}22` : bg,
          color: val ? accent : tMut,
          cursor: 'pointer',
          transition: 'all 0.18s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {val ? 'T' : 'F'}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* gate selector */}
      <div style={{ display: 'flex', gap: 6 }}>
        {GATES.map((g, i) => (
          <button
            key={g.type}
            onClick={() => setGateIdx(i)}
            style={{
              flex: 1,
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.06em',
              padding: '6px 0',
              borderRadius: 8,
              border: `1px solid ${i === gateIdx ? g.color : bdr}`,
              background: i === gateIdx ? `${g.color}18` : bg,
              color: i === gateIdx ? g.color : tMut,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {g.symbol} {g.type}
          </button>
        ))}
      </div>

      {/* description */}
      <div style={{
        fontFamily: mono,
        fontSize: '0.68rem',
        color: tMut,
        letterSpacing: '0.02em',
        lineHeight: 1.6,
        borderLeft: `2px solid ${accent}`,
        paddingLeft: 10,
      }}>
        {gate.desc}
      </div>

      {/* diagram */}
      <div style={{
        background: bgEl,
        border: `1px solid ${bdrSub}`,
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <GateSVG type={gate.type} a={a} b={b} color={accent} dark={dark} />
      </div>

      {/* controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: '0.65rem', color: tMut }}>
            {gate.type === 'NOT' ? 'Input' : 'Input A'}
          </span>
          <ToggleBtn val={a} onToggle={() => setA(v => !v)} />
        </div>
        {!gate.single && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: '0.65rem', color: tMut }}>Input B</span>
            <ToggleBtn val={b} onToggle={() => setB(v => !v)} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontFamily: mono, fontSize: '0.65rem', color: tMut }}>Output</span>
          <div style={{
            width: 52, height: 36,
            borderRadius: 8,
            border: `1px solid ${out ? accent : bdr}`,
            background: out ? `${accent}22` : bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: mono, fontSize: 13, fontWeight: 600,
            color: out ? accent : tMut,
            transition: 'all 0.18s',
          }}>
            {out ? 'T' : 'F'}
          </div>
        </div>
      </div>

      {/* truth table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: mono,
          fontSize: '0.7rem',
        }}>
          <thead>
            <tr>
              {!gate.single && <th style={{ padding: '6px 12px', borderBottom: `1px solid ${bdrSub}`, color: tMut, fontWeight: 500, textAlign: 'center' }}>A</th>}
              <th style={{ padding: '6px 12px', borderBottom: `1px solid ${bdrSub}`, color: tMut, fontWeight: 500, textAlign: 'center' }}>{gate.single ? 'Input' : 'B'}</th>
              <th style={{ padding: '6px 12px', borderBottom: `1px solid ${bdrSub}`, color: tMut, fontWeight: 500, textAlign: 'center' }}>Output</th>
            </tr>
          </thead>
          <tbody>
            {gate.table.map((row, i) => {
              const isActive = gate.single
                ? row.a === a
                : row.a === a && row.b === b;
              return (
                <tr key={i} style={{
                  background: isActive ? `${accent}12` : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  {!gate.single && (
                    <td style={{ padding: '6px 12px', textAlign: 'center', color: isActive ? accent : tMut }}>
                      {row.a ? 'T' : 'F'}
                    </td>
                  )}
                  <td style={{ padding: '6px 12px', textAlign: 'center', color: isActive ? accent : tMut }}>
                    {gate.single ? (row.a ? 'T' : 'F') : (row.b ? 'T' : 'F')}
                  </td>
                  <td style={{
                    padding: '6px 12px',
                    textAlign: 'center',
                    color: isActive ? (row.out ? accent : '#c85555') : tMut,
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    {row.out ? 'T' : 'F'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── SAT clause explorer ────────────────────────────────── */

// Hardcoded 3-variable formula from Post 12 as worked example
// φ = (x₁ ∨ ¬x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)
const CLAUSES = [
  { vars: [0, 1], negated: [false, true],  label: '(x₁ ∨ ¬x₂)' },
  { vars: [0, 2], negated: [true,  false], label: '(¬x₁ ∨ x₃)' },
  { vars: [1, 2], negated: [false, true],  label: '(x₂ ∨ ¬x₃)' },
];

function evalClause(clause, vals) {
  return clause.vars.some((vi, i) => {
    const raw = vals[vi];
    return clause.negated[i] ? !raw : raw;
  });
}

function SATPanel({ dark }) {
  const [vals, setVals] = useState([true, true, true]);

  const mono   = 'JetBrains Mono, monospace';
  const accent = dark ? '#a67cff' : '#5e35b1';
  const green  = '#4caf50';
  const red    = '#c85555';
  const bdr    = 'var(--az-border)';
  const bdrSub = 'var(--az-border-subtle)';
  const bg     = 'var(--az-surface)';
  const bgEl   = 'var(--az-elevated)';
  const tPri   = 'var(--az-text)';
  const tMut   = 'var(--az-text)';

  const clauseResults = CLAUSES.map(c => evalClause(c, vals));
  const allSat = clauseResults.every(Boolean);

  function toggle(i) {
    setVals(v => v.map((x, j) => j === i ? !x : x));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* formula display */}
      <div style={{
        fontFamily: mono,
        fontSize: '0.78rem',
        color: tMut,
        textAlign: 'center',
        letterSpacing: '0.02em',
        padding: '10px',
        background: bgEl,
        borderRadius: 8,
        border: `1px solid ${bdrSub}`,
      }}>
        φ = (x₁ ∨ ¬x₂) ∧ (¬x₁ ∨ x₃) ∧ (x₂ ∨ ¬x₃)
      </div>

      {/* variable toggles */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['x₁', 'x₂', 'x₃'].map((label, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              fontFamily: mono,
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 10,
              border: `1px solid ${vals[i] ? accent : bdr}`,
              background: vals[i] ? `${accent}22` : bg,
              color: vals[i] ? accent : tMut,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {label} = {vals[i] ? 'T' : 'F'}
          </button>
        ))}
      </div>

      {/* clause results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CLAUSES.map((clause, i) => {
          const sat = clauseResults[i];
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${sat ? `${green}44` : `${red}44`}`,
              background: sat ? `${green}0e` : `${red}0e`,
              transition: 'all 0.22s',
            }}>
              <span style={{ fontFamily: mono, fontSize: '0.73rem', color: tPri, letterSpacing: '0.01em' }}>
                {clause.label}
              </span>
              <span style={{
                fontFamily: mono,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: sat ? green : red,
                letterSpacing: '0.08em',
              }}>
                {sat ? '✓ satisfied' : '✗ violated'}
              </span>
            </div>
          );
        })}
      </div>

      {/* overall verdict */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 12,
        border: `1.5px solid ${allSat ? `${green}66` : `${red}66`}`,
        background: allSat ? `${green}14` : `${red}10`,
        textAlign: 'center',
        transition: 'all 0.25s',
      }}>
        <div style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.12em', color: tMut, marginBottom: 4 }}>
          FORMULA STATUS
        </div>
        <div style={{
          fontFamily: 'DM Serif Display, Georgia, serif',
          fontSize: '1.4rem',
          color: allSat ? green : red,
          letterSpacing: '-0.01em',
          transition: 'color 0.22s',
        }}>
          {allSat ? 'Satisfiable' : 'Not satisfied'}
        </div>
        {allSat && (
          <div style={{ fontFamily: mono, fontSize: '0.62rem', color: tMut, marginTop: 4, letterSpacing: '0.04em' }}>
            This assignment is a valid certificate.
          </div>
        )}
      </div>

      <div style={{ fontFamily: mono, fontSize: '0.6rem', color: tMut, textAlign: 'center', opacity: 0.55, letterSpacing: '0.04em' }}>
        Toggle variable values to explore — try to find all satisfying assignments.
      </div>
    </div>
  );
}

/* ── Main export ────────────────────────────────────────── */

function Inner() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';

  const [tab, setTab] = useState(0);

  const mono   = 'var(--ifm-font-family-monospace)';
  const accent = 'var(--az-accent)';
  const bdr    = 'var(--az-border)';
  const bg     = 'var(--az-surface)';
  const tMut   = 'var(--az-text)';

  const TABS = ['⊙ Logic Gates', '⊛ SAT Formula'];

  return (
    <div style={{
      background: bg,
      border: `1px solid ${bdr}`,
      borderRadius: 24,
      padding: '1.25rem',
      margin: '1.75rem 0',
      fontFamily: mono,
    }}>
      {/* header */}
      <div style={{
        fontSize: '0.58rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--az-accent)',
        textAlign: 'center',
        marginBottom: '0.9rem',
      }}>
        // Boolean Logic Explorer
      </div>

      {/* tab switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.1rem' }}>
        {TABS.map((label, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              flex: 1,
              fontFamily: mono,
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              padding: '8px 0',
              borderRadius: 10,
              border: `1px solid ${i === tab ? accent : bdr}`,
              background: i === tab ? `${accent}18` : 'transparent',
              color: i === tab ? accent : tMut,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* content */}
      {tab === 0 ? <GatePanel dark={dark} /> : <SATPanel dark={dark} />}
    </div>
  );
}

export default function SATExplorer() {
  return (
    <BrowserOnly fallback={
      <div style={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.4,
        fontFamily: 'monospace',
        fontSize: '0.8rem',
      }}>
        Loading explorer...
      </div>
    }>
      {() => <Inner />}
    </BrowserOnly>
  );
}
