import React, { useState, useRef, useEffect, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

/* ── Formula Definition ──────────────────────────────────────────── */

// φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃) ∧ (x₁ ∨ x₂ ∨ x₃)
const CLAUSES = [
  [{ var: 1, neg: false }, { var: 2, neg: true }, { var: 3, neg: false }],
  [{ var: 1, neg: true }, { var: 2, neg: false }, { var: 3, neg: true }],
  [{ var: 1, neg: false }, { var: 2, neg: false }, { var: 3, neg: false }],
];

// Build flat node list: nodes 0..8
const NODES = CLAUSES.flatMap((clause, ci) =>
  clause.map((lit, li) => ({ id: ci * 3 + li, clause: ci, lit }))
);

// Two literals are contradictory if same variable, opposite negation
function contradicts(a, b) {
  return a.var === b.var && a.neg !== b.neg;
}

// Build edge list: connect nodes from DIFFERENT clauses that don't contradict
const EDGES = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    const ni = NODES[i], nj = NODES[j];
    if (ni.clause !== nj.clause && !contradicts(ni.lit, nj.lit)) {
      EDGES.push([i, j]);
    }
  }
}

function litLabel({ var: v, neg }) {
  return neg ? `¬x${v}` : `x${v}`;
}

const CLAUSE_COLORS = ['#a67cff', '#e07b45', '#4caf50'];
const CLAUSE_NAMES = ['Clause 1', 'Clause 2', 'Clause 3'];

/* ── Node positions in SVG (arranged in 3 groups) ─────────────── */
// We'll use a layout: clause groups as triangle clusters

function getNodePositions(w, h) {
  const cx = w / 2;
  const groupRadius = Math.min(w * 0.28, 140);
  const nodeRadius = Math.min(w * 0.10, 50);
  const paddingY = 40;
  const cy = (paddingY / 2) + groupRadius + 2 * nodeRadius;

  // Each clause group is centered at 120° apart
  const groupAngles = [-90, 30, 150]; // degrees, starting top
  const positions = [];
  for (let ci = 0; ci < 3; ci++) {
    const ga = (groupAngles[ci] * Math.PI) / 180;
    const gx = cx + groupRadius * Math.cos(ga);
    const gy = cy + groupRadius * Math.sin(ga);
    // Within each group, 3 nodes in a small triangle
    for (let li = 0; li < 3; li++) {
      const na = (((li * 120) - 90) * Math.PI) / 180;
      positions.push({
        x: gx + nodeRadius * Math.cos(na),
        y: gy + nodeRadius * Math.sin(na),
      });
    }
  }
  return positions;
}

/* ── Satisfying assignment → clique highlighting ──────────────── */

const EXAMPLE_CLIQUE = [0, 4, 6]; // 3-clique for x₁=T,x₂=T,x₃=T

/* ── Main Inner component ──────────────────────────────────────── */

