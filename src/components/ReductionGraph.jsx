import React, { useState } from 'react';
import { Cctv, Eraser, Network, Sparkles } from 'lucide-react';
import { Button, Figure, Legend, Note, Stage, Stat, Stats } from './figure';

/* ── Graph ───────────────────────────────────────────────── */

const N = 6;
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [2, 5]];
const MAXIMUM = [0, 3, 5]; // one largest independent set (size 3)

const W = 300;
const H = 250;
const R = 20;
const NODES = Array.from({ length: N }, (_, i) => {
  const a = (i * 2 * Math.PI) / N - Math.PI / 2;
  return { x: W / 2 + 92 * Math.cos(a), y: H / 2 + 92 * Math.sin(a) };
});

const name = i => String.fromCharCode(65 + i);
const conflicts = sel => EDGES.filter(([a, b]) => sel.has(a) && sel.has(b));

/* ── Pieces ──────────────────────────────────────────────── */

function Roads({ stroke }) {
  return EDGES.map(([a, b]) => (
    <line
      key={`${a}-${b}`}
      x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
      {...stroke(a, b)}
      style={{ transition: 'stroke 0.2s ease, opacity 0.2s ease' }}
    />
  ));
}

function CityMap({ selected, bad, onToggle }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="az-viz-svg" role="group" aria-label="City map: choose cities for the independent set">
      <Roads
        stroke={(a, b) => {
          const clash = selected.has(a) && selected.has(b);
          return {
            stroke: clash ? 'var(--az-no)' : 'var(--az-border-subtle)',
            strokeWidth: clash ? 2.5 : 1.5,
          };
        }}
      />
      {NODES.map((p, i) => {
        const on = selected.has(i);
        const broken = on && bad.has(i);
        const color = broken ? 'var(--az-no)' : 'var(--az-accent)';
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`City ${name(i)}`}
            className="az-viz-node"
            onClick={() => onToggle(i)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(i); }
            }}
          >
            <circle cx={p.x} cy={p.y} r={R} fill="var(--az-surface)" />
            <circle
              cx={p.x} cy={p.y} r={R}
              fill={on ? color : 'transparent'} fillOpacity={0.14}
              stroke={on ? color : 'var(--az-muted-dim)'}
              strokeWidth={on ? 2.25 : 1.25}
            />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
              fontWeight={on ? 600 : 500} fill={on ? color : 'var(--az-text)'}>
              {name(i)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CameraMap({ cover }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="az-viz-svg" role="img"
      aria-label={`Cameras at ${[...cover].map(name).join(', ') || 'no cities'}`}>
      <Roads
        stroke={(a, b) => {
          const watched = cover.has(a) || cover.has(b);
          return {
            stroke: watched ? 'var(--az-accent)' : 'var(--az-no)',
            strokeWidth: watched ? 1.75 : 2.25,
            strokeDasharray: watched ? undefined : '5 4',
            opacity: watched ? 0.75 : 1,
          };
        }}
      />
      {NODES.map((p, i) => {
        const cam = cover.has(i);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={R} fill="var(--az-surface)" />
            <circle
              cx={p.x} cy={p.y} r={R}
              fill={cam ? 'var(--az-accent)' : 'transparent'} fillOpacity={0.14}
              stroke={cam ? 'var(--az-accent)' : 'var(--az-muted-dim)'}
              strokeWidth={cam ? 2.25 : 1.25}
            />
            {cam
              ? <Cctv x={p.x - 9} y={p.y - 9} width={18} height={18} color="var(--az-accent)" strokeWidth={2} aria-hidden="true" />
              : <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="var(--az-muted)">{name(i)}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function ReductionGraph() {
  const [selected, setSelected] = useState(() => new Set());

  const toggle = i => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  const clashes = conflicts(selected);
  const bad = new Set(clashes.flat());
  const cover = new Set(Array.from({ length: N }, (_, i) => i).filter(i => !selected.has(i)));
  const k = selected.size;
  const valid = clashes.length === 0;
  const list = set => [...set].sort().map(name).join(', ');

  let tone;
  let note;
  if (k === 0) {
    note = <>Click cities on the left to build an <em>independent set</em>: a group where no two cities share a road. Every city you leave out gets a camera on the right.</>;
  } else if (!valid) {
    tone = 'no';
    note = <>{clashes.map(([a, b]) => `${name(a)}–${name(b)}`).join(', ')} {clashes.length === 1 ? 'is a road' : 'are roads'} between two chosen cities, so this is not an independent set, and on the right that same road has <em>no camera at either end</em>.</>;
  } else {
    tone = 'ok';
    note = <>No two of {'{'}{list(selected)}{'}'} share a road, so the other {N - k} cities {'{'}{list(cover)}{'}'} watch every road: a vertex cover of size <em>{N - k} = {N} − {k}</em>. Same map, opposite groups.</>;
  }

  return (
    <Figure
      icon={Network}
      kicker="Reduction"
      title="Independent set and vertex cover"
      tools={
        <>
          <Button icon={Sparkles} onClick={() => setSelected(new Set(MAXIMUM))}>Show a maximum</Button>
          <Button icon={Eraser} onClick={() => setSelected(new Set())} disabled={k === 0}>Clear</Button>
        </>
      }
      caption="An independent set of size k always leaves a vertex cover of size n − k, and vice versa. That is the whole reduction."
    >
      <Legend
        items={[
          { color: 'var(--az-accent)', label: 'Chosen city' },
          { color: 'var(--az-accent)', label: 'Camera', icon: Cctv },
          { color: 'var(--az-no)', label: 'Unwatched road / clash', shape: 'rule' },
        ]}
      />

      <div className="az-viz-pair">
        <Stage label="Pick cities" aside={`Independent set · ${k}`}>
          <CityMap selected={selected} bad={bad} onToggle={toggle} />
        </Stage>
        <Stage label="Cameras" aside={`Vertex cover · ${N - k}`}>
          <CameraMap cover={cover} />
        </Stage>
      </div>

      <Stats cols={3}>
        <Stat value={k} label="Independent set (k)" tone={k && !valid ? 'no' : undefined} />
        <Stat value={N - k} label="Vertex cover (n − k)" />
        <Stat value={valid ? 'Valid' : 'Invalid'} label="Both sides" tone={k === 0 ? 'plain' : valid ? 'ok' : 'no'} />
      </Stats>

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
