import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import { ArrowRight } from 'lucide-react';

interface PhaseInfo {
  num: string;
  title: string;
  slug: string;
  color: string;
  desc: string;
  totalPosts: number; // planned posts for the phase
}

export interface Phase extends PhaseInfo {
  publishedPosts: number;
}

// Published counts come from the phase-stats plugin, which counts the post
// files in each p-vs-np/NN-* folder at build time. Only edit totalPosts here.
const PHASE_INFO: PhaseInfo[] = [
  {
    num: '01',
    title: 'Foundations',
    slug: '/p-vs-np/foundations',
    color: 'var(--az-phase-01)',
    desc: 'Algorithms, Turing machines, Big-O notation, and the formal definitions of P and NP.',
    totalPosts: 10,
  },
  {
    num: '02',
    title: 'NP-Completeness',
    slug: '/p-vs-np/np-completeness',
    color: 'var(--az-phase-02)',
    desc: 'Reductions, Cook-Levin theorem, SAT, TSP, Graph Coloring, Sudoku, and the NP-Complete zoo.',
    totalPosts: 14,
  },
  {
    num: '03',
    title: 'Complexity Zoo',
    slug: '/p-vs-np/complexity-zoo',
    color: 'var(--az-phase-03)',
    desc: "coNP, PSPACE, EXP, randomized algorithms, quantum computing, and Shor's algorithm.",
    totalPosts: 10,
  },
  {
    num: '04',
    title: 'Failed Proofs',
    slug: '/p-vs-np/failed-proofs',
    color: 'var(--az-phase-04)',
    desc: 'Relativization, Natural Proofs, Algebrization, GCT and every barrier that blocks a proof.',
    totalPosts: 16,
  },
  {
    num: '05',
    title: 'Real-World Impact',
    slug: '/p-vs-np/real-world-impact',
    color: 'var(--az-phase-05)',
    desc: 'RSA encryption, supply chains, protein folding, AI, and the cost of NP-Hardness.',
    totalPosts: 12,
  },
  {
    num: '06',
    title: 'Heuristics',
    slug: '/p-vs-np/heuristics',
    color: 'var(--az-phase-06)',
    desc: 'Approximation algorithms, greedy strategies, simulated annealing, and genetic algorithms.',
    totalPosts: 12,
  },
  {
    num: '07',
    title: 'Final Verdict',
    slug: '/p-vs-np/final-verdict',
    color: 'var(--az-phase-07)',
    desc: 'The scientific consensus, the consequences of both outcomes, open research, and what comes next.',
    totalPosts: 6,
  },
];

export function usePhases() {
  const { publishedPosts } = usePluginData('phase-stats') as { publishedPosts: Record<string, number> };
  const phases: Phase[] = PHASE_INFO.map(info => ({ ...info, publishedPosts: publishedPosts[info.num] ?? 0 }));
  return {
    phases,
    totalPublished: phases.reduce((sum, p) => sum + p.publishedPosts, 0),
    totalPlanned: phases.reduce((sum, p) => sum + p.totalPosts, 0),
  };
}

export function PhaseCard({ phase }: { phase: Phase }) {
  const [hovered, setHovered] = useState(false);
  const isLive = phase.publishedPosts > 0;

  const body = (
    <>
      <div className="az-phase-card__top">
        <span
          className="az-phase-card__num"
          style={{ color: hovered && isLive ? phase.color : undefined }}
        >
          {phase.num}
        </span>
        <span className={'az-phase-card__badge' + (isLive ? ' az-phase-card__badge--live' : '')}>
          {isLive && <span className="az-phase-card__badge-dot" />}
          {isLive ? `${phase.publishedPosts} / ${phase.totalPosts} posts` : 'Coming soon'}
        </span>
      </div>
      <h3 className="az-phase-card__title">{phase.title}</h3>
      <p className="az-phase-card__desc">{phase.desc}</p>
      {isLive
        ? <span className="az-phase-card__link" style={{ color: hovered ? phase.color : undefined }}>Read phase <ArrowRight size={13} strokeWidth={2} aria-hidden="true" /></span>
        : <span className="az-phase-card__link az-phase-card__link--soon">In progress</span>
      }
    </>
  );

  // Unpublished phases have no page yet, so they render as plain cards rather than dead links.
  if (!isLive) {
    return <div className="az-phase-card az-phase-card--locked" aria-disabled="true">{body}</div>;
  }

  return (
    <Link
      to={phase.slug}
      className="az-phase-card"
      style={{
        borderColor: hovered ? phase.color : undefined,
        boxShadow: hovered ? `0 0 28px ${phase.color}22, inset 0 0 28px ${phase.color}06` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {body}
    </Link>
  );
}

export default function PhasesGrid() {
  const { phases } = usePhases();
  return (
    <div style={{ margin: '0 0 2rem' }}>
      <div className="az-phases__grid">
        {phases.map(phase => (
          <PhaseCard key={phase.num} phase={phase} />
        ))}
      </div>
    </div>
  );
}
