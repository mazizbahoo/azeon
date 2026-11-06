import React, { useMemo, useState } from 'react';
import { Flag } from 'lucide-react';
import { Button, Figure } from './figure';

/* ── Minesweeper consistency ────────────────────────────────
   Flag hidden squares so every number is satisfied. "Analyse"
   tries every possible layout of mines and reports, per hidden
   square, whether it is a mine in all of them, none, or some. */

const BOARD = ['######', '121222', '000###'];
const H = BOARD.length;
const W = BOARD[0].length;
const CELLS = BOARD.flatMap((row, r) => row.split('').map((ch, c) => ({ r, c, i: r * W + c, hidden: ch === '#', n: ch === '#' ? null : +ch })));
const HIDDEN = CELLS.filter(x => x.hidden).map(x => x.i);
const near = i => {
  const r = Math.floor(i / W);
  const c = i % W;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const a = r + dr;
    const b = c + dc;
    if ((dr || dc) && a >= 0 && a < H && b >= 0 && b < W) out.push(a * W + b);
  }
  return out;
};
const NEAR = CELLS.map(x => near(x.i));
const NUMBERS = CELLS.filter(x => !x.hidden);
const satisfied = (mines, x) => NEAR[x.i].filter(j => mines.has(j)).length;

function analyse() {
  const layouts = [];
  for (let m = 0; m < 1 << HIDDEN.length; m++) {
    const mines = new Set(HIDDEN.filter((_, k) => m & (1 << k)));
    if (NUMBERS.every(x => satisfied(mines, x) === x.n)) layouts.push(mines);
  }
  const verdict = {};
  HIDDEN.forEach(i => {
    const k = layouts.filter(s => s.has(i)).length;
    verdict[i] = k === 0 ? 'safe' : k === layouts.length ? 'mine' : 'unknown';
  });
  return { count: layouts.length, verdict };
}

const SIZE = 46;

export default function MinesweeperLogic() {
  const [flags, setFlags] = useState(() => new Set());
  const [shown, setShown] = useState(false);
  const result = useMemo(analyse, []);

  const toggle = i => setFlags(f => {
    const next = new Set(f);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  const over = NUMBERS.filter(x => satisfied(flags, x) > x.n);
  const consistent = NUMBERS.every(x => satisfied(flags, x) === x.n);

  let status = <>Flag the hidden squares that hold mines so every number is right</>;
  let tone;
  if (shown) {
    status = <><b>{result.count}</b> layouts fit the numbers · S = safe in all of them, M = mine in all of them, ? = depends</>;
  } else if (over.length) {
    tone = 'bad';
    status = <>A <b>{over[0].n}</b> now touches {satisfied(flags, over[0])} flags: <b>too many mines</b></>;
  } else if (consistent) {
    tone = 'good';
    status = <><b>Consistent</b>: every number matches its flagged neighbours</>;
  } else if (flags.size) {
    status = <>{flags.size} flag{flags.size === 1 ? '' : 's'} placed · some numbers still need more</>;
  }

  return (
    <Figure
      title="Do these numbers make sense?"
      tools={
        <>
          <Button onClick={() => setShown(s => !s)} pressed={shown}>Analyse</Button>
          <Button onClick={() => { setFlags(new Set()); setShown(false); }} disabled={!flags.size && !shown}>Clear</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${W}, ${SIZE}px)`, gridAutoRows: `${SIZE}px`, gap: 4 }}>
          {CELLS.map(x => {
            if (!x.hidden) {
              const bad = satisfied(flags, x) > x.n;
              const ok = satisfied(flags, x) === x.n;
              return (
                <div key={x.i} className="az-fig-token" data-bad={String(bad)} data-on={String(ok && flags.size > 0 && !bad)}
                  style={{ width: SIZE, height: SIZE, fontSize: 16, fontWeight: 600 }}>{x.n}</div>
              );
            }
            const flagged = flags.has(x.i);
            const v = shown ? result.verdict[x.i] : null;
            return (
              <button key={x.i} type="button" className="az-fig-btn" aria-pressed={flagged}
                aria-label={`Hidden square, row ${x.r + 1}, column ${x.c + 1}${flagged ? ', flagged' : ''}`}
                onClick={() => toggle(x.i)}
                style={{ width: SIZE, height: SIZE, padding: 0, position: 'relative', background: flagged ? undefined : 'var(--az-elevated)' }}>
                {flagged && <Flag size={16} strokeWidth={2} aria-hidden="true" />}
                {v && (
                  <span style={{
                    position: 'absolute', right: 4, bottom: 2, fontSize: 10, fontWeight: 700,
                    color: v === 'mine' ? 'var(--fig-bad)' : v === 'safe' ? 'var(--fig-accent)' : 'var(--fig-muted)',
                  }}>{v === 'mine' ? 'M' : v === 'safe' ? 'S' : '?'}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Figure>
  );
}
