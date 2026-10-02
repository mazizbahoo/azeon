import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { ArrowDown, BookOpen, Workflow } from 'lucide-react';
import { Figure } from './figure';

/* ── The chain of reductions from Cook–Levin (Post 12) ─────
   Each arrow A → B is a polynomial-time reduction: a fast
   solver for B would give a fast solver for A. */

const STEPS = [
  {
    id: 'np',
    name: 'Any NP problem',
    sub: 'Sudoku, TSP, …',
    detail: 'Every problem in NP has a polynomial-time verifier: given a certificate, it can check a yes-answer quickly. That is the only thing Cook–Levin needs to know about the problem.',
  },
  {
    id: 'verifier',
    name: 'Its verifier',
    sub: 'runs in p(n) steps',
    via: 'definition of NP',
    detail: 'The verifier is a Turing machine that halts within p(n) steps. Its whole run, every cell of tape at every step, fits in a p(n) × p(n) table.',
  },
  {
    id: 'sat',
    name: 'SAT',
    sub: 'one Boolean formula',
    via: 'Cook–Levin',
    post: { n: 12, to: '/p-vs-np/np-completeness/the-cook-levin-theorem' },
    detail: 'Cook–Levin writes the rules of that table as clauses: the formula is satisfiable exactly when some certificate makes the verifier accept. Its size is about p(n)², still polynomial. So every NP problem reduces to SAT.',
  },
  {
    id: '3sat',
    name: '3-SAT',
    sub: 'three literals per clause',
    via: 'split clauses',
    post: { n: 14, to: '/p-vs-np/np-completeness/3-sat-the-building-block' },
    detail: 'Long clauses are split into chains of 3-literal clauses joined by fresh helper variables; short ones are padded. Satisfiability is preserved, so 3-SAT is NP-complete too.',
  },
  {
    id: 'clique',
    name: 'Clique',
    sub: 'k nodes, all connected',
    via: 'literal graph',
    post: { n: 15, to: '/p-vs-np/np-completeness/the-clique-problem' },
    detail: 'Each literal becomes a node; compatible literals in different clauses are joined. The formula is satisfiable exactly when the graph has a clique with one node per clause.',
  },
  {
    id: 'vc',
    name: 'Vertex cover',
    sub: 'k nodes touch every edge',
    via: 'complement',
    post: { n: 16, to: '/p-vs-np/np-completeness/vertex-cover' },
    detail: 'A clique in a graph is an independent set in its complement, and the nodes outside an independent set always form a vertex cover. Three short steps, and Vertex Cover is NP-complete.',
  },
];

export default function ReductionChain() {
  const [active, setActive] = useState(2);
  const cur = STEPS[active];

  return (
    <Figure
      icon={Workflow}
      kicker="NP-completeness"
      title="One theorem, a chain of reductions"
      caption="Each arrow is a polynomial-time reduction: a fast algorithm for the problem below would give a fast algorithm for the one above. So a fast algorithm for anything at the bottom would solve everything above it."
    >
      <div className="az-chain-wrap">
        <ol className="az-chain" aria-label="Chain of reductions">
          {STEPS.map((st, i) => (
            <li key={st.id} className="az-chain__item">
              {i > 0 && (
                <span className="az-chain__arrow" data-on={String(i <= active)} aria-hidden="true">
                  <ArrowDown size={14} strokeWidth={2.25} />
                  <span className="az-chain__via">{st.via}</span>
                </span>
              )}
              <button
                type="button"
                className="az-chain__node"
                data-on={String(i <= active)}
                data-current={String(i === active)}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <span className="az-chain__num">{i + 1}</span>
                <span className="az-chain__text">
                  <span className="az-chain__name">{st.name}</span>
                  <span className="az-chain__sub">{st.sub}</span>
                </span>
                {st.post && <span className="az-chain__post">Post {st.post.n}</span>}
              </button>
            </li>
          ))}
        </ol>

        <div className="az-chain__detail" aria-live="polite">
          <span className="az-viz__label">Step {active + 1} of {STEPS.length}</span>
          <h4 className="az-chain__title">{cur.name}</h4>
          <p className="az-chain__body">{cur.detail}</p>
          {active > 1 && (
            <p className="az-chain__body az-chain__muted">
              So a fast algorithm for <strong>{cur.name}</strong> would give fast algorithms for{' '}
              {[...STEPS.slice(2, active).map(st => st.name).reverse(), 'every problem in NP'].join(', ')}.
            </p>
          )}
          {cur.post && (
            <Link to={cur.post.to} className="az-chain__link">
              <BookOpen size={14} strokeWidth={2} aria-hidden="true" /> Read Post {cur.post.n}
            </Link>
          )}
        </div>
      </div>
    </Figure>
  );
}
