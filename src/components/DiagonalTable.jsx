import React, { useState } from 'react';
import { Button, Figure, svgButton } from './figure';

/* ── Cantor's diagonal argument ─────────────────────────────
   Rows are (the start of) infinite 0/1 sequences in some list.
   Flip every bit on the diagonal: the new row differs from
   row i at position i, so it is not anywhere in the list. */

const N = 8;
const START = [
  '01101001', '11110000', '00000000', '10101010',
  '11011011', '01010101', '00111100', '10000001',
].map(s => s.split('').map(Number));

const CELL = 34;
const LABEL = 64;

export default function DiagonalTable() {
  const [rows, setRows] = useState(START);
  const [focus, setFocus] = useState(null);
  const anti = rows.map((r, i) => 1 - r[i]);

  const flip = (r, c) => setRows(rs => rs.map((row, i) => (i === r ? row.map((b, j) => (j === c ? 1 - b : b)) : row)));
  const W = LABEL + N * CELL + 40;
  const H = (N + 2) * CELL + 16;

  return (
    <Figure
      title="Build a row that isn't in the list"
      tools={<Button onClick={() => setRows(START)}>Reset</Button>}
      status={focus === null
        ? <>Click any bit to change the list. Hover the new row to see why it differs from every row.</>
        : <>The new row differs from row <b>{focus + 1}</b> at position <b>{focus + 1}</b>: {rows[focus][focus]} versus {anti[focus]}</>}
    >
      <div className="az-fig-well" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" style={{ minWidth: 340 }} role="group" aria-label="List of sequences with the diagonal highlighted">
          {Array.from({ length: N }, (_, c) => (
            <text key={c} x={LABEL + c * CELL + CELL / 2} y={18} textAnchor="middle" fontSize="10.5" fill="var(--fig-muted)">{c + 1}</text>
          ))}
          {rows.map((row, r) => (
            <g key={r}>
              <text x={LABEL - 10} y={30 + r * CELL + CELL / 2} textAnchor="end" dominantBaseline="middle" fontSize="11"
                fill={focus === r ? 'var(--fig-accent)' : 'var(--fig-muted)'}>row {r + 1}</text>
              {row.map((b, c) => {
                const diag = r === c;
                const hot = focus === r && diag;
                return (
                  <g key={c} {...svgButton(() => flip(r, c), `Row ${r + 1}, position ${c + 1}: ${b}`)}>
                    <rect className="az-fig-node" x={LABEL + c * CELL + 2} y={30 + r * CELL + 2} width={CELL - 4} height={CELL - 4} rx={6}
                      fill={diag ? 'var(--fig-accent)' : 'var(--fig-bg)'} fillOpacity={diag ? (hot ? 0.35 : 0.14) : 1}
                      stroke={diag ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={hot ? 2 : 1} />
                    <text x={LABEL + c * CELL + CELL / 2} y={30 + r * CELL + CELL / 2 + 1} textAnchor="middle" dominantBaseline="middle"
                      fontSize="13" fill={diag ? 'var(--fig-accent)' : 'var(--fig-ink)'}>{b}</text>
                  </g>
                );
              })}
              <text x={LABEL + N * CELL + 12} y={30 + r * CELL + CELL / 2} dominantBaseline="middle" fontSize="12" fill="var(--fig-muted)">…</text>
            </g>
          ))}
          <text x={LABEL - 10} y={30 + (N + 0.5) * CELL + 14} textAnchor="end" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="var(--fig-accent)">new</text>
          {anti.map((b, c) => (
            <g key={c} onMouseEnter={() => setFocus(c)} onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(c)} onBlur={() => setFocus(null)} tabIndex={0} role="button"
              aria-label={`New row, position ${c + 1}: ${b}, flipped from row ${c + 1}`} style={{ outline: 'none', cursor: 'default' }}>
              <rect x={LABEL + c * CELL + 2} y={30 + N * CELL + 16} width={CELL - 4} height={CELL - 4} rx={6}
                fill="var(--fig-accent)" fillOpacity={focus === c ? 1 : 0.85} />
              <text x={LABEL + c * CELL + CELL / 2} y={30 + N * CELL + 16 + (CELL - 4) / 2 + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fontWeight="600" fill="#fff">{b}</text>
            </g>
          ))}
        </svg>
      </div>
    </Figure>
  );
}
