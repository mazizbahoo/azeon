import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── How fast a game tree grows ─────────────────────────────
   Positions after d moves ≈ b^d, where b is a rough average
   number of legal moves per turn (commonly quoted estimates). */

const GAMES = {
  chess: { label: 'Chess', b: 35, note: 'about 35 legal moves per turn on average' },
  go: { label: 'Go (19 × 19)', b: 250, note: 'about 250 legal moves per turn on average' },
};

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[+d]).join('');
const YEAR = Math.log10(3.156e7);
const UNIVERSE = Math.log10(4.35e17);

const big = l => (l < 6 ? Math.round(10 ** l).toLocaleString('en-US') : `${(10 ** (l - Math.floor(l))).toFixed(1)} × 10${sup(Math.floor(l))}`);
function duration(l) {
  if (l < 0) return 'under a second';
  if (l < Math.log10(60)) return `${Math.round(10 ** l)} seconds`;
  if (l < Math.log10(3600)) return `${Math.round(10 ** l / 60)} minutes`;
  if (l < Math.log10(86400)) return `${Math.round(10 ** l / 3600)} hours`;
  if (l < YEAR) return `${Math.round(10 ** l / 86400)} days`;
  if (l < UNIVERSE) return `${big(l - YEAR)} years`;
  return `${big(l - UNIVERSE)} × the age of the universe`;
}

export default function GameTreeGrowth() {
  const [game, setGame] = useState('chess');
  const [d, setD] = useState(10);
  const g = GAMES[game];
  const logPositions = d * Math.log10(g.b);
  const logSeconds = logPositions - 9;

  return (
    <Figure
      title="Looking ahead"
      tools={<Segmented label="Game" value={game} onChange={setGame}
        options={Object.entries(GAMES).map(([value, v]) => ({ value, label: v.label }))} />}
      status={<>{g.label}: {g.note}. Checking a billion positions per second: <b>{duration(logSeconds)}</b></>}
    >
      <div className="az-rt__input">
        <label className="az-fig-label" htmlFor="az-gt-d">Moves ahead</label>
        <input id="az-gt-d" className="az-fig-range" type="range" min={1} max={40} value={d} onChange={e => setD(+e.target.value)} />
        <span className="az-rt__n">{d}</span>
      </div>
      <div className="az-fig-well" style={{ padding: '18px 16px', textAlign: 'center' }}>
        <div className="az-fig-label" style={{ marginBottom: 6 }}>Positions to look at, roughly {g.b}{sup(d)}</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--fig-accent)', letterSpacing: '-0.01em' }}>{big(logPositions)}</div>
      </div>
    </Figure>
  );
}