function Inner() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';

  const svgRef = useRef(null);
  const [dims, setDims] = useState({ w: 400, h: 360 });
  const [hovered, setHovered] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [showClique, setShowClique] = useState(false);
  const [step, setStep] = useState(0); // 0=full graph, 1=step through edge building

  const measure = useCallback(() => {
    if (!svgRef.current) return;
    const { width } = svgRef.current.getBoundingClientRect();
    const w = Math.max(300, width);
    const gR = Math.min(w * 0.28, 140);
    const nR = Math.min(w * 0.10, 50);
    const paddingY = 40;
    const h = 1.5 * gR + 3.5 * nR + paddingY;
    setDims({ w, h: Math.max(180, h) });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const positions = getNodePositions(dims.w, dims.h);

  // Design tokens
  const accent = 'var(--az-accent)';
  const bg = 'var(--az-surface)';
  const bgEl = 'var(--az-elevated)';
  const bdr = 'var(--az-border)';
  const bdrSub = 'var(--az-border-subtle)';
  const tPri = 'var(--az-text)';
  const tMut = 'var(--az-text)';
  const mono = 'var(--ifm-font-family-monospace)';
  const edgeDefault = 'var(--az-border)';

  const isNodeHighlighted = (nid) => {
    if (showClique) return EXAMPLE_CLIQUE.includes(nid);
    if (hovered === null) return false;
    // highlight hovered node + its neighbors
    if (hovered === nid) return true;
    return EDGES.some(([a, b]) =>
      (a === hovered && b === nid) || (b === hovered && a === nid)
    );
  };

  const isEdgeHighlighted = (a, b) => {
    if (showClique) {
      return EXAMPLE_CLIQUE.includes(a) && EXAMPLE_CLIQUE.includes(b);
    }
    if (hovered === null) return false;
    return a === hovered || b === hovered;
  };

  const isEdgeDimmed = (a, b) => {
    if (showClique) return !isEdgeHighlighted(a, b);
    if (hovered === null) return false;
    return !isEdgeHighlighted(a, b);
  };

  const NODE_R = Math.min(Math.max(14, dims.w * 0.038), 22);

  return (
    <div style={{ fontFamily: mono, margin: '2rem 0', boxShadow: 'var(--az-card-shadow)', borderRadius: 24 }}>

      {/* Title bar */}
      <div style={{
        background: bg,
        border: `1px solid ${bdr}`,
        borderRadius: '24px 24px 0 0',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        borderBottom: `1px solid ${bdrSub}`,
      }}>
        <span style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: accent }}>
          // 3-SAT → Clique Reduction
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'full', label: 'Full Graph', onClick: () => { setShowClique(false); }, active: !showClique, color: accent, bgActive: 'var(--az-accent-dim)' },
            { id: 'clique', label: 'Show 3-Clique', onClick: () => { setShowClique(true); setHovered(null); }, active: showClique, color: '#4caf50', bgActive: 'rgba(76,175,80,0.10)' }
          ].map(btn => {
            const isHovered = hoveredBtn === btn.id;
            return (
              <button
                key={btn.id}
                onClick={btn.onClick}
                onMouseEnter={() => setHoveredBtn(btn.id)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.04em',
                  padding: '4px 12px', borderRadius: 999,
                  border: `1px solid ${btn.active ? btn.color : (isHovered ? bdrSub : bdr)}`,
                  background: btn.active ? btn.bgActive : (isHovered ? bgEl : 'var(--az-bg)'),
                  color: btn.active ? btn.color : tMut,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Formula display */}
      <div style={{
        background: bg, border: `1px solid ${bdr}`, borderTop: 'none',
        padding: '8px 16px',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tMut }}>φ =</span>
        {CLAUSES.map((clause, ci) => (
          <React.Fragment key={ci}>
            <span style={{
              fontSize: '0.75rem', fontFamily: mono,
              color: CLAUSE_COLORS[ci],
              background: 'var(--az-elevated)',
              border: `1px solid ${CLAUSE_COLORS[ci]}44`,
              borderRadius: 999, padding: '2px 10px',
            }}>
              ({clause.map(l => litLabel(l)).join(' ∨ ')})
            </span>
            {ci < CLAUSES.length - 1 && (
              <span style={{ fontSize: '0.7rem', color: tMut }}>∧</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* SVG Graph and Insights */}
      <div style={{
        background: bg, border: `1px solid ${bdr}`, borderTop: 'none',
        borderRadius: '0 0 24px 24px',
        padding: '0',
        overflow: 'hidden',
      }}>

        <svg
          ref={svgRef}
          width="100%"
          height={dims.h}
          style={{ display: 'block', cursor: 'default' }}
        >
          {/* Edges */}
          {EDGES.map(([a, b], ei) => {
            const pa = positions[a], pb = positions[b];
            if (!pa || !pb) return null;
            const highlighted = isEdgeHighlighted(a, b);
            const dimmed = isEdgeDimmed(a, b);
            const cliqueEdge = showClique && highlighted;
            const hovColor = (highlighted && hovered !== null) ? CLAUSE_COLORS[NODES[hovered].clause] : accent;
            return (
              <line
                key={ei}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={cliqueEdge ? '#4caf50' : highlighted ? hovColor : edgeDefault}
                strokeWidth={cliqueEdge ? 2.5 : highlighted ? 2 : 1}
                opacity={dimmed ? 0.12 : (hovered === null && !showClique) ? 0.55 : highlighted ? 1 : 0.12}
                style={{ transition: 'all 0.2s' }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const p = positions[node.id];
            if (!p) return null;
            const color = CLAUSE_COLORS[node.clause];
            const isClique = showClique && EXAMPLE_CLIQUE.includes(node.id);
            const isHov = hovered === node.id;
            const isNeighbor = hovered !== null && !isHov && isNodeHighlighted(node.id);
            const dimNode = (hovered !== null || showClique) && !isNodeHighlighted(node.id);

            let fillColor = dark ? '#0f0f0f' : '#ffffff';
            let strokeColor = color;
            let strokeW = 1.5;
            let opacity = dimNode ? 0.25 : 1;

            if (isClique) { fillColor = `${color}28`; strokeW = 2.5; }
            if (isHov) { fillColor = `${color}22`; strokeW = 2.5; }
            if (isNeighbor) { strokeW = 2; }

            return (
              <g
                key={node.id}
                onMouseEnter={() => !showClique && setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: showClique ? 'default' : 'pointer' }}
              >
                <circle
                  cx={p.x} cy={p.y} r={NODE_R}
                  fill={bg}
                  stroke="none"
                />
                <circle
                  cx={p.x} cy={p.y} r={NODE_R}
                  fill={fillColor}
                  stroke={isClique ? '#4caf50' : strokeColor}
                  strokeOpacity={opacity}
                  strokeWidth={strokeW}
                  style={{ transition: 'all 0.2s' }}
                />
                {/* Clique glow ring */}
                {isClique && (
                  <circle
                    cx={p.x} cy={p.y} r={NODE_R + 5}
                    fill="none"
                    stroke="#4caf50"
                    strokeWidth={1}
                    opacity={0.3}
                  />
                )}
                <text
                  x={p.x} y={p.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.max(9, NODE_R * 0.58)}
                  fontFamily={mono}
                  fontWeight={isHov || isClique ? 600 : 400}
                  fillOpacity={opacity}
                  fill={isClique ? '#4caf50' : isHov ? color : strokeColor}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {litLabel(node.lit)}
                </text>
                {/* Clause label above group — only show for first node of each clause */}
                {node.lit === CLAUSES[node.clause][1] && (
                  <text
                    x={p.x}
                    y={p.y - NODE_R - 7}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily={mono}
                    fill={color}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {CLAUSE_NAMES[node.clause]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend / hint */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          paddingTop: 0, paddingBottom: 4,
        }}>
          {CLAUSE_COLORS.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${c}`, background: 'transparent' }} />
              <span style={{ fontSize: '0.58rem', letterSpacing: '0.06em', color: tMut }}>
                {CLAUSE_NAMES[i]}
              </span>
            </div>
          ))}
          {showClique && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #4caf50', background: 'rgba(76,175,80,0.15)' }} />
              <span style={{ fontSize: '0.58rem', letterSpacing: '0.06em', color: '#4caf50' }}>
                3-Clique (x₁=T, x₂=T, x₃=T)
              </span>
            </div>
          )}
        </div>

        {/* Insights at the bottom */}
        <div style={{ padding: '0 16px', minHeight: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Hover insight */}
          {hovered !== null && !showClique && (() => {
            const node = NODES[hovered];
            const neighbors = EDGES
              .filter(([a, b]) => a === hovered || b === hovered)
              .map(([a, b]) => (a === hovered ? b : a))
              .map(nid => NODES[nid]);
            const noEdge = NODES.filter((n, nid) => {
              if (n.clause === node.clause) return false;
              if (nid === hovered) return false;
              return !EDGES.some(([a, b]) =>
                (a === hovered && b === nid) || (b === hovered && a === nid)
              );
            });
            return (
              <div style={{
                marginBottom: 12,
                background: bgEl,
                borderRadius: '0 10px 10px 0',
                borderLeft: `2px solid ${CLAUSE_COLORS[node.clause]}`,
                padding: '10px 14px',
                fontSize: '0.7rem',
                lineHeight: 1.75,
                color: tMut,
              }}>
                <span style={{ color: CLAUSE_COLORS[node.clause], fontWeight: 600 }}>
                  {litLabel(node.lit)}
                </span>{' '}
                is from {CLAUSE_NAMES[node.clause]}.{' '}
                It has edges to:{' '}
                {neighbors.length > 0
                  ? neighbors.map((n, i) => (
                    <span key={n.id} style={{ color: CLAUSE_COLORS[n.clause] }}>
                      {litLabel(n.lit)}{i < neighbors.length - 1 ? ', ' : ''}
                    </span>
                  ))
                  : 'none'
                }.{' '}
                {noEdge.length > 0 && (
                  <>
                    No edges to:{' '}
                    {noEdge.map((n, i) => (
                      <span key={n.id} style={{ color: '#c85555' }}>
                        {litLabel(n.lit)}{i < noEdge.length - 1 ? ', ' : ''}
                      </span>
                    ))} (contradictory — same variable, opposite sign).
                  </>
                )}
              </div>
            );
          })()}

          {/* Clique explanation */}
          {showClique && (
            <div style={{
              marginBottom: 12,
              background: 'rgba(76,175,80,0.07)',
              border: '1px solid rgba(76,175,80,0.28)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: '0.7rem',
              lineHeight: 1.75,
              color: tMut,
            }}>
              Assignment <span style={{ color: '#4caf50' }}>x₁=T, x₂=T, x₃=T</span> satisfies the formula.
              The three highlighted nodes — one from each clause — form a{' '}
              <span style={{ color: '#4caf50', fontWeight: 600 }}>3-clique</span>: every pair has an edge
              (no contradictions between them). This is the proof in action: a satisfying assignment
              always corresponds to a clique of size k.
            </div>
          )}

          {hovered === null && !showClique && (
            <div style={{ marginBottom: 12, textAlign: 'center', fontSize: '0.57rem', letterSpacing: '0.07em', color: tMut }}>
              Hover any node to see its edges — or click "Show 3-Clique" to see the satisfying assignment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CliqueReduction() {
  return (
    <BrowserOnly fallback={
      <div style={{
        height: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.4, fontFamily: 'monospace', fontSize: '0.8rem',
      }}>
        Loading graph...
      </div>
    }>
      {() => <Inner />}
    </BrowserOnly>
  );
}
