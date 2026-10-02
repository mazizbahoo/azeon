import React, { useState } from 'react';
import { ArrowDown, Check, Combine } from 'lucide-react';
import { Figure, Note, Segmented } from './figure';

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

export default function ThreeSATExplorer() {
  const [activeCase, setActiveCase] = useState('four');
  const current = CASES.find(c => c.id === activeCase);
  const n = current.originalLiterals.length;

  return (
    <Figure
      icon={Combine}
      kicker="Reduction"
      title="SAT to 3-SAT clause converter"
      tools={
        <Segmented
          label="Literals in the original clause"
          value={activeCase}
          onChange={setActiveCase}
          options={CASES.map((c, i) => ({ value: c.id, label: `${i + 1} literal${i ? 's' : ''}` }))}
        />
      }
      caption="Pick a clause size to see how it is rewritten. The rewritten clauses are satisfiable exactly when the original one is."
    >
      <div className="az-viz-field">
        <div className="az-viz-field__label">Original clause · {n} literal{n === 1 ? '' : 's'}</div>
        <div className="az-viz-field__line">
          <Clause literals={current.originalLiterals} helperVars={[]} />
        </div>

        <div className="az-viz-field__divider">
          <ArrowDown size={13} strokeWidth={2.25} aria-hidden="true" />
          converts to
        </div>

        <div className="az-viz-field__label">
          {current.resultClauses.length} clause{current.resultClauses.length === 1 ? '' : 's'}
          {current.helperCount > 0 ? (
            <span style={{ color: HELPER }}>
              {' '}· {current.helperCount} helper variable{current.helperCount === 1 ? '' : 's'}
            </span>
          ) : (
            <span style={{ color: 'var(--az-ok)' }}> · already 3-SAT</span>
          )}
        </div>

        {current.resultClauses.map((clause, i) => (
          <div className="az-viz-field__line" key={i}>
            <Clause literals={clause} helperVars={current.helperVars} />
            <span className="az-viz-field__aside az-viz-field__aside--ok">
              <Check size={12} strokeWidth={2.5} aria-hidden="true" /> 3 literals
            </span>
          </div>
        ))}

        {current.helperVars.length > 0 && (
          <div className="az-viz-field__line az-viz-field__line--rule">
            <span className="az-viz-field__label">Fresh variables</span>
            {current.helperVars.map(h => (
              <span className="az-viz-chip" key={h} style={{ '--tok': HELPER }}>
                {h} appears nowhere else
              </span>
            ))}
          </div>
        )}
      </div>

      <Note tone={current.helperCount === 0 ? 'ok' : undefined}>{current.explanation}</Note>

      <div className="az-viz-rule">
        <div className="az-viz-rule__label">General rule for k literals (k &gt; 3)</div>
        <p className="az-viz-rule__text">
          A clause with <em>k</em> literals splits into <em>k − 2</em> clauses using{' '}
          <em className="az-viz-rule__helper">k − 3</em> helper variables. Each helper chains two clauses together:
          the positive form closes one clause, the negated form opens the next.
        </p>
      </div>
    </Figure>
  );
}
