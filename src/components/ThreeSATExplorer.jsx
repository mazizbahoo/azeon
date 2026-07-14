import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

// ── Clause size cases ──────────────────────────────────────────────────────
// Each case shows: original clause, how it converts, and an explanation

const CASES = [
  {
    id: 'one',
    label: '1 literal',
    example: '(x₁)',
    originalLiterals: ['x₁'],
    helperVars: ['y₁', 'y₂'],
    resultClauses: [['x₁', 'y₁', 'y₂']],
    explanation:
      'One literal is too short. We pad with two fresh helper variables y₁ and y₂. These are brand new variables that do not appear anywhere else in the formula. Because they are fresh, we can always set them to whatever we need. The original clause being satisfiable has not changed — x₁ being true still makes the clause true, and if x₁ is false we just set y₁ or y₂ to true.',
    helperCount: 2,
  },
  {
    id: 'two',
    label: '2 literals',
    example: '(x₁ ∨ x₂)',
    originalLiterals: ['x₁', 'x₂'],
    helperVars: ['y₁'],
    resultClauses: [['x₁', 'x₂', 'y₁']],
    explanation:
      'Two literals needs one fresh helper variable y₁. We just pad the clause to reach three. Again, y₁ is fresh and free — it does not affect whether the original formula is satisfiable. If the original two literals can satisfy the clause, they still do. If neither is true we can set y₁ to true to keep the clause satisfied.',
    helperCount: 1,
  },
  {
    id: 'three',
    label: '3 literals',
    example: '(x₁ ∨ x₂ ∨ x₃)',
    originalLiterals: ['x₁', 'x₂', 'x₃'],
    helperVars: [],
    resultClauses: [['x₁', 'x₂', 'x₃']],
    explanation:
      'Three literals is exactly right. Nothing changes. The clause is already in 3-SAT form and goes straight through.',
    helperCount: 0,
  },
  {
    id: 'four',
    label: '4 literals',
    example: '(x₁ ∨ x₂ ∨ x₃ ∨ x₄)',
    originalLiterals: ['x₁', 'x₂', 'x₃', 'x₄'],
    helperVars: ['y₁'],
    resultClauses: [
      ['x₁', 'x₂', 'y₁'],
      ['¬y₁', 'x₃', 'x₄'],
    ],
    explanation:
      'Four literals is too many. We split the clause into two 3-literal clauses using one helper variable y₁. The first clause takes the first two original literals plus y₁. The second clause takes ¬y₁ plus the remaining two original literals. The trick: if y₁ is true, the second clause can still be satisfied by x₃ or x₄. If y₁ is false, the first clause can still be satisfied by x₁ or x₂. Whatever assignment satisfied the original 4-literal clause will also satisfy both of these — just set y₁ appropriately.',
    helperCount: 1,
  },
  {
    id: 'five',
    label: '5 literals',
    example: '(x₁ ∨ x₂ ∨ x₃ ∨ x₄ ∨ x₅)',
    originalLiterals: ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'],
    helperVars: ['y₁', 'y₂'],
    resultClauses: [
      ['x₁', 'x₂', 'y₁'],
      ['¬y₁', 'x₃', 'y₂'],
      ['¬y₂', 'x₄', 'x₅'],
    ],
    explanation:
      'Five literals needs two helper variables. We chain the split: y₁ carries the "rest" from clause 1 into clause 2, and y₂ carries the "rest" from clause 2 into clause 3. Each clause in the chain has exactly three literals. The chain satisfiability argument works the same way — whichever original literal is true, we can set the helper variables along the chain to route satisfaction through.',
    helperCount: 2,
  },
];

// ── Literal pill component ─────────────────────────────────────────────────

