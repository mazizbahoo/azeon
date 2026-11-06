import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Figure, Segmented } from './figure';

/* ── SAT → 3-SAT: rewriting one clause ───────────────────── */

const CASES = {
  1: { original: ['x₁'], result: [['x₁', 'y₁', 'y₂']] },
  2: { original: ['x₁', 'x₂'], result: [['x₁', 'x₂', 'y₁']] },
  3: { original: ['x₁', 'x₂', 'x₃'], result: [['x₁', 'x₂', 'x₃']] },
  4: { original: ['x₁', 'x₂', 'x₃', 'x₄'], result: [['x₁', 'x₂', 'y₁'], ['¬y₁', 'x₃', 'x₄']] },
  5: { original: ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'], result: [['x₁', 'x₂', 'y₁'], ['¬y₁', 'x₃', 'y₂'], ['¬y₂', 'x₄', 'x₅']] },
};

const isHelper = l => l.includes('y');

function Clause({ literals }) {
  return (
    <div className="az-3sat__clause">
      {literals.map((l, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="az-3sat__or">∨</span>}
          <span className="az-fig-token" data-on={String(isHelper(l))}>{l}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ThreeSATExplorer() {
  const [k, setK] = useState(4);
  const c = CASES[k];
  const helpers = new Set(c.result.flat().filter(isHelper).map(l => l.replace('¬', ''))).size;

  return (
    <Figure
      title="SAT to 3-SAT"
      tools={
        <Segmented
          label="Literals in the clause"
          value={k}
          onChange={setK}
          options={Object.keys(CASES).map(n => ({ value: +n, label: `${n} literal${n === '1' ? '' : 's'}` }))}
        />
      }
      status={k === 3
        ? <>Already three literals: <b>no change</b></>
        : <><b>{c.result.length}</b> clause{c.result.length > 1 ? 's' : ''} · <b>{helpers}</b> new helper variable{helpers > 1 ? 's' : ''}</>}
    >
      <div className="az-3sat">
        <span className="az-fig-label">Original</span>
        <Clause literals={c.original} />
        <ArrowDown className="az-3sat__arrow" size={16} strokeWidth={2} aria-hidden="true" />
        <span className="az-fig-label">3-SAT</span>
        {c.result.map((r, i) => <Clause key={i} literals={r} />)}
      </div>
    </Figure>
  );
}
