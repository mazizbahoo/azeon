import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/* ── Clause size cases ───────────────────────────────────── */

const CASES = [
  {
    id: 'one',
    label: '1 literal',
    originalLiterals: ['x₁'],
    helperVars: ['y₁', 'y₂'],
    resultClauses: [['x₁', 'y₁', 'y₂']],
    explanation:
      'One literal is too short, so we pad it with two fresh helper variables y₁ and y₂ that appear nowhere else in the formula. Because they are fresh we can set them freely: x₁ being true still satisfies the clause, and if x₁ is false we set y₁ or y₂ to true.',
    helperCount: 2,
  },
  {
    id: 'two',
    label: '2 literals',
    originalLiterals: ['x₁', 'x₂'],
    helperVars: ['y₁'],
    resultClauses: [['x₁', 'x₂', 'y₁']],
    explanation:
      'Two literals needs one fresh helper variable y₁ to reach three. If either original literal satisfies the clause it still does, and if neither is true we set y₁ to true.',
    helperCount: 1,
  },
  {
    id: 'three',
    label: '3 literals',
    originalLiterals: ['x₁', 'x₂', 'x₃'],
    helperVars: [],
    resultClauses: [['x₁', 'x₂', 'x₃']],
    explanation:
      'Three literals is exactly right. The clause is already in 3-SAT form and passes through untouched.',
    helperCount: 0,
  },
  {
    id: 'four',
    label: '4 literals',
    originalLiterals: ['x₁', 'x₂', 'x₃', 'x₄'],
    helperVars: ['y₁'],
    resultClauses: [
      ['x₁', 'x₂', 'y₁'],
      ['¬y₁', 'x₃', 'x₄'],
    ],
    explanation:
      'Four literals splits into two 3-literal clauses joined by one helper variable y₁. If y₁ is true, the second clause still needs x₃ or x₄; if y₁ is false, the first still needs x₁ or x₂. Any assignment satisfying the original clause satisfies both — just set y₁ accordingly.',
    helperCount: 1,
  },
  {
    id: 'five',
    label: '5 literals',
    originalLiterals: ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'],
    helperVars: ['y₁', 'y₂'],
    resultClauses: [
      ['x₁', 'x₂', 'y₁'],
      ['¬y₁', 'x₃', 'y₂'],
      ['¬y₂', 'x₄', 'x₅'],
    ],
    explanation:
      'Five literals chains the split: y₁ carries the remainder from the first clause into the second, y₂ from the second into the third. Every clause in the chain holds exactly three literals, and the helper variables route satisfaction from whichever original literal is true.',
    helperCount: 2,
  },
];

const HELPER = 'var(--az-c5)';

/* ── Pieces ──────────────────────────────────────────────── */

function Clause({ literals, helperVars }) {
  return (
    <span className="az-viz-clause">
      <span>(</span>
      {literals.map((lit, i) => {
        const isHelper = helperVars.some(h => lit === h || lit === `¬${h}`);
        return (
          <React.Fragment key={lit + i}>
            <span className="az-viz-token" style={isHelper ? { '--tok': HELPER } : undefined}>
              {lit}
            </span>
            {i < literals.length - 1 && <span>∨</span>}
          </React.Fragment>
        );
      })}
      <span>)</span>
    </span>
  );
}

/* ── Main ────────────────────────────────────────────────── */

function Inner() {
  const [activeCase, setActiveCase] = useState('four');
  const current = CASES.find(c => c.id === activeCase);

  return (
    <div className="az-viz">
      <div className="az-viz__head">
        <span className="az-viz__label">SAT <ArrowRight className="az-inline-icon" size={12} strokeWidth={2} aria-hidden="true" /> 3-SAT clause converter</span>
        <div className="az-viz__tools">
          {CASES.map(c => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === activeCase}
              onClick={() => setActiveCase(c.id)}
              className={'az-viz-btn' + (c.id === activeCase ? ' az-viz-btn--on' : '')}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="az-viz__body">
        <div className="az-viz-field">
          <div className="az-viz-field__label">Original clause</div>
          <div className="az-viz-field__line">
            <Clause literals={current.originalLiterals} helperVars={[]} />
            <span className="az-viz-field__aside">
              {current.originalLiterals.length} literal{current.originalLiterals.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="az-viz-field__divider">converts to</div>

          <div className="az-viz-field__label">
            {current.resultClauses.length} clause{current.resultClauses.length === 1 ? '' : 's'}
            {current.helperCount > 0 ? (
              <span style={{ color: HELPER }}>
                {' '}+ {current.helperCount} helper variable{current.helperCount === 1 ? '' : 's'}
              </span>
            ) : (
              <span style={{ color: 'var(--az-ok)' }}> — no change needed</span>
            )}
          </div>

          {current.resultClauses.map((clause, i) => (
            <div className="az-viz-field__line" key={i}>
              <Clause literals={clause} helperVars={current.helperVars} />
              <span className="az-viz-field__aside" style={{ color: 'var(--az-ok)' }}>3 literals</span>
            </div>
          ))}

          {current.helperVars.length > 0 && (
            <div className="az-viz-field__line" style={{ borderTop: '1px solid var(--az-border)', paddingTop: 9 }}>
              <span className="az-viz-field__label">Fresh variables</span>
              {current.helperVars.map(h => (
                <span className="az-viz-chip" key={h} style={{ '--tok': HELPER }}>
                  {h} — not in the original formula
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={'az-viz-note' + (current.helperCount === 0 ? ' az-viz-note--ok' : '')}>
          {current.explanation}
        </div>

        <div className="az-viz-rule">
          <div className="az-viz-rule__label">General rule for k literals (k &gt; 3)</div>
          <p className="az-viz-rule__text" style={{ margin: 0 }}>
            A clause with <em style={{ fontStyle: 'normal', color: 'var(--az-accent)', fontWeight: 500 }}>k</em> literals
            splits into <em style={{ fontStyle: 'normal', color: 'var(--az-accent)', fontWeight: 500 }}>k − 2</em> clauses
            using <em style={{ fontStyle: 'normal', color: HELPER, fontWeight: 500 }}>k − 3</em> helper variables. Each
            helper chains two clauses together: the positive form closes one clause, the negated form opens the next.
          </p>
        </div>
      </div>

      <p className="az-viz__foot">Pick a clause size to see how it is rewritten.</p>
    </div>
  );
}

export default function ThreeSATExplorer() {
  return (
    <BrowserOnly fallback={<div className="az-viz__loading">Loading explorer</div>}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
