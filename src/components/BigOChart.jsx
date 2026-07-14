import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

/* ── helpers ─────────────────────────────────────────────── */

function fact(n) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const CAP = 60;

function clamp(v) {
  return v > CAP ? CAP : parseFloat(v.toFixed(2));
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

const CURVE_KEYS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)'];

const CURVES = [
  { key: 'O(1)', color: '#4caf50', dash: '', label: 'O(1) — Constant' },
  { key: 'O(log n)', color: '#00e5ff', dash: '', label: 'O(log n) — Logarithmic' },
  { key: 'O(n)', color: '#a67cff', dash: '', label: 'O(n) — Linear' },
  { key: 'O(n log n)', color: '#f5c542', dash: '', label: 'O(n log n) — Linearithmic' },
  { key: 'O(n²)', color: '#ff8c00', dash: '', label: 'O(n²) — Quadratic' },
  { key: 'O(2ⁿ)', color: '#e0224e', dash: '6 3', label: 'O(2ⁿ) — Exponential' },
  { key: 'O(n!)', color: '#ff69b4', dash: '3 3', label: 'O(n!) — Factorial' },
];

function buildData() {
  const rows = [];
  for (let n = 1; n <= 10; n++) {
    const row = { n };
    CURVE_KEYS.forEach(key => {
      row[key] = clamp(trueVal(key, n));
      row[`${key}_true`] = trueVal(key, n);
      row[`${key}_capped`] = trueVal(key, n) > CAP;
    });
    rows.push(row);
  }
  return rows;
}

const DATA = buildData();

/* ── inner chart ─────────────────────────────────────────── */

function Inner() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';

  const {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ReferenceLine, ResponsiveContainer,
  } = require('recharts');

  // Dark mode: pure black base (#000000), surface #0f0f0f, elevated #1a1a1a
  // Light mode: pure white base (#ffffff), elevated #f7f7fa
  // Text: dark = #e7e9ea, light = #0d0a1a
  const bgColor = 'var(--az-surface)';
  const borderCol = 'var(--az-border)';
  const tooltipBg = dark ? '#1a1a1a' : '#f7f7fa';
  const tooltipBdr = dark ? 'rgba(166,124,255,0.28)' : 'rgba(94,53,177,0.20)';
  const labelColor = 'var(--az-text)';
  const gridColor = dark ? 'rgba(231,233,234,0.05)' : 'rgba(13,10,26,0.07)';
  const axisColor = 'var(--az-text)';
  const accentCol = 'var(--az-accent)';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const seen = new Set();
    const items = payload.filter(p => {
      if (p.dataKey.includes('_true') || p.dataKey.includes('_capped')) return false;
      if (seen.has(p.dataKey)) return false;
      seen.add(p.dataKey);
      return true;
    });
    return (
      <div style={{
        background: tooltipBg,
        border: `1px solid ${tooltipBdr}`,
        borderRadius: 10,
        padding: '10px 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        color: labelColor,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        minWidth: 200,
      }}>
        <div style={{ marginBottom: 7, opacity: 0.45, fontSize: '0.62rem', letterSpacing: '0.12em' }}>
          n = {label}
        </div>
        {items.map(({ dataKey, color }) => {
          const row = DATA.find(d => d.n === label);
          const tv = row ? row[`${dataKey}_true`] : '—';
          const isCap = row ? row[`${dataKey}_capped`] : false;
          const display = isCap
            ? `${Number(tv).toLocaleString()} ↑`
            : parseFloat(Number(tv).toFixed(2));
          return (
            <div key={dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 4 }}>
              <span style={{ color }}>{dataKey}</span>
              <span style={{ fontWeight: isCap ? 700 : 400, color: isCap ? color : undefined, opacity: isCap ? 1 : 0.8 }}>
                {display}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const CustomLegend = () => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '7px 18px',
      justifyContent: 'center',
      marginTop: 14,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.63rem',
      letterSpacing: '0.03em',
    }}>
      {CURVES.map(({ key, color, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 20, height: 2.5, background: color, borderRadius: 2 }} />
          <span style={{ color: axisColor }}>{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderCol}`,
      borderRadius: 24,
      padding: '28px 16px 20px',
      margin: '2rem 0',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.6rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: accentCol,
        textAlign: 'center',
        marginBottom: 20,
      }}>
        // Big-O Growth Curves — n = 1 to 10
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={DATA} margin={{ top: 8, right: 28, left: 4, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey="n"
            type="number"
            domain={[1, 10]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            label={{
              value: 'Input size (n)',
              position: 'insideBottom',
              offset: -14,
              fill: axisColor,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
            tick={{ fill: axisColor, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />

          <YAxis
            domain={[0, CAP]}
            ticks={[0, 10, 20, 30, 40, 50, 60]}
            label={{
              value: 'Steps',
              angle: -90,
              position: 'insideLeft',
              offset: 14,
              fill: axisColor,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
            tick={{ fill: axisColor, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            tickFormatter={v => v >= CAP ? `${CAP}+` : v}
          />

          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            y={CAP}
            stroke={accentCol}
            strokeDasharray="8 4"
            strokeWidth={1}
            label={{
              value: '← curves hitting this ceiling continue growing far beyond this chart',
              position: 'insideTopRight',
              fill: accentCol,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
            }}
          />

          {CURVES.map(({ key, color, dash }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2.2}
              strokeDasharray={dash}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: color }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <CustomLegend />

      <div style={{
        marginTop: 12,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.59rem',
        color: axisColor,
        textAlign: 'center',
        letterSpacing: '0.04em',
      }}>
        Y-axis capped at {CAP} steps so slower curves stay visible. Hover any point to see the true value.
      </div>
    </div>
  );
}

/* ── export ──────────────────────────────────────────────── */

export default function BigOChart() {
  return (
    <BrowserOnly fallback={
      <div style={{
        height: 340,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.4,
        fontFamily: 'monospace',
        fontSize: '0.8rem',
      }}>
        Loading chart...
      </div>
    }>
      {() => <Inner />}
    </BrowserOnly>
  );
}