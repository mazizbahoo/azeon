import React, { useState } from 'react';
import { Cctv } from 'lucide-react';
import { Button, Figure, svgButton } from './figure';

/* ── Independent set ↔ vertex cover on one small map ────── */

const N = 6;
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [2, 5]];
const W = 280;
const H = 240;
const R = 18;
const NODES = Array.from({ length: N }, (_, i) => {
  const a = (i * 2 * Math.PI) / N - Math.PI / 2;
  return { x: W / 2 + 90 * Math.cos(a), y: H / 2 + 90 * Math.sin(a) };
});
const name = i => String.fromCharCode(65 + i);

function CityMap({ label, edge, node }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label={label}>
      {EDGES.map(([a, b]) => (
        <line key={`${a}${b}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} {...edge(a, b)} />
      ))}
      {NODES.map((p, i) => node(i, p))}
    </svg>
  );
}

export default function ReductionGraph() {
  const [chosen, setChosen] = useState(() => new Set());
  const toggle = i => setChosen(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  const clash = (a, b) => chosen.has(a) && chosen.has(b);
  const clashes = EDGES.filter(([a, b]) => clash(a, b));
  const k = chosen.size;

  const line = (stroke, width, dash) => ({ stroke, strokeWidth: width, strokeDasharray: dash, style: { transition: 'stroke 0.15s' } });

  let status = <>Choose cities on the left</>;
  let tone;
  if (k && clashes.length) {
    tone = 'bad';
    status = <><b>Not independent</b>: {clashes.map(([a, b]) => `${name(a)}–${name(b)}`).join(', ')} {clashes.length === 1 ? 'is a road' : 'are roads'} between chosen cities</>;
  } else if (k) {
    tone = 'good';
    status = <>Independent set of size <b>{k}</b> · vertex cover of size <b>{N - k}</b></>;
  }

  return (
    <Figure
      title="Independent set and vertex cover"
      tools={<Button onClick={() => setChosen(new Set())} disabled={!k}>Clear</Button>}
      status={status}
      tone={tone}
    >
      <div className="az-fig-pair">
        <div className="az-fig-pane">
          <div className="az-fig-pane__head">
            <span className="az-fig-label">Independent set</span>
            <span className="az-fig-pane__meta">{k} chosen</span>
          </div>
          <div className="az-fig-well">
            <CityMap
              label="Choose cities"
              edge={(a, b) => (clash(a, b) ? line('var(--fig-bad)', 2.25) : line('var(--fig-line-strong)', 1.5))}
              node={(i, p) => {
                const on = chosen.has(i);
                const bad = on && clashes.some(e => e.includes(i));
                const c = bad ? 'var(--fig-bad)' : 'var(--fig-accent)';
                return (
                  <g key={i} {...svgButton(() => toggle(i), `City ${name(i)}`, on)}>
                    <circle cx={p.x} cy={p.y} r={R} fill="var(--fig-bg)" />
                    <circle className="az-fig-node" cx={p.x} cy={p.y} r={R}
                      fill={on ? c : 'var(--fig-bg)'} fillOpacity={on ? 0.16 : 1}
                      stroke={on ? c : 'var(--fig-line-strong)'} strokeWidth={on ? 2 : 1.25} />
                    <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
                      fill={on ? c : 'var(--fig-ink)'}>{name(i)}</text>
                  </g>
                );
              }}
            />
          </div>
        </div>

        <div className="az-fig-pane">
          <div className="az-fig-pane__head">
            <span className="az-fig-label">Vertex cover</span>
            <span className="az-fig-pane__meta">{N - k} cameras</span>
          </div>
          <div className="az-fig-well">
            <CityMap
              label="Cameras on every city not chosen"
              edge={(a, b) => (clash(a, b)
                ? line('var(--fig-bad)', 2, '4 4')
                : line('var(--fig-line-strong)', 1.5))}
              node={(i, p) => {
                const cam = !chosen.has(i);
                return (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={R} fill="var(--fig-bg)"
                      stroke={cam ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={cam ? 1.75 : 1.25} />
                    {cam
                      ? <Cctv x={p.x - 8} y={p.y - 8} width={16} height={16} color="var(--fig-accent)" strokeWidth={2} aria-hidden="true" />
                      : <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="var(--fig-faint)">{name(i)}</text>}
                  </g>
                );
              }}
            />
          </div>
        </div>
      </div>
    </Figure>
  );
}
