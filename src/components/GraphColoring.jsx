import React, { useState } from 'react';
import { Button, Figure, Segmented, svgButton } from './figure';

/* ── Graph coloring: click a region to cycle its colour ─────
   Colour is the subject here, so this figure is allowed a
   small palette. A clash (same colour on both ends) is red. */

const PALETTE = ['var(--az-accent)', 'var(--az-phase-02)', 'var(--az-phase-05)', 'var(--az-phase-06)'];
const NAMES = ['purple', 'orange', 'blue', 'green'];

const W = 420;
const H = 300;

const GRAPHS = {
  map: {
    label: 'Map',
    nodes: [[90, 70], [210, 50], [330, 80], [150, 160], [280, 170], [100, 250], [320, 250]],
    edges: [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [3, 6]],
  },
  cycle: {
    label: 'Odd cycle',
    nodes: Array.from({ length: 5 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      return [W / 2 + 110 * Math.cos(a), H / 2 + 6 + 110 * Math.sin(a)];
    }),
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  wheel: {
    label: 'Wheel',
    nodes: [[W / 2, H / 2 + 6], ...Array.from({ length: 5 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      return [W / 2 + 115 * Math.cos(a), H / 2 + 6 + 115 * Math.sin(a)];
    })],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1]],
  },
};

const R = 20;
const label = i => String.fromCharCode(65 + i);

export default function GraphColoring() {
  const [graph, setGraph] = useState('map');
  const [k, setK] = useState(3);
  const g = GRAPHS[graph];
  const [colors, setColors] = useState(() => Array(GRAPHS.map.nodes.length).fill(-1));

  const load = name => { setGraph(name); setColors(Array(GRAPHS[name].nodes.length).fill(-1)); };
  const setPalette = n => { setK(n); setColors(cs => cs.map(c => (c >= n ? -1 : c))); };
  const cycle = i => setColors(cs => cs.map((c, j) => (j === i ? (c + 1 >= k ? -1 : c + 1) : c)));

  const clashes = g.edges.filter(([a, b]) => colors[a] >= 0 && colors[a] === colors[b]);
  const filled = colors.filter(c => c >= 0).length;
  const used = new Set(colors.filter(c => c >= 0)).size;

  let status = <>Click a region to cycle through {k} colours</>;
  let tone;
  if (clashes.length) {
    tone = 'bad';
    const [a, b] = clashes[0];
    status = <><b>Clash</b>: {label(a)} and {label(b)} touch and are both {NAMES[colors[a]]}</>;
  } else if (filled === g.nodes.length) {
    tone = 'good';
    status = <><b>Valid colouring</b> with {used} colour{used === 1 ? '' : 's'}</>;
  } else if (filled) {
    status = <>{filled} of {g.nodes.length} coloured, no clashes so far</>;
  }

  return (
    <Figure
      title="Graph coloring"
      tools={
        <>
          <Segmented label="Graph" value={graph} onChange={load}
            options={Object.entries(GRAPHS).map(([value, v]) => ({ value, label: v.label }))} />
          <Segmented label="Colours" value={k} onChange={setPalette}
            options={[2, 3, 4].map(n => ({ value: n, label: `${n} colours` }))} />
          <Button onClick={() => setColors(Array(g.nodes.length).fill(-1))} disabled={!filled}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label="Regions joined when they share a border">
          {g.edges.map(([a, b]) => {
            const bad = colors[a] >= 0 && colors[a] === colors[b];
            return (
              <line key={`${a}-${b}`} x1={g.nodes[a][0]} y1={g.nodes[a][1]} x2={g.nodes[b][0]} y2={g.nodes[b][1]}
                stroke={bad ? 'var(--fig-bad)' : 'var(--fig-line-strong)'} strokeWidth={bad ? 2.5 : 1.5} />
            );
          })}
          {g.nodes.map(([x, y], i) => {
            const c = colors[i] >= 0 ? PALETTE[colors[i]] : null;
            return (
              <g key={i} {...svgButton(() => cycle(i), `Region ${label(i)}${c ? `, ${NAMES[colors[i]]}` : ', uncoloured'}`)}>
                <circle cx={x} cy={y} r={R} fill="var(--fig-bg)" />
                <circle className="az-fig-node" cx={x} cy={y} r={R}
                  fill={c ?? 'var(--fig-bg)'} fillOpacity={c ? 0.85 : 1}
                  stroke={c ?? 'var(--fig-line-strong)'} strokeWidth={1.5} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
                  fill={c ? '#fff' : 'var(--fig-ink)'}>{label(i)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
