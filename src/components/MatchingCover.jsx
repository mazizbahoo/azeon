import React, { useMemo, useState } from 'react';
import { Cctv } from 'lucide-react';
import { Figure, Playback, usePlayback } from './figure';

/* ── 2-approximation for Vertex Cover ───────────────────────
   Repeatedly take any edge with neither end covered and put
   cameras on BOTH ends. The edges taken share no endpoints (a
   matching), and any cover needs one camera per matched edge,
   so we use at most twice the minimum. */

const W = 520;
const H = 300;
const NODES = [[70, 70], [200, 50], [330, 70], [460, 60], [110, 200], [250, 160], [390, 190], [180, 270], [320, 270]];
const EDGES = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [2, 6], [3, 6], [4, 5], [5, 6], [4, 7], [5, 7], [5, 8], [6, 8], [7, 8]];
const N = NODES.length;
const name = i => String.fromCharCode(65 + i);

function minCover() {
  let best = N;
  for (let m = 0; m < 1 << N; m++) {
    let k = 0;
    for (let i = 0; i < N; i++) if (m & (1 << i)) k++;
    if (k < best && EDGES.every(([a, b]) => m & (1 << a) || m & (1 << b))) best = k;
  }
  return best;
}

const init = () => ({ cover: [], matching: [] });
const step = s => {
  const e = EDGES.find(([a, b]) => !s.cover.includes(a) && !s.cover.includes(b));
  if (!e) return s;
  return { cover: [...s.cover, e[0], e[1]], matching: [...s.matching, e] };
};
const isDone = s => EDGES.every(([a, b]) => s.cover.includes(a) || s.cover.includes(b));

export default function MatchingCover() {
  const [s, set] = useState(init);
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 900);
  const opt = useMemo(minCover, []);

  const covered = ([a, b]) => s.cover.includes(a) || s.cover.includes(b);
  const inMatching = ([a, b]) => s.matching.some(([x, y]) => x === a && y === b);
  const done = isDone(s);

  const status = done
    ? <>Cover of <b>{s.cover.length}</b> using {s.matching.length} picked edges. Any cover needs at least {s.matching.length}, so this is at most twice the best. (The true minimum here is {opt}.)</>
    : s.matching.length
      ? <>{s.matching.length} edge{s.matching.length > 1 ? 's' : ''} picked · {s.cover.length} cameras · {EDGES.filter(e => !covered(e)).length} roads still unwatched</>
      : <>Press <b>Step</b>: pick a road with no camera at either end, and put cameras on both ends</>;

  return (
    <Figure title="Pick an edge, cover both ends" status={status} tone={done ? 'good' : undefined}>
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="img" aria-label="Graph with the edges picked so far highlighted">
          {EDGES.map(e => {
            const [a, b] = e;
            const m = inMatching(e);
            const c = covered(e);
            return (
              <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
                stroke={m ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={m ? 4 : 1.5}
                strokeDasharray={!m && c ? '4 4' : undefined} opacity={!m && c ? 0.6 : 1} />
            );
          })}
          {NODES.map(([x, y], i) => {
            const cam = s.cover.includes(i);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={18} fill="var(--fig-bg)" stroke={cam ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={cam ? 2 : 1.25} />
                {cam
                  ? <Cctv x={x - 8} y={y - 8} width={16} height={16} color="var(--fig-accent)" strokeWidth={2} aria-hidden="true" />
                  : <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="var(--fig-ink)">{name(i)}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <Playback onReset={() => { stop(); set(init()); }} onStep={() => set(step)} playing={playing} onTogglePlay={toggle} done={done} />
    </Figure>
  );
}