function LiteralPill({ text, isHelper, accent, helperColor, dark, small = false }) {
  const bg = isHelper
    ? dark ? 'rgba(224, 123, 69, 0.15)' : 'rgba(224, 123, 69, 0.10)'
    : dark ? 'rgba(166, 124, 255, 0.12)' : 'rgba(94, 53, 177, 0.08)';
  const border = isHelper
    ? dark ? 'rgba(224, 123, 69, 0.45)' : 'rgba(224, 123, 69, 0.40)'
    : dark ? 'rgba(166, 124, 255, 0.45)' : 'rgba(94, 53, 177, 0.35)';
  const color = isHelper
    ? helperColor
    : accent;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: small ? '2px 8px' : '4px 12px',
      borderRadius: 6,
      border: `1px solid ${border}`,
      background: bg,
      color,
      fontFamily: 'var(--ifm-font-family-monospace)',
      fontSize: small ? '0.68rem' : '0.78rem',
      fontWeight: 500,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

// ── Clause display ─────────────────────────────────────────────────────────

function ClauseDisplay({ literals, helperVars, accent, helperColor, dark, small = false }) {
  const tMut = 'var(--az-text)';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: tMut, fontFamily: 'var(--ifm-font-family-monospace)', fontSize: small ? '0.68rem' : '0.78rem' }}>(</span>
      {literals.map((lit, i) => {
        const isHelper = helperVars.some(h => lit === h || lit === `¬${h}`);
        return (
          <React.Fragment key={i}>
            <LiteralPill text={lit} isHelper={isHelper} accent={accent} helperColor={helperColor} dark={dark} small={small} />
            {i < literals.length - 1 && (
              <span style={{ color: tMut, fontFamily: 'var(--ifm-font-family-monospace)', fontSize: small ? '0.64rem' : '0.73rem', padding: '0 1px' }}>∨</span>
            )}
          </React.Fragment>
        );
      })}
      <span style={{ color: tMut, fontFamily: 'var(--ifm-font-family-monospace)', fontSize: small ? '0.68rem' : '0.78rem' }}>)</span>
    </span>
  );
}

// ── Arrow ──────────────────────────────────────────────────────────────────

function Arrow({ accent }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      padding: '0 4px',
    }}>
      <span style={{
        fontFamily: 'var(--ifm-font-family-monospace)',
        fontSize: '0.6rem',
        color: accent,
        letterSpacing: '0.1em',
      }}>converts to</span>
      <span style={{ color: accent, fontSize: '1.1rem', lineHeight: 1 }}>→</span>
    </div>
  );
}

// ── Main Inner component ───────────────────────────────────────────────────

