import React, { useRef, useState } from 'react';
import { Figure } from './figure';

/* ── Big-O growth curves, n = 1 … 10, capped at 60 steps ─── */

// Lanczos approximation of Γ(z), so n! can be drawn as a smooth curve.
function gamma(z) {
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
}

const CURVES = [
  { key: '1', label: 'O(1)', f: () => 1 },
  { key: 'log', label: 'O(log n)', f: n => Math.log2(n) },
  { key: 'n', label: 'O(n)', f: n => n },
  { key: 'nlog', label: 'O(n log n)', f: n => n * Math.log2(n) },
  { key: 'n2', label: 'O(n²)', f: n => n * n },
  { key: '2n', label: 'O(2ⁿ)', f: n => 2 ** n },
  { key: 'fact', label: 'O(n!)', f: n => gamma(n + 1) },
];

const CAP = 60;
const W = 640;
const H = 320;
const PAD = { l: 44, r: 92, t: 22, b: 40 };
const X = n => PAD.l + ((n - 1) / 9) * (W - PAD.l - PAD.r);
const Y = v => PAD.t + (1 - Math.min(v, CAP) / CAP) * (H - PAD.t - PAD.b);

function path(f) {
  const pts = [];
  for (let n = 1; n <= 10.0001; n += 0.05) {
    const v = f(n);
    pts.push(`${X(n).toFixed(1)},${Y(v).toFixed(1)}`);
    if (v >= CAP) break;
  }
  return `M${pts.join('L')}`;
}

// Where each curve ends: at n = 10, or where it leaves the top of the chart.
function end(f) {
  if (f(10) < CAP) return { x: X(10), y: Y(f(10)), side: 'right' };
  let n = 1;
  while (f(n) < CAP) n += 0.01;
  return { x: X(n), y: Y(CAP), side: 'top' };
}

const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
const exactValue = (c, n) => (c.key === 'fact' ? FACT[n] : c.f(n));

const fmt = v => (v >= 1e6 ? v.toExponential(1) : Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(1));

export default function BigOChart() {
  const [focus, setFocus] = useState(null);
  const [hover, setHover] = useState(null); // { n, x, y, flip } in wrapper pixels
  const wrap = useRef(null);
  const hoverN = hover?.n ?? null;

  const onMove = e => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const { x } = pt.matrixTransform(svg.getScreenCTM().inverse());
    const n = Math.round(1 + ((x - PAD.l) / (W - PAD.l - PAD.r)) * 9);
    if (n < 1 || n > 10) { setHover(null); return; }
    const box = wrap.current.getBoundingClientRect();
    const px = e.clientX - box.left;
    setHover({ n, x: px, y: e.clientY - box.top, flip: px > box.width - 190 });
  };

  return (
    <Figure title="Big-O growth, n = 1 to 10">
      <div className="az-bigo" ref={wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="img"
        aria-label="Growth of seven Big-O classes for n from 1 to 10, capped at 60 steps"
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {[0, 20, 40, 60].map(v => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(v)} y2={Y(v)} stroke="var(--fig-line)" strokeDasharray={v === CAP ? '4 4' : undefined} />
            <text x={PAD.l - 10} y={Y(v)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="var(--fig-faint)">
              {v === CAP ? '60+' : v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <text key={n} x={X(n)} y={H - PAD.b + 18} textAnchor="middle" fontSize="11" fill="var(--fig-faint)">{n}</text>
        ))}
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--fig-faint)">input size n</text>

        {hoverN && <line x1={X(hoverN)} x2={X(hoverN)} y1={PAD.t} y2={H - PAD.b} stroke="var(--fig-line-strong)" />}

        {CURVES.map(c => {
          const on = focus === c.key;
          const e = end(c.f);
          return (
            <g key={c.key} onMouseEnter={() => setFocus(c.key)} onMouseLeave={() => setFocus(null)} style={{ cursor: 'default' }}>
              <path d={path(c.f)} fill="none" stroke="transparent" strokeWidth="12" />
              <path d={path(c.f)} fill="none"
                stroke={on ? 'var(--fig-accent)' : focus ? 'var(--fig-line-strong)' : 'var(--fig-muted)'}
                strokeWidth={on ? 2.5 : 1.5} style={{ transition: 'stroke 0.15s' }} />
              <text
                x={e.side === 'right' ? e.x + 8 : e.x}
                y={e.side === 'right' ? e.y + (c.key === '1' ? 5 : c.key === 'log' ? -3 : 0) : e.y - 9}
                textAnchor={e.side === 'right' ? 'start' : 'middle'}
                dominantBaseline="middle" fontSize="11.5" fontWeight={on ? 600 : 400}
                fill={on ? 'var(--fig-accent)' : 'var(--fig-muted)'}>
                {c.label}
              </text>
            </g>
          );
        })}

        {hoverN && CURVES.map(c => {
          const v = c.f(hoverN);
          return v <= CAP && (
            <circle key={c.key} cx={X(hoverN)} cy={Y(v)} r={3.5} fill="var(--fig-bg)"
              stroke={focus === c.key ? 'var(--fig-accent)' : 'var(--fig-ink)'} strokeWidth="1.5" />
          );
        })}
      </svg>

      {hover && (
        <div className="az-bigo__tip" style={{ left: hover.x, top: hover.y, '--dx': hover.flip ? 'calc(-100% - 14px)' : '14px' }}>
          <div className="az-bigo__tip-head">n = {hover.n}</div>
          {[...CURVES].reverse().map(c => (
            <div key={c.key} className="az-bigo__tip-row" data-on={String(focus === c.key)}>
              <span>{c.label}</span>
              <span>{fmt(exactValue(c, hover.n))}</span>
            </div>
          ))}
        </div>
      )}
      </div>
    </Figure>
  );
}
