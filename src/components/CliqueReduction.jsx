import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/* ── Formula ─────────────────────────────────────────────── */

// φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃) ∧ (x₁ ∨ x₂ ∨ x₃)
const CLAUSES = [
  [{ var: 1, neg: false }, { var: 2, neg: true }, { var: 3, neg: false }],
  [{ var: 1, neg: true }, { var: 2, neg: false }, { var: 3, neg: true }],
  [{ var: 1, neg: false }, { var: 2, neg: false }, { var: 3, neg: false }],
];

const NODES = CLAUSES.flatMap((clause, ci) =>
  clause.map((lit, li) => ({ id: ci * 3 + li, clause: ci, lit }))
);

const contradicts = (a, b) => a.var === b.var && a.neg !== b.neg;

const EDGES = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    if (NODES[i].clause !== NODES[j].clause && !contradicts(NODES[i].lit, NODES[j].lit)) {
      EDGES.push([i, j]);
    }
  }
}

const litLabel = ({ var: v, neg }) => (neg ? `¬x${v}` : `x${v}`);

const CLAUSE_COLORS = ['var(--az-c3)', 'var(--az-c5)', 'var(--az-c2)'];
const CLAUSE_NAMES = ['Clause 1', 'Clause 2', 'Clause 3'];
const CLIQUE_COLOR = 'var(--az-ok)';
const EXAMPLE_CLIQUE = [0, 4, 6]; // x₁=T, x₂=T, x₃=T

/* ── Layout ──────────────────────────────────────────────── */

function layout(w) {
  const groupR = Math.min(w * 0.28, 140);
  const nodeR = Math.min(w * 0.1, 50);
  const cy = 20 + groupR + 2 * nodeR;
  const positions = [];
  [-90, 30, 150].forEach(deg => {
    const ga = (deg * Math.PI) / 180;
    const gx = w / 2 + groupR * Math.cos(ga);
    const gy = cy + groupR * Math.sin(ga);
    for (let li = 0; li < 3; li++) {
      const na = ((li * 120 - 90) * Math.PI) / 180;
      positions.push({ x: gx + nodeR * Math.cos(na), y: gy + nodeR * Math.sin(na) });
    }
  });
  return { positions, height: Math.max(180, 1.5 * groupR + 3.5 * nodeR + 40) };
}

/* ── Component ───────────────────────────────────────────── */

