import React, { useRef, useEffect, useState, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

/* ── graph definition ────────────────────────────────────── */

const N     = 6;
const EDGES = [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5],[2,5]];
const CANVAS_H = 240;

function buildNodes(w) {
  const cx = w / 2;
  const cy = CANVAS_H / 2;
  const r  = Math.min(w, CANVAS_H) * 0.33;
  return Array.from({ length: N }, (_, i) => {
    const a = (i * 2 * Math.PI / N) - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

function isValidIS(sel) {
  for (const [a, b] of EDGES) {
    if (sel.has(a) && sel.has(b)) return false;
  }
  return true;
}

/* ── canvas drawing ──────────────────────────────────────── */

function drawGraph(canvas, nodes, selected, isLeft, dark) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w   = canvas.offsetWidth || 260;
  canvas.width  = w * dpr;
  canvas.height = CANVAS_H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const cover   = new Set(Array.from({ length: N }, (_, i) => i).filter(i => !selected.has(i)));
  const validIS = isValidIS(selected);

  const PURPLE      = '#825dce';
  const PURPLE_FILL = 'rgba(130,87,229,0.22)';
  const PURPLE_DIM  = 'rgba(130,87,229,0.12)';
  const INVALID     = '#c85555';
  const INVALID_FILL= 'rgba(200,85,85,0.18)';
  const NODE_BG     = dark ? 'rgb(13, 13, 13)' : 'rgb(248, 248, 255)';
  const NODE_STR    = dark ? 'rgb(31, 31, 31)' : 'rgb(219, 219, 230)';
  const EDGE_BASE   = dark ? 'rgb(31, 31, 31)' : 'rgb(219, 219, 230)';
  const EDGE_WATCH  = '#825dce';
  const EDGE_UNWATCHED = '#c85555';
  const TEXT_MUT    = dark ? 'rgb(244, 244, 255)' : 'rgb(4, 4, 4)';

  ctx.clearRect(0, 0, w, CANVAS_H);

  /* edges */
  for (const [a, b] of EDGES) {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);

    if (!isLeft) {
      const watched = cover.has(a) || cover.has(b);
      ctx.strokeStyle = watched ? EDGE_WATCH : EDGE_UNWATCHED;
      ctx.lineWidth   = watched ? 1.5 : 2;
      ctx.setLineDash(watched ? [] : [4, 3]);
    } else {
      ctx.strokeStyle = EDGE_BASE;
      ctx.lineWidth   = 1.2;
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* nodes */
  for (let i = 0; i < N; i++) {
    const { x, y } = nodes[i];
    const inIS = selected.has(i);
    const inVC = cover.has(i);

    let fill, stroke, lw, textColor;

    if (isLeft) {
      if (inIS && validIS)  { fill = PURPLE_FILL; stroke = PURPLE;  lw = 2; textColor = PURPLE;  }
      else if (inIS)        { fill = INVALID_FILL; stroke = INVALID; lw = 2; textColor = INVALID; }
      else                  { fill = NODE_BG;      stroke = NODE_STR; lw = 1; textColor = TEXT_MUT; }
    } else {
      if (inVC) { fill = PURPLE_DIM; stroke = PURPLE;  lw = 2; textColor = PURPLE;  }
      else      { fill = NODE_BG;    stroke = NODE_STR; lw = 1; textColor = TEXT_MUT; }
    }

    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();

    /* camera icon on right panel if in cover */
    if (!isLeft && inVC) {
      ctx.font         = '13px var(--ifm-font-family-monospace, monospace)';
      ctx.fillStyle    = PURPLE;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⬡', x, y);
    } else {
      ctx.font         = '500 13px var(--ifm-font-family-monospace, monospace)';
      ctx.fillStyle    = textColor;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String.fromCharCode(65 + i), x, y);
    }
  }
}

/* ── inner component ─────────────────────────────────────── */

function Inner() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';

  const c1Ref = useRef(null);
  const c2Ref = useRef(null);
  const [selected, setSelected] = useState(new Set());
  const [nodes, setNodes]       = useState([]);

  const measure = useCallback(() => {
    const w = c1Ref.current?.offsetWidth || 260;
    setNodes(buildNodes(w));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (c1Ref.current) ro.observe(c1Ref.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!nodes.length) return;
    drawGraph(c1Ref.current, nodes, selected, true,  dark);
    drawGraph(c2Ref.current, nodes, selected, false, dark);
  }, [nodes, selected, dark]);

  const handleClick = useCallback((e) => {
    const canvas = c1Ref.current;
    if (!canvas || !nodes.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (let i = 0; i < N; i++) {
      const dx = mx - nodes[i].x;
      const dy = my - nodes[i].y;
      if (Math.sqrt(dx * dx + dy * dy) < 22) {
        setSelected(prev => {
          const next = new Set(prev);
          next.has(i) ? next.delete(i) : next.add(i);
          return next;
        });
        return;
      }
    }
  }, [nodes]);

  const cover   = new Set(Array.from({ length: N }, (_, i) => i).filter(i => !selected.has(i)));
  const validIS = isValidIS(selected);
  const k       = selected.size;
  const nk      = N - k;
  const uncovered = EDGES.filter(([a, b]) => !cover.has(a) && !cover.has(b));

  /* insight text using camera/roads framing */
  let insight = 'Click any city on the left to mark it as part of the Independent Set — cities with no road between any two of them.';
  if (k > 0 && !validIS) {
    insight = 'Two of your selected cities have a road between them, which breaks the rule. An independent set requires that no two chosen cities are directly connected.';
  } else if (k > 0 && validIS) {
    const isNodes = [...selected].map(i => String.fromCharCode(65 + i)).join(', ');
    const vcNodes = [...cover].map(i => String.fromCharCode(65 + i)).join(', ');
    if (uncovered.length > 0) {
      insight = `Cities {${isNodes}} have no roads between them — valid so far. But the remaining cities {${vcNodes}} are not yet watching every road. The dashed red roads have no camera at either end.`;
    } else {
      insight = `Cities {${isNodes}} have no roads between them (size ${k}). The remaining cities {${vcNodes}} have a camera at least one end of every road — a valid Vertex Cover of size ${nk} = ${N} − ${k}. Same map, opposite groups.`;
    }
  }

  /* design tokens */
  const PURPLE  = 'var(--az-accent)';
  const mono    = 'var(--ifm-font-family-monospace)';
  const bdr     = 'var(--az-border)';
  const bdrSub  = 'var(--az-border-subtle)';
  const surface = 'var(--az-surface)';
  const raised  = 'var(--az-elevated)';
  const tMut    = 'var(--az-text)';
  const acDim   = 'var(--az-accent-dim)';
  const acBdr   = 'var(--az-accent-border)';
  const insightBdr = (!validIS && k > 0) ? '#c85555' : (k > 0 ? PURPLE : bdr);

  const BADGES = [
    { dot: PURPLE,                           label: 'Independent set city (no roads between them)' },
    { dot: 'rgba(94,53,177,0.35)',           label: 'Vertex cover city (camera placed here)',       bordered: true },
    { dot: '#c85555',                        label: 'Invalid — two selected cities share a road'   },
  ];

  return (
    <div style={{ fontFamily: mono, margin: '2rem 0' }}>

      {/* legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.1rem' }}>
        {BADGES.map(({ dot, label, bordered }) => (
          <span key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.58rem', letterSpacing: '0.08em',
            padding: '3px 10px', borderRadius: 999,
            border: `0.5px solid ${bdr}`,
            color: tMut, background: surface,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0,
              border: bordered ? `1.5px solid ${PURPLE}` : 'none',
            }} />
            {label}
          </span>
        ))}
      </div>

      {/* canvases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { ref: c1Ref, label: 'Click cities — Independent Set',        onClick: handleClick, cursor: 'pointer' },
          { ref: c2Ref, label: 'Camera placements — Vertex Cover',       onClick: null,        cursor: 'default'  },
        ].map(({ ref, label, onClick, cursor }) => (
          <div key={label} style={{ border: `0.5px solid ${bdr}`, borderRadius: 24, overflow: 'hidden' }}>
            <div style={{
              padding: '6px 12px', fontSize: '0.58rem', letterSpacing: '0.09em',
              color: tMut, borderBottom: `0.5px solid ${bdrSub}`, background: raised,
            }}>
              {label}
            </div>
            <canvas
              ref={ref}
              height={CANVAS_H}
              onClick={onClick}
              style={{ display: 'block', width: '100%', cursor, background: surface }}
            />
          </div>
        ))}
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { val: k,  label: `cities with no roads between them (k = ${k})`,         sublabel: 'Independent Set size'  },
          { val: nk, label: `cities with cameras — every road watched (n − k = ${nk})`, sublabel: 'Vertex Cover size' },
        ].map(({ val, label, sublabel }) => (
          <div key={sublabel} style={{
            background: acDim, borderRadius: 16,
            border: `0.5px solid ${acBdr}`, padding: '10px 14px',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 500, color: PURPLE, lineHeight: 1.2, marginBottom: 2 }}>
              {val}
            </div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.06em', color: tMut }}>
              {sublabel}
            </div>
          </div>
        ))}
      </div>

      {/* insight */}
      <div style={{
        background: raised,
        padding: '11px 14px',
        fontSize: '0.7rem', lineHeight: 1.75, color: tMut,
        borderLeft: `2px solid ${insightBdr}`,
        borderRadius: '0 16px 16px 0',
      }}>
        {insight}
      </div>

      {/* hint */}
      <div style={{
        marginTop: 8, textAlign: 'center',
        fontSize: '0.57rem', letterSpacing: '0.07em', color: tMut, opacity: 0.55,
      }}>
        Click cities on the left — camera placements on the right update automatically
      </div>
    </div>
  );
}

/* ── export ──────────────────────────────────────────────── */

export default function ReductionGraph() {
  return (
    <BrowserOnly fallback={
      <div style={{
        height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.4, fontFamily: 'monospace', fontSize: '0.8rem',
      }}>
        Loading graph...
      </div>
    }>
      {() => <Inner />}
    </BrowserOnly>
  );
}