import React, { useState } from 'react';
import { GitBranch, Shuffle } from 'lucide-react';
import { Button, Figure, Note, Playback, Stage, Stat, Stats, usePlayback } from './figure';

/* ── Maze as a tree of junctions (Post 4) ──────────────────
   Every junction splits two ways; DEPTH junctions deep there
   are 2^DEPTH dead ends, exactly one of which is the exit. */

const DEPTH = 4;
const COUNT = 2 ** (DEPTH + 1) - 1;
const FIRST_LEAF = 2 ** DEPTH - 1;

const depthOf = i => Math.floor(Math.log2(i + 1));
const parent = i => Math.floor((i - 1) / 2);

function pathTo(i) {
  const path = [i];
  while (i > 0) { i = parent(i); path.unshift(i); }
  return path;
}

// Depth-first order a deterministic machine follows, stopping at the exit.
function dfsOrder(exit) {
  const order = [];
  const walk = i => {
    if (i >= COUNT) return false;
    order.push(i);
    if (i === exit) return true;
    return walk(2 * i + 1) || walk(2 * i + 2);
  };
  walk(0);
  return order;
}

const W = 640;
const ROW = 38;
const H = DEPTH * ROW + 50;
function pos(i) {
  const d = depthOf(i);
  const p = i - (2 ** d - 1);
  return { x: ((p + 0.5) / 2 ** d) * W, y: 18 + d * ROW };
}

/* ── State ───────────────────────────────────────────────── */

const init = exit => ({ exit, order: dfsOrder(exit), t: 0 });
const isDone = s => s.t >= s.order.length - 1;
const step = s => (isDone(s) ? s : { ...s, t: s.t + 1 });
const back = s => ({ ...s, t: Math.max(0, s.t - 1) });

const randomExit = current => {
  let e;
  do { e = FIRST_LEAF + Math.floor(Math.random() * (COUNT - FIRST_LEAF)); } while (e === current);
  return e;
};

/* ── Drawing ─────────────────────────────────────────────── */

function Tree({ nodeState, edgeState, exit, label }) {
  const edges = [];
  for (let i = 1; i < COUNT; i++) edges.push(i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="az-viz-svg" role="img" aria-label={label}>
      {edges.map(i => {
        const a = pos(parent(i));
        const b = pos(i);
        const st = edgeState(i);
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={st === 'path' ? 'var(--az-ok)' : st === 'walked' ? 'var(--viz-accent)' : 'var(--az-border-subtle)'}
            strokeWidth={st === 'path' ? 3 : st === 'walked' ? 2 : 1.25}
            opacity={st === 'walked' ? 0.7 : 1}
            style={{ transition: 'stroke 0.2s ease' }} />
        );
      })}
      {Array.from({ length: COUNT }, (_, i) => {
        const { x, y } = pos(i);
        const st = nodeState(i);
        const isExit = i === exit;
        const color = st === 'path' ? 'var(--az-ok)'
          : st === 'current' ? 'var(--viz-accent)'
            : st === 'visited' ? 'var(--viz-accent)'
              : isExit ? 'var(--az-ok)' : 'var(--az-muted-dim)';
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={st === 'current' ? 8 : 6} fill="var(--az-surface)" />
            <circle cx={x} cy={y} r={st === 'current' ? 8 : 6}
              fill={st === 'idle' && !isExit ? 'var(--az-surface)' : color}
              fillOpacity={st === 'visited' ? 0.35 : st === 'idle' ? (isExit ? 0.25 : 1) : 1}
              stroke={color} strokeWidth={1.5}
              strokeDasharray={isExit && st === 'idle' ? '2 2' : undefined}
              style={{ transition: 'all 0.2s ease' }} />
            {isExit && (
              <text x={x} y={y + 22} textAnchor="middle" fontSize="9.5" letterSpacing="0.1em" fill="var(--az-ok)">EXIT</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function MazeSearch() {
  const [s, set] = useState(() => init(FIRST_LEAF + 11));
  const [playing, togglePlay, stop] = usePlayback(s, set, step, isDone, 420);

  const path = pathTo(s.exit);
  const detVisited = new Set(s.order.slice(0, s.t + 1));
  const detCurrent = s.order[s.t];
  const detFound = isDone(s);

  const ndDepth = Math.min(s.t, DEPTH);
  const ndFound = ndDepth === DEPTH;
  const copies = 2 ** ndDepth;

  const detNode = i => {
    if (detFound && path.includes(i)) return 'path';
    if (i === detCurrent) return 'current';
    return detVisited.has(i) ? 'visited' : 'idle';
  };
  const detEdge = i => {
    if (detFound && path.includes(i)) return 'path';
    return detVisited.has(i) ? 'walked' : 'idle';
  };
  const ndNode = i => {
    if (ndFound && path.includes(i)) return 'path';
    const d = depthOf(i);
    if (d === ndDepth && !ndFound) return 'current';
    return d <= ndDepth ? 'visited' : 'idle';
  };
  const ndEdge = i => {
    if (ndFound && path.includes(i)) return 'path';
    return depthOf(i) <= ndDepth ? 'walked' : 'idle';
  };

  let note;
  let tone;
  if (s.t === 0) {
    note = <>Both machines stand at the entrance. Press Step: each step, the deterministic machine walks <em>one</em> corridor, while the nondeterministic machine splits into a copy for <em>every</em> corridor.</>;
  } else if (!ndFound) {
    note = <>Step {s.t}: the nondeterministic machine has {copies} copies walking at once; the deterministic machine has explored {detVisited.size} junctions, one at a time.</>;
  } else if (!detFound) {
    tone = 'ok';
    note = <>A nondeterministic copy reached the exit after just <em>{DEPTH} steps</em>, the length of the correct path. The deterministic machine is still backtracking through dead ends.</>;
  } else {
    tone = 'ok';
    note = <>The deterministic machine found the exit after <em>{s.order.length - 1} steps</em>; the nondeterministic one needed <em>{DEPTH}</em>. Add one more level of junctions and the gap roughly doubles.</>;
  }

  const reset = exit => { stop(); set(init(exit)); };

  return (
    <Figure
      icon={GitBranch}
      kicker="Deterministic vs nondeterministic"
      title="Two machines, one maze"
      tools={<Button icon={Shuffle} onClick={() => reset(randomExit(s.exit))}>New maze</Button>}
      caption="Each dot is a junction and each line a corridor. Only one of the 16 dead ends is the exit."
    >
      <Stage label="Deterministic: one corridor at a time" aside={detFound ? `found in ${s.order.length - 1} steps` : `step ${s.t}`}>
        <Tree nodeState={detNode} edgeState={detEdge} exit={s.exit} label="Deterministic search of the maze" />
      </Stage>
      <Stage label="Nondeterministic: every corridor at once" aside={ndFound ? `found in ${DEPTH} steps` : `${copies} cop${copies === 1 ? 'y' : 'ies'}`}>
        <Tree nodeState={ndNode} edgeState={ndEdge} exit={s.exit} label="Nondeterministic search of the maze" />
      </Stage>

      <Stats cols={3}>
        <Stat value={detFound ? s.order.length - 1 : s.t} label="Deterministic steps" tone={detFound ? 'ok' : undefined} />
        <Stat value={Math.min(s.t, DEPTH)} label="Nondeterministic steps" tone={ndFound ? 'ok' : undefined} />
        <Stat value={2 ** DEPTH} label="Dead ends in the maze" tone="plain" />
      </Stats>

      <Playback
        onReset={() => reset(s.exit)}
        onBack={() => { stop(); set(back); }}
        canBack={s.t > 0}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={togglePlay}
        done={detFound}
      />

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
