import React, { useState } from 'react';
import { Button, Figure } from './figure';

/* ── Determinant vs permanent of a 3×3 matrix ───────────────
   Same six products. The determinant gives half of them a minus
   sign; the permanent adds them all. Click a cell to change it. */

const PERMS = [
  { p: [0, 1, 2], sign: 1 }, { p: [1, 2, 0], sign: 1 }, { p: [2, 0, 1], sign: 1 },
  { p: [0, 2, 1], sign: -1 }, { p: [1, 0, 2], sign: -1 }, { p: [2, 1, 0], sign: -1 },
];
const START = [[1, 2, 0], [3, 1, 1], [0, 2, 1]];
const cycle = v => (v >= 3 ? -2 : v + 1);
const fmt = v => (v < 0 ? `−${-v}` : String(v));

export default function PermDet() {
  const [m, setM] = useState(START);
  const [hover, setHover] = useState(null);

  const terms = PERMS.map(({ p, sign }) => ({ p, sign, prod: p.reduce((acc, col, row) => acc * m[row][col], 1) }));
  const det = terms.reduce((s, t) => s + t.sign * t.prod, 0);
  const perm = terms.reduce((s, t) => s + t.prod, 0);
  const lit = hover === null ? null : terms[hover].p;

  return (
    <Figure
      title="Determinant vs permanent"
      tools={<Button onClick={() => setM(START)}>Reset</Button>}
      status={<>Determinant <b>{fmt(det)}</b> · permanent <b>{fmt(perm)}</b>. Click a cell to change it; hover a product to see where it comes from.</>}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: 4 }}>
          {m.flatMap((row, r) => row.map((v, c) => {
            const on = lit && lit[r] === c;
            return (
              <button key={`${r}${c}`} type="button" className="az-fig-btn" aria-label={`Row ${r + 1}, column ${c + 1}: ${v}`}
                onClick={() => setM(mm => mm.map((rr, i) => rr.map((x, j) => (i === r && j === c ? cycle(x) : x))))}
                style={{ height: 44, fontSize: 16, fontWeight: 600,
                  background: on ? 'var(--fig-accent-soft)' : undefined, borderColor: on ? 'var(--fig-accent)' : undefined,
                  color: on ? 'var(--fig-accent)' : undefined }}>
                {fmt(v)}
              </button>
            );
          }))}
        </div>
        <table className="az-fig-table" style={{ width: 'auto', minWidth: 260 }}>
          <thead><tr><th>Product</th><th style={{ textAlign: 'right' }}>Value</th><th style={{ textAlign: 'center' }}>det sign</th></tr></thead>
          <tbody>
            {terms.map((t, i) => (
              <tr key={i} data-on={String(hover === i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <td>{t.p.map((col, row) => `a${row + 1}${col + 1}`).join(' · ')}</td>
                <td style={{ textAlign: 'right' }}>{fmt(t.prod)}</td>
                <td style={{ textAlign: 'center', color: t.sign < 0 ? 'var(--fig-bad)' : 'var(--fig-ink)' }}>{t.sign < 0 ? '−' : '+'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}
