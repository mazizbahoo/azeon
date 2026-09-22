import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import katex from 'katex';

/* ─── KaTeX helper ──────────────────────────────────────── */

function KaTeX({ math, display = false, style }: { math: string; display?: boolean; style?: React.CSSProperties }) {
  const html = katex.renderToString(math, { throwOnError: false, displayMode: display });
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ─── Data ─────────────────────────────────────────────── */

const FLOATING_SYMBOLS = [
  'P', 'NP', 'O(n²)', 'Azeon', '≟', '∅', 'Σ*', '∀x', '∃',
  'SAT', '2ⁿ', 'log n', 'NP-Hard', '⊆', 'coNP', 'P≠NP',
  'PSPACE', 'BPP', 'EXP', 'Ω(n)', 'Θ', '⊕', '¬', '∧', '∨',
];

interface Phase {
  num: string;
  title: string;
  slug: string;
  color: string;
  desc: string;
  publishedPosts: number;
  totalPosts: number;
}

const PHASES: Phase[] = [
  { num: '01', title: 'Foundations', slug: '/p-vs-np/foundations', color: 'var(--az-phase-01)', desc: 'Algorithms, Turing machines, Big-O notation, and the formal definitions of P and NP.', publishedPosts: 10, totalPosts: 10 },
  { num: '02', title: 'NP-Completeness', slug: '/p-vs-np/np-completeness', color: 'var(--az-phase-02)', desc: 'Reductions, Cook-Levin theorem, SAT, TSP, Graph Coloring, Sudoku, and the NP-Complete zoo.', publishedPosts: 14, totalPosts: 14 },
  { num: '03', title: 'Complexity Zoo', slug: '/p-vs-np/complexity-zoo', color: 'var(--az-phase-03)', desc: "coNP, PSPACE, EXP, randomized algorithms, quantum computing, and Shor's algorithm.", publishedPosts: 10, totalPosts: 10 },
  { num: '04', title: 'Failed Proofs', slug: '/p-vs-np/failed-proofs', color: 'var(--az-phase-04)', desc: 'Relativization, Natural Proofs, Algebrization, GCT and every barrier that blocks a proof.', publishedPosts: 16, totalPosts: 16 },
  { num: '05', title: 'Real-World Impact', slug: '/p-vs-np/real-world-impact', color: 'var(--az-phase-05)', desc: 'RSA encryption, supply chains, protein folding, AI, and the cost of NP-Hardness.', publishedPosts: 10, totalPosts: 12 },
  { num: '06', title: 'Heuristics', slug: '/p-vs-np/heuristics', color: 'var(--az-phase-06)', desc: 'Approximation algorithms, greedy strategies, simulated annealing, and genetic algorithms.', publishedPosts: 0, totalPosts: 12 },
  { num: '07', title: 'Final Verdict', slug: '/p-vs-np/final-verdict', color: 'var(--az-phase-07)', desc: 'The scientific consensus, the consequences of both outcomes, open research, and what comes next.', publishedPosts: 0, totalPosts: 6 },
];

// Derived — update only the PHASES array above as you publish
const TOTAL_PUBLISHED = PHASES.reduce((sum, p) => sum + p.publishedPosts, 0);
const TOTAL_PLANNED = PHASES.reduce((sum, p) => sum + p.totalPosts, 0);

const STATS = [
  { value: '1', label: 'Active Project' },
  { value: String(TOTAL_PUBLISHED), label: 'Posts Live' },
  { value: String(TOTAL_PLANNED), label: 'Posts Planned' },
  { value: '∞', label: 'More Coming' },
];

const ACHIEVEMENTS = [
  { icon: '🏆', text: 'Perfect CS score in Matriculation' },
  { icon: '🧩', text: 'Rubik\'s Cube solver under 45 seconds' },
  { icon: '💻', text: 'Web development & graphic designing since age 14' },
  { icon: '📖', text: 'Founder of Azeon' },
];

const SAFE_ITEMS = [
  'Your bank account stays encrypted',
  'Passwords remain unbreakable',
  'Hard problems stay hard by law of math',
  'The internet keeps functioning',
  'This is what 99% of experts believe',
];

const DANGER_ITEMS = [
  'All encryption collapses overnight',
  'Banks, governments, crypto, all gone',
  'Drug discovery becomes instant',
  'AI generates perfect art and code',
  'The $1M prize becomes irrelevant',
];

/* ─── Hero ──────────────────────────────────────────────── */

function Hero() {
  const symbols = React.useMemo(() =>
    FLOATING_SYMBOLS.map((sym, i) => ({
      sym,
      size: `${(i % 3) * 0.18 + 0.65}rem`,
      color: i % 3 === 0 ? 'rgba(166,124,255,0.16)' : i % 3 === 1 ? 'rgba(166,124,255,0.12)' : 'rgba(166,124,255,0.08)',
      left: `${(i / FLOATING_SYMBOLS.length) * 100}%`,
      top: `${((i * 37) % 100)}%`,
      dur: `${((i * 7) % 12) + 10}s`,
      del: `${((i * 3) % 8)}s`,
    }))
    , []);

  return (
    <section className="az-hero">
      <div className="az-hero__grid" />
      <div className="az-hero__glow" />

      {symbols.map(({ sym, size, color, left, top, dur, del }, i) => (
        <span
          key={i}
          className="az-hero__symbol"
          style={{ fontSize: size, color, left, top, '--sym-dur': dur, '--sym-del': del } as React.CSSProperties}
        >
          {sym}
        </span>
      ))}

      <div className="az-hero__badge">
        <span className="az-hero__badge-dot" />
        <span className="az-hero__badge-text">Open Knowledge</span>
      </div>

      <h1 className="az-hero__title">
        <span className="az-hero__np">Azeon</span>
      </h1>

      <p className="az-hero__equation">
        Hard ideas. Documented in public. From first principles.
      </p>

      <p className="az-hero__tagline">
        Deep-dive documentation and essays on the problems that matter most,
        starting with the hardest open question in computer science.
      </p>

      <div className="az-hero__ctas">
        <Link
          to="/p-vs-np"
          className="az-btn az-btn--primary"
        >
          Read P vs NP
        </Link>
        <Link to="/blog" className="az-btn az-btn--ghost">
          Founder Blog
        </Link>
      </div>
    </section>
  );
}

/* ─── Stats Bar ─────────────────────────────────────────── */

function StatsBar() {
  return (
    <div className="az-stats">
      {STATS.map(({ value, label }) => (
        <div key={label} className="az-stats__item">
          <div className="az-stats__value">{value}</div>
          <div className="az-stats__label">{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── What Is Azeon ─────────────────────────────────────── */

function WhatIsAzeon() {
  return (
    <section className="az-section az-section--dark az-section--border">
      <div className="az-container">
        <div className="az-two-col">
          <div>
            <span className="az-eyebrow">// What is Azeon?</span>
            <h2 className="az-h2">
              Not a course.<br />
              <span className="az-h2--muted">A public record of learning.</span>
            </h2>
            <p className="az-body">
              Azeon is where I document the hard things I'm trying to understand, not after I've
              mastered them, but while I'm in the middle of figuring them out. Every project is
              structured from the absolute basics, written so a complete beginner can follow along,
              and published openly as it gets built.
            </p>
            <p className="az-body">
              The current project covers P vs NP, the million-dollar unsolved problem in
              theoretical computer science. More documentation projects and blog posts are on the way.
            </p>
          </div>

          <div className="az-diagram">
            <div className="az-diagram__ring az-diagram__ring--exp">
              <span className="az-diagram__ring-label">EXP</span>
            </div>
            <div className="az-diagram__ring az-diagram__ring--pspace">
              <span className="az-diagram__ring-label">PSPACE</span>
            </div>
            <div className="az-diagram__ring az-diagram__ring--np">
              <span className="az-diagram__ring-label">NP</span>
            </div>
            <div className="az-diagram__core">
              <span className="az-diagram__core-label">
                <KaTeX math="\mathcal{P}" />
              </span>
            </div>
            <div className="az-diagram__qmark">
              <KaTeX math="\overset{?}{=}" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Phase Card ────────────────────────────────────────── */

function PhaseCard({ phase }: { phase: Phase }) {
  const [hovered, setHovered] = useState(false);
  const isLive = phase.publishedPosts > 0;

  const badgeText = isLive
    ? `${phase.publishedPosts} / ${phase.totalPosts} posts`
    : 'Coming soon';

  return (
    <Link
      to={isLive ? phase.slug : '#'}
      className={`az-phase-card${!isLive ? ' az-phase-card--locked' : ''}`}
      style={{
        borderColor: hovered && isLive ? phase.color : undefined,
        boxShadow: hovered && isLive ? `0 0 28px ${phase.color}22, inset 0 0 28px ${phase.color}06` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isLive) e.preventDefault(); }}
    >
      <div className="az-phase-card__top">
        <span className="az-phase-card__num" style={{ color: hovered && isLive ? phase.color : undefined }}>
          {phase.num}
        </span>
        <span className={`az-phase-card__badge${isLive ? ' az-phase-card__badge--live' : ''}`}>
          {isLive && <span className="az-phase-card__badge-dot" />}
          {badgeText}
        </span>
      </div>
      <h3 className="az-phase-card__title">{phase.title}</h3>
      <p className="az-phase-card__desc">{phase.desc}</p>
      {isLive
        ? <span className="az-phase-card__link" style={{ color: hovered ? phase.color : undefined }}>Read phase →</span>
        : <span className="az-phase-card__link az-phase-card__link--soon">In progress</span>
      }
    </Link>
  );
}

/* ─── Featured Project ──────────────────────────────────── */

function FeaturedProject() {
  return (
    <section className="az-section az-section--surface az-section--border">
      <div className="az-container">
        <div className="az-featured__header">
          <span className="az-eyebrow">// Featured Project — Active</span>
          <h2 className="az-h2">P vs NP Explained</h2>
          <p className="az-body az-featured__subtitle">
            An 80-post curriculum on the most important open problem in computer science.
            No prerequisites. Starts from what an algorithm is, ends at the frontiers of
            complexity theory.
          </p>
          <div className="az-featured__meta">
            <span className="az-featured__pill az-featured__pill--live">
              <span className="az-featured__pill-dot" />
              Live
            </span>
            <span className="az-featured__pill">{TOTAL_PUBLISHED} of {TOTAL_PLANNED} posts published</span>
            <span className="az-featured__pill">7 phases</span>
            <span className="az-featured__pill">$1,000,000 prize</span>
          </div>
        </div>

        <div className="az-phases__grid">
          {PHASES.map(phase => <PhaseCard key={phase.num} phase={phase} />)}
        </div>

        <div className="az-featured__cta">
          <Link
            to="/p-vs-np/foundations/introduction-to-the-millennium-prize"
            className="az-btn az-btn--accent"
          >
            Start with Post #1
          </Link>
          <Link to="/p-vs-np/" className="az-btn az-btn--ghost">
            Browse Phases
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Stakes Section ────────────────────────────────────── */

function StakesSection() {
  return (
    <section className="az-section az-section--dark az-section--border">
      <div className="az-container">
        <div className="az-phases__header">
          <span className="az-eyebrow">// Why P vs NP Matters</span>
          <h2 className="az-h2">Two answers. Two worlds.</h2>
        </div>
        <div className="az-stakes__grid">
          <div className="az-stakes__card az-stakes__card--safe">
            <div className="az-stakes__eq"><KaTeX math="\mathcal{P} \neq \mathcal{NP}" /></div>
            <span className="az-stakes__label">The Protected World</span>
            {SAFE_ITEMS.map(item => (
              <div key={item} className="az-stakes__item">
                <span className="az-stakes__icon">✓</span>
                <span className="az-stakes__item-text">{item}</span>
              </div>
            ))}
          </div>
          <div className="az-stakes__card az-stakes__card--danger">
            <div className="az-stakes__eq"><KaTeX math="\mathcal{P} = \mathcal{NP}" /></div>
            <span className="az-stakes__label">The Shattered World</span>
            {DANGER_ITEMS.map(item => (
              <div key={item} className="az-stakes__item">
                <span className="az-stakes__icon">⚡</span>
                <span className="az-stakes__item-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Coming Soon ───────────────────────────────────────── */

function ComingSoon() {
  return (
    <section className="az-section az-section--surface az-section--border">
      <div className="az-container">
        <div className="az-phases__header">
          <span className="az-eyebrow">// What's Next</span>
          <h2 className="az-h2">More projects. More ideas.</h2>
          <p className="az-body az-featured__subtitle">
            P vs NP is only the beginning. New documentation projects and blog posts
            will be added as they're written.
          </p>
        </div>
        <div className="az-coming__grid">
          <div className="az-coming-card">
            <div className="az-coming-card__icon">📄</div>
            <div className="az-coming-card__type">Documentation</div>
            <div className="az-coming-card__title">Next Project</div>
            <div className="az-coming-card__desc">
              A new deep-dive documentation series is being researched. Topic TBD.
            </div>
            <div className="az-coming-card__status">Coming soon</div>
          </div>
          <div className="az-coming-card">
            <div className="az-coming-card__icon">✍️</div>
            <div className="az-coming-card__type">Blog</div>
            <div className="az-coming-card__title">Essays & Thoughts</div>
            <div className="az-coming-card__desc">
              Short-form posts on ideas, problems, and things worth thinking about.
            </div>
            <Link to="/blog" className="az-coming-card__link">Visit the blog</Link>
          </div>
          <div className="az-coming-card">
            <div className="az-coming-card__icon">🔬</div>
            <div className="az-coming-card__type">Research</div>
            <div className="az-coming-card__title">Open Questions</div>
            <div className="az-coming-card__desc">
              Notes and explorations on hard problems that don't yet have a home project.
            </div>
            <div className="az-coming-card__status">In progress</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ─────────────────────────────────────── */

function AboutSection() {
  return (
    <section className="az-section az-section--dark az-section--border">
      <div className="az-container">
        <div className="az-about__grid">
          <div className="az-id-card">
            <img
              src="https://github.com/mazizbahoo.png"
              alt="Aziz"
              className="az-id-card__avatar"
            />
            <h3 className="az-id-card__name">Aziz</h3>
            <span className="az-id-card__role">Founder of Azeon</span>
            <div className="az-id-card__facts">
              {ACHIEVEMENTS.map(({ icon, text }) => (
                <div key={text} className="az-id-card__fact">
                  <span className="az-id-card__fact-icon">{icon}</span>
                  <span className="az-id-card__fact-text">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="az-eyebrow">// The Author</span>
            <h2 className="az-h2">
              Learning hard things.<br />
              <span className="az-h2--muted">Writing it all down.</span>
            </h2>
            <p className="az-body">
              I'm a student at FC College in Lahore. I started freelancing in web development and
              graphic design at 14, founded Azizdevs, and have been building things in public ever since.
            </p>
            <p className="az-body">
              Azeon is my attempt to do something different: instead of waiting until I understand
              something fully before writing about it, I document the process in real time along with the
              confusion, the wrong turns, the analogies that finally make something click.
            </p>
            <p className="az-body">
              If you find something useful here, that's the whole point.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="az-cta">
      <div className="az-cta__glow" />
      <div className="az-cta__watermark">Azeon</div>
      <div className="az-cta__content">
        <span className="az-eyebrow">// Start Here</span>
        <h2 className="az-cta__title">
          Begin with the flagship.<br />No background needed.
        </h2>
        <p className="az-cta__body">
          Post #1 introduces the P vs NP problem, the million-dollar prize, and what
          this entire documentation project is about.
        </p>
        <Link
          to="/p-vs-np/foundations/introduction-to-the-millennium-prize"
          className="az-btn az-btn--accent"
        >
          Intro to P vs NP
        </Link>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function Home() {
  return (
    <Layout
      title="Azeon — Hard Ideas, Documented in Public"
      description="Deep-dive documentation and essays on the problems that matter most."
    >
      <main className="az-main">
        <Hero />
        <StatsBar />
        <WhatIsAzeon />
        <FeaturedProject />
        <StakesSection />
        <ComingSoon />
        <AboutSection />
        <FinalCTA />
      </main>
    </Layout>
  );
}