function Inner() {
  const stageRef = useRef(null);
  const [width, setWidth] = useState(400);
  const [hovered, setHovered] = useState(null);
  const [showClique, setShowClique] = useState(false);

  const measure = useCallback(() => {
    if (stageRef.current) setWidth(Math.max(300, stageRef.current.getBoundingClientRect().width));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const { positions, height } = layout(width);
  const nodeR = Math.min(Math.max(14, width * 0.038), 22);

  const neighbours = id =>
    EDGES.filter(([a, b]) => a === id || b === id).map(([a, b]) => (a === id ? b : a));

  const isLit = id => {
    if (showClique) return EXAMPLE_CLIQUE.includes(id);
    if (hovered === null) return false;
    return hovered === id || neighbours(hovered).includes(id);
  };

  const isEdgeLit = (a, b) => {
    if (showClique) return EXAMPLE_CLIQUE.includes(a) && EXAMPLE_CLIQUE.includes(b);
    if (hovered === null) return false;
    return a === hovered || b === hovered;
  };

  const idle = hovered === null && !showClique;

  return (
    <div className="az-viz">
      <div className="az-viz__head">
        <span className="az-viz__label">3-SAT <ArrowRight className="az-inline-icon" size={12} strokeWidth={2.25} aria-hidden="true" /> clique reduction</span>
        <div className="az-viz__tools">
          <button
            type="button"
            aria-pressed={!showClique}
            onClick={() => setShowClique(false)}
            className={'az-viz-btn' + (!showClique ? ' az-viz-btn--on' : '')}
          >
            Full graph
          </button>
          <button
            type="button"
            aria-pressed={showClique}
            onClick={() => { setShowClique(true); setHovered(null); }}
            className={'az-viz-btn' + (showClique ? ' az-viz-btn--on' : '')}
            style={{ '--btn-accent': CLIQUE_COLOR }}
          >
            Show 3-clique
          </button>
        </div>
      </div>

      <div className="az-viz-formula">
        <span>φ =</span>
        {CLAUSES.map((clause, ci) => (
          <React.Fragment key={ci}>
            <span className="az-viz-chip" style={{ '--tok': CLAUSE_COLORS[ci] }}>
              ({clause.map(litLabel).join(' ∨ ')})
            </span>
            {ci < CLAUSES.length - 1 && <span>∧</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="az-viz__body">
        <div ref={stageRef}>
          <svg width="100%" height={height} style={{ display: 'block' }} role="img"
            aria-label="Graph where each literal is a node and edges join compatible literals from different clauses">
            {EDGES.map(([a, b], ei) => {
              const lit = isEdgeLit(a, b);
              const stroke = showClique && lit
                ? CLIQUE_COLOR
                : lit && hovered !== null
                  ? CLAUSE_COLORS[NODES[hovered].clause]
                  : 'var(--az-border)';
              return (
                <line
                  key={ei}
                  x1={positions[a].x} y1={positions[a].y}
                  x2={positions[b].x} y2={positions[b].y}
                  stroke={stroke}
                  strokeWidth={showClique && lit ? 2.5 : lit ? 2 : 1}
                  opacity={idle ? 0.6 : lit ? 1 : 0.1}
                  style={{ transition: 'opacity 0.2s ease, stroke 0.2s ease' }}
                />
              );
            })}

            {NODES.map(node => {
              const p = positions[node.id];
              const color = CLAUSE_COLORS[node.clause];
              const inClique = showClique && EXAMPLE_CLIQUE.includes(node.id);
              const isHov = hovered === node.id;
              const dim = !idle && !isLit(node.id);
              const ring = inClique ? CLIQUE_COLOR : color;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => !showClique && setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  opacity={dim ? 0.22 : 1}
                  style={{ cursor: showClique ? 'default' : 'pointer', transition: 'opacity 0.2s ease' }}
                >
                  <circle cx={p.x} cy={p.y} r={nodeR} fill="var(--az-surface)" />
                  {(inClique || isHov) && (
                    <circle cx={p.x} cy={p.y} r={nodeR} fill={ring} fillOpacity={0.14} />
                  )}
                  <circle
                    cx={p.x} cy={p.y} r={nodeR}
                    fill="none"
                    stroke={ring}
                    strokeWidth={inClique || isHov ? 2.5 : 1.5}
                  />
                  {inClique && (
                    <circle cx={p.x} cy={p.y} r={nodeR + 5} fill="none" stroke={CLIQUE_COLOR} strokeWidth={1} opacity={0.35} />
                  )}
                  <text
                    x={p.x} y={p.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(9, nodeR * 0.58)}
                    fontFamily="var(--ifm-font-family-monospace)"
                    fontWeight={inClique || isHov ? 600 : 400}
                    fill={ring}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {litLabel(node.lit)}
                  </text>
                  {node.lit === CLAUSES[node.clause][1] && (
                    <text
                      x={p.x} y={p.y - nodeR - 8}
                      textAnchor="middle"
                      fontSize={9}
                      letterSpacing="0.1em"
                      fontFamily="var(--ifm-font-family-monospace)"
                      fill={color}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {CLAUSE_NAMES[node.clause].toUpperCase()}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="az-viz-legend">
          {CLAUSE_NAMES.map((label, i) => (
            <span className="az-viz-legend__item" key={label} style={{ '--dot': CLAUSE_COLORS[i] }}>
              <span className="az-viz-legend__dot" />
              {label}
            </span>
          ))}
          {showClique && (
            <span className="az-viz-legend__item" style={{ '--dot': CLIQUE_COLOR, color: CLIQUE_COLOR }}>
              <span className="az-viz-legend__dot" />
              3-clique (x₁=T, x₂=T, x₃=T)
            </span>
          )}
        </div>

        {showClique ? (
          <div className="az-viz-note az-viz-note--ok">
            The assignment <em>x₁=T, x₂=T, x₃=T</em> satisfies the formula. The three highlighted nodes — one per
            clause — form a <em>3-clique</em>: every pair is joined, because no two of them contradict. That is the
            reduction in action, a satisfying assignment is always a clique of size k.
          </div>
        ) : hovered !== null ? (
          <div className="az-viz-note" style={{ '--note-accent': CLAUSE_COLORS[NODES[hovered].clause] }}>
            <em>{litLabel(NODES[hovered].lit)}</em> sits in {CLAUSE_NAMES[NODES[hovered].clause]}. It joins{' '}
            {neighbours(hovered).map((nid, i, arr) => (
              <span key={nid} style={{ color: CLAUSE_COLORS[NODES[nid].clause] }}>
                {litLabel(NODES[nid].lit)}{i < arr.length - 1 ? ', ' : ''}
              </span>
            ))}
            {(() => {
              const missing = NODES.filter(
                n => n.clause !== NODES[hovered].clause && !neighbours(hovered).includes(n.id)
              );
              if (!missing.length) return '.';
              return (
                <>
                  {' '}but not{' '}
                  {missing.map((n, i) => (
                    <span key={n.id} style={{ color: 'var(--az-no)' }}>
                      {litLabel(n.lit)}{i < missing.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {' '}— those are contradictory: same variable, opposite sign.
                </>
              );
            })()}
          </div>
        ) : (
          <div className="az-viz-hint">
            Hover a node to trace its edges, or show the 3-clique to see the satisfying assignment.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CliqueReduction() {
  return (
    <BrowserOnly fallback={<div className="az-viz__loading">Loading graph</div>}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
