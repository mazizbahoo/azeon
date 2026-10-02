import React, { useState } from 'react';
import { Figure } from './figure';

/* ── Wheat and chessboard: square k holds 2^(k−1) grains ─── */

const GRAIN_GRAMS = 0.04; // ~40 mg per grain
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[+d]).join('');

function big(n) {
  const s = n.toString();
  if (s.length <= 9) return n.toLocaleString('en-US');
  return `${s[0]}.${s.slice(1, 3)} × 10${sup(s.length - 1)}`;
}

function weight(grains) {
  const g = Number(grains) * GRAIN_GRAMS;
  if (g < 1000) return `${g < 10 ? g.toFixed(2) : Math.round(g)} g`;
  if (g < 1e6) return `${(g / 1000).toFixed(g < 1e4 ? 1 : 0)} kg`;
  const t = g / 1e6;
  if (t < 1e6) return `${Math.round(t).toLocaleString('en-US')} t`;
  if (t < 1e9) return `${(t / 1e6).toPrecision(3)} million t`;
  return `${(t / 1e9).toPrecision(3)} billion t`;
}

export default function WheatChessboard() {
  const [k, setK] = useState(20);
  const [hover, setHover] = useState(null);
  const sq = hover ?? k;
  const on = 2n ** BigInt(sq - 1);
  const total = 2n ** BigInt(sq) - 1n;

  return (
    <Figure title="Wheat on a chessboard" status={<>Square <b>{sq}</b> of 64 · hover or tap any square</>}>
      <div className="az-wheat">
        <div className="az-wheat__board" onMouseLeave={() => setHover(null)}>
          {Array.from({ length: 64 }, (_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                type="button"
                className="az-wheat__sq"
                aria-label={`Square ${n}`}
                aria-pressed={n === k}
                data-current={String(n === sq)}
                data-filled={String(n <= sq)}
                style={{ '--fill': n <= sq ? 0.08 + 0.72 * (n / 64) : 0 }}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(null)}
                onClick={() => setK(n)}
              >
                {n}
              </button>
            );
          })}
        </div>

        <dl className="az-wheat__facts">
          <div><dt>On this square</dt><dd>{big(on)}</dd></div>
          <div><dt>Running total</dt><dd>{big(total)}</dd></div>
          <div><dt>Weight</dt><dd>{weight(total)}</dd></div>
        </dl>
      </div>
    </Figure>
  );
}
