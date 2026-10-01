import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

/* ── graph definition ────────────────────────────────────── */

const N = 6;
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [2, 5]];
const CANVAS_H = 240;
const NODE_R = 18;

function buildNodes(w) {
  const r = Math.min(w, CANVAS_H) * 0.33;
  return Array.from({ length: N }, (_, i) => {
    const a = (i * 2 * Math.PI) / N - Math.PI / 2;
    return { x: w / 2 + r * Math.cos(a), y: CANVAS_H / 2 + r * Math.sin(a) };
  });
}

function isValidIS(sel) {
  return !EDGES.some(([a, b]) => sel.has(a) && sel.has(b));
}

const name = i => String.fromCharCode(65 + i);

/* ── canvas drawing ──────────────────────────────────────── */

// Canvas cannot resolve CSS custom properties, so we read the resolved
// values off the element once per paint — the palette stays in CSS.
function palette(el) {
  const cs = getComputedStyle(el);
  const v = n => cs.getPropertyValue(n).trim();
  return {
    accent: v('--az-accent'),
    accentSoft: v('--az-accent-dim'),
    invalid: v('--az-no'),
    invalidSoft: v('--az-no-soft'),
    surface: v('--az-surface'),
    line: v('--az-border'),
    text: v('--az-muted'),
    mono: v('--ifm-font-family-monospace') || 'monospace',
  };
}

function drawGraph(canvas, nodes, selected, isLeft) {
  if (!canvas || !nodes.length) return;
  const p = palette(canvas);
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth || 260;
  canvas.width = w * dpr;
  canvas.height = CANVAS_H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, CANVAS_H);

  const cover = new Set(Array.from({ length: N }, (_, i) => i).filter(i => !selected.has(i)));
  const validIS = isValidIS(selected);

  for (const [a, b] of EDGES) {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);
    if (isLeft) {
      ctx.strokeStyle = p.line;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
    } else {
      const watched = cover.has(a) || cover.has(b);
      ctx.strokeStyle = watched ? p.accent : p.invalid;
      ctx.lineWidth = watched ? 1.5 : 2;
      ctx.setLineDash(watched ? [] : [4, 3]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (let i = 0; i < N; i++) {
    const { x, y } = nodes[i];
    const marked = isLeft ? selected.has(i) : cover.has(i);
    const broken = isLeft && marked && !validIS;

    ctx.beginPath();
    ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
    ctx.fillStyle = p.surface;
    ctx.fill();
    if (marked) {
      ctx.fillStyle = broken ? p.invalidSoft : p.accentSoft;
      ctx.fill();
    }
    ctx.strokeStyle = marked ? (broken ? p.invalid : p.accent) : p.line;
    ctx.lineWidth = marked ? 2 : 1;
    ctx.stroke();

    ctx.font = `500 13px ${p.mono}`;
    ctx.fillStyle = marked ? (broken ? p.invalid : p.accent) : p.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(!isLeft && marked ? '⬡' : name(i), x, y);
  }
}

/* ── component ───────────────────────────────────────────── */

function Inner() {
  const { colorMode } = useColorMode();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [selected, setSelected] = useState(new Set());
  const [nodes, setNodes] = useState([]);

  const measure = useCallback(() => {
    setNodes(buildNodes(leftRef.current?.offsetWidth || 260));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (leftRef.current) ro.observe(leftRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    drawGraph(leftRef.current, nodes, selected, true);
    drawGraph(rightRef.current, nodes, selected, false);
  }, [nodes, selected, colorMode]);

  const toggle = useCallback(i => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  const handleClick = useCallback(e => {
    const canvas = leftRef.current;
    if (!canvas || !nodes.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = nodes.findIndex(n => Math.hypot(mx - n.x, my - n.y) < NODE_R + 4);
    if (hit >= 0) toggle(hit);
  }, [nodes, toggle]);

  const cover = new Set(Array.from({ length: N }, (_, i) => i).filter(i => !selected.has(i)));
  const validIS = isValidIS(selected);
  const k = selected.size;
  const uncovered = EDGES.filter(([a, b]) => !cover.has(a) && !cover.has(b));

  let tone = '';
  let insight = 'Pick cities on the left map to build an independent set — no two of them may share a road.';
  if (k > 0 && !validIS) {
    tone = ' az-viz-note--no';
    insight = 'Two selected cities share a road. An independent set allows no direct connection between any two chosen cities.';
  } else if (k > 0) {
    const isNodes = [...selected].map(name).join(', ');
    const vcNodes = [...cover].map(name).join(', ');
    insight = uncovered.length > 0
      ? `Cities {${isNodes}} have no roads between them — valid so far. But {${vcNodes}} do not yet watch every road: the dashed roads have no camera at either end.`
      : `Cities {${isNodes}} have no roads between them (k = ${k}), so the remaining cities {${vcNodes}} cover every road — a vertex cover of size ${N - k} = ${N} − ${k}. Same map, opposite groups.`;
    if (uncovered.length === 0) tone = ' az-viz-note--ok';
  }

  const LEGEND = [
    { color: 'var(--az-accent)', label: 'Independent set — no roads between them' },
    { color: 'var(--az-accent)', glyph: '⬡', label: 'Vertex cover — camera placed here' },
    { color: 'var(--az-no)', label: 'Invalid — two chosen cities share a road' },
  ];

  return (
    <div className="az-viz">
      <div className="az-viz__head">
        <span className="az-viz__label">Independent set <ArrowLeftRight className="az-inline-icon" size={12} strokeWidth={2.25} aria-hidden="true" /> vertex cover</span>
        <button type="button" className="az-viz-btn" onClick={() => setSelected(new Set())} disabled={k === 0}>
          Clear selection
        </button>
      </div>

      <div className="az-viz__body">
        <div className="az-viz-legend">
          {LEGEND.map(({ color, glyph, label }) => (
            <span className="az-viz-legend__item" key={label} style={{ '--dot': color }}>
              {glyph
                ? <span aria-hidden="true" style={{ color, lineHeight: 1 }}>{glyph}</span>
                : <span className="az-viz-legend__dot" />}
              {label}
            </span>
          ))}
        </div>

        <div className="az-viz-pair">
          <div className="az-viz__stage">
            <div className="az-viz__stage-label">Click cities — independent set</div>
            <canvas ref={leftRef} height={CANVAS_H} onClick={handleClick} style={{ cursor: 'pointer' }} />
          </div>
          <div className="az-viz__stage">
            <div className="az-viz__stage-label">Camera placements — vertex cover</div>
            <canvas ref={rightRef} height={CANVAS_H} />
          </div>
        </div>

        <div className="az-viz-stats">
          <div className="az-viz-stat">
            <div className="az-viz-stat__value">{k}</div>
            <div className="az-viz-stat__label">Independent set size (k)</div>
          </div>
          <div className="az-viz-stat">
            <div className="az-viz-stat__value">{N - k}</div>
            <div className="az-viz-stat__label">Vertex cover size (n − k)</div>
          </div>
        </div>

        <div className={'az-viz-note' + tone}>{insight}</div>
      </div>

      <p className="az-viz__foot">Click cities on the left — the camera placements on the right follow automatically.</p>
    </div>
  );
}

export default function ReductionGraph() {
  return (
    <BrowserOnly fallback={<div className="az-viz__loading">Loading graph</div>}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
