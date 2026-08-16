import React, { useMemo, useState } from 'react';
import { Button, Figure, Segmented } from './figure';

/* ── Sudoku as a constraint puzzle ──────────────────────────
   Click a cell to cycle its digit. Clashes in a row, column
   or box turn red. "Solve" runs plain backtracking and counts
   how many guesses it needed. */

const PUZZLES = {
  4: '1..43.1..1..4...',
  9: '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79',
};

const parse = s => s.split('').map(c => (c === '.' ? 0 : +c));
const boxSize = n => Math.sqrt(n);

function peers(n, i) {
  const b = boxSize(n);
  const r = Math.floor(i / n);
  const c = i % n;
  const out = [];
  for (let j = 0; j < n * n; j++) {
    if (j === i) continue;
    const r2 = Math.floor(j / n);
    const c2 = j % n;
    if (r2 === r || c2 === c || (Math.floor(r2 / b) === Math.floor(r / b) && Math.floor(c2 / b) === Math.floor(c / b))) out.push(j);
  }
  return out;
}

function solve(n, start, peerList) {
  const g = [...start];
  let guesses = 0;
  const go = () => {
    const i = g.indexOf(0);
    if (i < 0) return true;
    for (let d = 1; d <= n; d++) {
      if (peerList[i].some(j => g[j] === d)) continue;
      guesses++;
      g[i] = d;
      if (go()) return true;
    }
    g[i] = 0;
    return false;
  };
  return go() ? { grid: g, guesses } : { grid: null, guesses };
}

export default function SudokuGrid() {
  const [n, setN] = useState(4);
  const givens = useMemo(() => parse(PUZZLES[n]), [n]);
  const peerList = useMemo(() => Array.from({ length: n * n }, (_, i) => peers(n, i)), [n]);
  const [grid, setGrid] = useState(() => parse(PUZZLES[4]));
  const [solvedBy, setSolvedBy] = useState(null);

  const load = k => { setN(k); setGrid(parse(PUZZLES[k])); setSolvedBy(null); };
  const cycle = i => {
    if (givens[i]) return;
    setSolvedBy(null);
    setGrid(g => g.map((v, j) => (j === i ? (v + 1) % (n + 1) : v)));
  };
  const runSolver = () => {
    const res = solve(n, givens, peerList);
    if (res.grid) { setGrid(res.grid); setSolvedBy(res.guesses); }
  };

  const bad = new Set();
  grid.forEach((v, i) => { if (v && peerList[i].some(j => grid[j] === v)) bad.add(i); });
  const filled = grid.filter(Boolean).length;
  const done = filled === n * n && bad.size === 0;

  let status = <>Click an empty cell to cycle through 1 to {n}</>;
  let tone;
  if (bad.size) { tone = 'bad'; status = <><b>Clash</b>: the same digit twice in a row, column or box</>; }
  else if (done && solvedBy != null) { tone = 'good'; status = <>Solved by backtracking after <b>{solvedBy.toLocaleString('en-US')}</b> guesses. Checking it takes one look per cell.</>; }
  else if (done) { tone = 'good'; status = <><b>Solved</b>. Every row, column and box has each digit once.</>; }
  else if (filled > givens.filter(Boolean).length) status = <>{filled} of {n * n} cells filled, no clashes</>;

  const b = boxSize(n);
  const cell = n === 4 ? 52 : 34;

  return (
    <Figure
      title="Sudoku"
      tools={
        <>
          <Segmented label="Size" value={n} onChange={load} options={[{ value: 4, label: '4 × 4' }, { value: 9, label: '9 × 9' }]} />
          <Button onClick={runSolver}>Solve</Button>
          <Button onClick={() => { setGrid(givens); setSolvedBy(null); }}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div role="grid" aria-label={`${n} by ${n} Sudoku`} style={{
          display: 'grid', gridTemplateColumns: `repeat(${n}, ${cell}px)`, gridAutoRows: `${cell}px`,
          border: '2px solid var(--fig-line-strong)', borderRadius: 8, overflow: 'hidden', maxWidth: '100%',
        }}>
          {grid.map((v, i) => {
            const r = Math.floor(i / n);
            const c = i % n;
            const given = !!givens[i];
            const isBad = bad.has(i);
            return (
              <button key={i} type="button" role="gridcell" onClick={() => cycle(i)} disabled={given}
                aria-label={`Row ${r + 1}, column ${c + 1}: ${v || 'empty'}`}
                style={{
                  font: 'inherit', fontSize: n === 4 ? 18 : 14, padding: 0, cursor: given ? 'default' : 'pointer',
                  fontWeight: given ? 700 : 500,
                  color: isBad ? 'var(--fig-bad)' : given ? 'var(--fig-ink)' : 'var(--fig-accent)',
                  background: isBad ? 'var(--fig-bad-soft)' : given ? 'var(--fig-well)' : 'var(--fig-bg)',
                  border: 'none',
                  borderRight: c % b === b - 1 && c !== n - 1 ? '2px solid var(--fig-line-strong)' : '1px solid var(--fig-line)',
                  borderBottom: r % b === b - 1 && r !== n - 1 ? '2px solid var(--fig-line-strong)' : '1px solid var(--fig-line)',
                }}>
                {v || ''}
              </button>
            );
          })}
        </div>
      </div>
    </Figure>
  );
}
