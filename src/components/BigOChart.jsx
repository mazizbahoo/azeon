import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ArrowUp } from 'lucide-react';

/* ── data ────────────────────────────────────────────────── */

const CAP = 60;

function fact(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function trueVal(key, n) {
  switch (key) {
    case 'O(1)': return 1;
    case 'O(log n)': return parseFloat(Math.log2(n).toFixed(2));
    case 'O(n)': return n;
    case 'O(n log n)': return parseFloat((n * Math.log2(n)).toFixed(2));
    case 'O(n²)': return n * n;
    case 'O(2ⁿ)': return Math.pow(2, n);
    case 'O(n!)': return fact(n);
    default: return 0;
  }
}

const CURVES = [
  { key: 'O(1)', color: 'var(--az-c1)', dash: '', name: 'Constant' },
  { key: 'O(log n)', color: 'var(--az-c2)', dash: '', name: 'Logarithmic' },
  { key: 'O(n)', color: 'var(--az-c3)', dash: '', name: 'Linear' },
  { key: 'O(n log n)', color: 'var(--az-c4)', dash: '', name: 'Linearithmic' },
  { key: 'O(n²)', color: 'var(--az-c5)', dash: '', name: 'Quadratic' },
  { key: 'O(2ⁿ)', color: 'var(--az-c6)', dash: '6 3', name: 'Exponential' },
  { key: 'O(n!)', color: 'var(--az-c7)', dash: '3 3', name: 'Factorial' },
];

const DATA = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  const row = { n };
  CURVES.forEach(({ key }) => {
    const v = trueVal(key, n);
    row[key] = v > CAP ? CAP : parseFloat(v.toFixed(2));
    row[`${key}_true`] = v;
    row[`${key}_capped`] = v > CAP;
  });
  return row;
});

/* ── chart ───────────────────────────────────────────────── */

function Tooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = DATA.find(d => d.n === label);
  const seen = new Set();
  const items = payload.filter(p => {
    if (p.dataKey.includes('_')) return false;
    if (seen.has(p.dataKey)) return false;
    seen.add(p.dataKey);
    return true;
  });

  return (
    <div
      style={{
        background: 'var(--az-elevated)',
        border: '1px solid var(--az-border)',
        borderRadius: 12,
        padding: '10px 13px',
        fontFamily: 'var(--ifm-font-family-monospace)',
        fontSize: 12,
        boxShadow: 'var(--az-card-shadow)',
        minWidth: 190,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--az-muted)',
          marginBottom: 7,
        }}
      >
        n = {label}
      </div>
      {items.map(({ dataKey, color }) => {
        const tv = row ? row[`${dataKey}_true`] : 0;
        const capped = row ? row[`${dataKey}_capped`] : false;
        return (
          <div
            key={dataKey}
            style={{ display: 'flex', justifyContent: 'space-between', gap: 20, lineHeight: 1.8 }}
          >
            <span style={{ color }}>{dataKey}</span>
            <span style={{ color: capped ? color : 'var(--az-text)', fontWeight: capped ? 600 : 400 }}>
              {capped
                ? <>{Number(tv).toLocaleString()} <ArrowUp size={12} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: '-1px' }} /></>
                : Number(tv)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Inner() {
  const {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip: RTooltip, ReferenceLine, ResponsiveContainer,
  } = require('recharts');

  const axisTick = {
    fill: 'var(--az-muted)',
    fontFamily: 'var(--ifm-font-family-monospace)',
    fontSize: 11,
  };
  const axisLabel = { ...axisTick, fontSize: 10, letterSpacing: '0.1em' };
  const grid = 'var(--az-viz-grid)';

  return (
    <div className="az-viz">
      <div className="az-viz__head">
        <span className="az-viz__label">Big-O growth curves</span>
        <span className="az-viz-hint">n = 1 … 10</span>
      </div>

      <div className="az-viz__body">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={DATA} margin={{ top: 8, right: 20, left: 0, bottom: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />

            <XAxis
              dataKey="n"
              type="number"
              domain={[1, 10]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              label={{ value: 'INPUT SIZE (n)', position: 'insideBottom', offset: -14, ...axisLabel }}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: grid }}
            />

            <YAxis
              domain={[0, CAP]}
              ticks={[0, 10, 20, 30, 40, 50, 60]}
              label={{ value: 'STEPS', angle: -90, position: 'insideLeft', offset: 16, ...axisLabel }}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: grid }}
              tickFormatter={v => (v >= CAP ? `${CAP}+` : v)}
              width={56}
            />

            <RTooltip content={<Tooltip />} cursor={{ stroke: grid }} />

            <ReferenceLine
              y={CAP}
              stroke="var(--az-accent)"
              strokeDasharray="6 4"
              strokeWidth={1}
              label={{
                value: 'CEILING — CURVES CONTINUE OFF-CHART',
                position: 'insideTopRight',
                fill: 'var(--az-accent)',
                fontFamily: 'var(--ifm-font-family-monospace)',
                fontSize: 9,
                letterSpacing: '0.1em',
              }}
            />

            {CURVES.map(({ key, color, dash }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dash}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: color }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div className="az-viz-legend">
          {CURVES.map(({ key, color, name }) => (
            <span className="az-viz-legend__item" key={key} style={{ '--dot': color }}>
              <span className="az-viz-legend__rule" />
              {key} — {name}
            </span>
          ))}
        </div>
      </div>

      <p className="az-viz__foot">
        The y-axis stops at {CAP} steps so the slower curves stay readable. Hover any point for the true value.
      </p>
    </div>
  );
}

export default function BigOChart() {
  return (
    <BrowserOnly fallback={<div className="az-viz__loading">Loading chart</div>}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
