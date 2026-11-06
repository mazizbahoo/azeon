import React from 'react';
import Link from '@docusaurus/Link';
import { ArrowDown } from 'lucide-react';
import { Figure } from './figure';

/* ── The chain of reductions that starts with Cook–Levin ─── */

const STEPS = [
  { name: 'Any problem in NP' },
  { name: 'Its polynomial-time verifier', via: 'by definition of NP' },
  { name: 'SAT', via: 'Cook–Levin', post: 12, to: '/p-vs-np/np-completeness/the-cook-levin-theorem' },
  { name: '3-SAT', via: 'split long clauses', post: 14, to: '/p-vs-np/np-completeness/3-sat-the-building-block' },
  { name: 'Clique', via: 'one node per literal', post: 15, to: '/p-vs-np/np-completeness/the-clique-problem' },
  { name: 'Vertex cover', via: 'complement of an independent set', post: 16, to: '/p-vs-np/np-completeness/vertex-cover' },
];

export default function ReductionChain() {
  return (
    <Figure title="A chain of reductions">
      <ol className="az-chain">
        {STEPS.map(st => (
          <li key={st.name}>
            {st.via && (
              <div className="az-chain__via">
                <ArrowDown size={14} strokeWidth={2} aria-hidden="true" />
                <span>{st.via}</span>
              </div>
            )}
            <div className="az-chain__step">
              <span>{st.name}</span>
              {st.post && <Link to={st.to} className="az-chain__post">Post {st.post}</Link>}
            </div>
          </li>
        ))}
      </ol>
    </Figure>
  );
}
