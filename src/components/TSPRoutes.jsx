import React, { useMemo, useState } from 'react';
import { Button, Figure, Segmented, svgButton } from './figure';

/* ── Traveling Salesman: build a tour, compare with brute force ─
   Distances are straight-line distances in the drawing. The
   optimum is found by trying every tour, which is the point. */

const W = 460;
const H = 320;
const POINTS = [
  [70, 80], [200, 45], [340, 70], [410, 170], [330, 270],
  [190, 250], [80, 210], [250, 150], [140, 140],
];
const R = 14;
const name = i => String.fromCharCode(65 + i);
const dist = (a, b) => Math.hypot(POINTS[a][0] - POINTS[b][0], POINTS[a][1] - POINTS[b][1]) / 10;
const tourLength = t => t.reduce((s, v, i) => s + dist(v, t[(i + 1) % t.length]), 0);
const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
const fmt = x => x.toLocaleString('en-US');

// Fix city A as the start; try every order of the rest.
function bruteForce(n) {
  const rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
  let best = null;
  let bestLen = Infinity;
  let tried = 0;
  const permute = (arr, k) => {
    if (k === arr.length) {
      tried++;
      const t = [0, ...arr];
      const len = tourLength(t);
      if (len < bestLen - 1e-9) { bestLen = len; best = t; }
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute(rest, 0);
  return { best, bestLen, tried };
}

export default function TSPRoutes() {
  const [n, setN] = useState(6);
  const [tour, setTour] = useState([]);
  const [showBest, setShowBest] = useState(false);
  const opt = useMemo(() => bruteForce(n), [n]);

  const load = k => { setN(k); setTour([]); setShowBest(false); };
  const click = i => {
    setShowBest(false);
    if (tour[tour.length - 1] === i) setTour(tour.slice(0, -1));
    else if (!tour.includes(i)) setTour([...tour, i]);
  };

  const done = tour.length === n;
  const shown = showBest ? opt.best : tour;
  const closed = showBest || done;
  const mine = done ? tourLength(tour) : null;

  let status = <>Click the cities in the order you want to visit them. Distinct round trips: <b>{fmt(fact(n - 1) / 2)}</b></>;
  let tone;
  if (showBest) {
    status = <>Shortest tour: <b>{opt.bestLen.toFixed(1)}</b> · found by checking {fmt(opt.tried)} orderings</>;
    tone = 'good';
  } else if (done) {
    const gap = ((mine / opt.bestLen - 1) * 100);
    tone = gap < 0.05 ? 'good' : undefined;
    status = gap < 0.05
      ? <>Your tour: <b>{mine.toFixed(1)}</b>. That is the shortest possible.</>
      : <>Your tour: <b>{mine.toFixed(1)}</b> · shortest: {opt.bestLen.toFixed(1)} · <b>{gap.toFixed(1)}%</b> longer</>;
  } else if (tour.length) {
    status = <>{tour.length} of {n} cities · click the last city to undo</>;
  }

  const legs = shown.slice(1).map((v, i) => [shown[i], v]);
  if (closed && shown.length === n) legs.push([shown[n - 1], shown[0]]);

  return (
    <Figure
      title="Traveling Salesman"
      tools={
        <>
          <Segmented label="Cities" value={n} onChange={load}
            options={[5, 6, 7, 8, 9].map(k => ({ value: k, label: `${k}` }))} />
          <Button onClick={() => setShowBest(true)} pressed={showBest}>Show shortest</Button>
          <Button onClick={() => { setTour([]); setShowBest(false); }} disabled={!tour.length && !showBest}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label="Cities to visit">
          {legs.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={POINTS[a][0]} y1={POINTS[a][1]} x2={POINTS[b][0]} y2={POINTS[b][1]}
              stroke="var(--fig-accent)" strokeWidth={2.5} />
          ))}
          {POINTS.slice(0, n).map(([x, y], i) => {
            const at = shown.indexOf(i);
            return (
              <g key={i} {...svgButton(() => click(i), `City ${name(i)}`, at >= 0)}>
                <circle cx={x} cy={y} r={R} fill="var(--fig-bg)" />
                <circle className="az-fig-node" cx={x} cy={y} r={R}
                  fill={at >= 0 ? 'var(--fig-accent)' : 'var(--fig-bg)'} fillOpacity={at >= 0 ? 0.16 : 1}
                  stroke={at >= 0 ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={at >= 0 ? 2 : 1.25} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12"
                  fill={at >= 0 ? 'var(--fig-accent)' : 'var(--fig-ink)'}>{name(i)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