function Inner() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';

  const [activeCase, setActiveCase] = useState('four');
  const [hoveredTab, setHoveredTab] = useState(null);

  const accent      = 'var(--az-accent)';
  const helperColor = dark ? '#e07b45' : '#c0581a';
  const bdr         = 'var(--az-border)';
  const bdrSub      = 'var(--az-border-subtle)';
  const bg          = 'var(--az-surface)';
  const bgSurf      = 'var(--az-elevated)';
  const bgEl        = 'var(--az-elevated)';
  const tPri        = 'var(--az-text)';
  const tMut        = 'var(--az-text)';
  const mono        = 'var(--ifm-font-family-monospace)';
  const green       = '#4caf50';

  const current = CASES.find(c => c.id === activeCase);

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
        // SAT → 3-SAT Clause Converter
      </div>

      {/* case selector tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {CASES.map(c => {
          const isActive = c.id === activeCase;
          const isHovered = hoveredTab === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCase(c.id)}
              onMouseEnter={() => setHoveredTab(c.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                flex: 1,
                minWidth: 60,
                fontFamily: mono,
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                padding: '6px 4px',
                borderRadius: 999,
                border: `1px solid ${isActive ? accent : (isHovered ? bdrSub : bdr)}`,
                background: isActive ? 'var(--az-accent-dim)' : (isHovered ? bgEl : 'transparent'),
                color: isActive ? accent : tMut,
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* main conversion display */}
      <div style={{
        background: bgSurf,
        border: `1px solid ${bdrSub}`,
        borderRadius: 12,
        padding: '1.1rem',
        marginBottom: '0.85rem',
      }}>

        {/* original clause label */}
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: tMut, marginBottom: '0.5rem' }}>
          Original clause
        </div>

        {/* original clause */}
        <div style={{ marginBottom: '0.9rem', minHeight: 32, display: 'flex', alignItems: 'center' }}>
          <ClauseDisplay
            literals={current.originalLiterals}
            helperVars={[]}
            accent={accent}
            helperColor={helperColor}
            dark={dark}
          />
          <span style={{
            marginLeft: 10,
            fontFamily: mono,
            fontSize: '0.62rem',
            color: tMut,
          }}>
            ({current.originalLiterals.length} literal{current.originalLiterals.length !== 1 ? 's' : ''})
          </span>
        </div>

        {/* arrow */}
        <div style={{ marginBottom: '0.9rem' }}>
          <Arrow accent={accent} />
        </div>

        {/* result label */}
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: tMut, marginBottom: '0.5rem' }}>
          After conversion — {current.resultClauses.length} clause{current.resultClauses.length !== 1 ? 's' : ''}
          {current.helperCount > 0 && (
            <span style={{ color: helperColor, marginLeft: 6 }}>
              + {current.helperCount} helper variable{current.helperCount !== 1 ? 's' : ''}
            </span>
          )}
          {current.helperCount === 0 && (
            <span style={{ color: green, marginLeft: 6 }}>no change needed</span>
          )}
        </div>

        {/* result clauses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {current.resultClauses.map((clause, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClauseDisplay
                literals={clause}
                helperVars={current.helperVars}
                accent={accent}
                helperColor={helperColor}
                dark={dark}
              />
              <span style={{
                fontFamily: mono,
                fontSize: '0.58rem',
                color: green,
              }}>
                ✓ 3 literals
              </span>
            </div>
          ))}
        </div>

        {/* helper var legend */}
        {current.helperVars.length > 0 && (
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: `1px solid ${bdrSub}`,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tMut }}>
              Helper vars:
            </span>
            {current.helperVars.map(h => (
              <span key={h} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 9px',
                borderRadius: 5,
                border: `1px solid ${dark ? 'rgba(224,123,69,0.40)' : 'rgba(224,123,69,0.35)'}`,
                background: dark ? 'rgba(224,123,69,0.10)' : 'rgba(224,123,69,0.07)',
                color: helperColor,
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 500,
              }}>
                {h} — fresh variable, not in original formula
              </span>
            ))}
          </div>
        )}
      </div>

      {/* explanation */}
      <div style={{
        background: bgEl,
        borderRadius: '0 12px 12px 0',
        borderLeft: `2px solid ${current.helperCount === 0 ? green : accent}`,
        padding: '10px 14px',
        fontSize: '0.7rem',
        lineHeight: 1.75,
        color: tMut,
        letterSpacing: '0.01em',
        marginBottom: '0.75rem',
      }}>
        {current.explanation}
      </div>

      {/* general rule note */}
      <div style={{
        background: dark ? 'rgba(166,124,255,0.06)' : 'rgba(94,53,177,0.04)',
        border: `1px solid ${dark ? 'rgba(166,124,255,0.15)' : 'rgba(94,53,177,0.12)'}`,
        borderRadius: 12,
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>
          General rule for k literals (k &gt; 3)
        </div>
        <div style={{ fontSize: '0.68rem', lineHeight: 1.7, color: tMut }}>
          A clause with <span style={{ color: accent, fontWeight: 500 }}>k</span> literals splits into{' '}
          <span style={{ color: accent, fontWeight: 500 }}>k − 2</span> clauses using{' '}
          <span style={{ color: helperColor, fontWeight: 500 }}>k − 3</span> helper variables.
          Each helper variable chains the clauses together: the positive form appears in one clause,
          the negated form appears in the next.
        </div>
      </div>

      <div style={{
        marginTop: 8,
        textAlign: 'center',
        fontSize: '0.57rem',
        letterSpacing: '0.07em',
        color: tMut,
      }}>
        Click each tab to see how clauses of different sizes get converted
      </div>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────

export default function ThreeSATExplorer() {
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
