import React, { useState } from 'react';
import { Button, Figure, Segmented } from './figure';

/* ── Spot the generator ─────────────────────────────────────
   Two 256-bit "truth tables": one from a truly unpredictable
   source (here: a well-mixed generator standing in for one),
   one from a generator. A weak generator leaves visible
   patterns; a strong one doesn't. Seeds are fixed for SSR. */

const SIDE = 16;
const BITS = SIDE * SIDE;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const truly = seed => { const r = mulberry32(seed * 7919 + 17); return Array.from({ length: BITS }, () => (r() < 0.5 ? 1 : 0)); };
// Weak: one bit of a tiny linear congruential generator. Repeats every 16 steps.
const weak = seed => { let x = seed % 64; return Array.from({ length: BITS }, () => { x = (5 * x + 1) % 64; return (x >> 3) & 1; }); };
// Stronger: xorshift. Not cryptographic, but no pattern you'll see by eye.
const strong = seed => {
  let x = (seed * 2654435761) >>> 0 || 1;
  return Array.from({ length: BITS }, () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x >>> 7) & 1; });
};

function Grid({ bits, label, pick, picked, reveal, isGen }) {
  const border = reveal ? (isGen ? 'var(--fig-accent)' : 'var(--fig-line-strong)') : picked ? 'var(--fig-ink)' : 'var(--fig-line)';
  return (
    <div className="az-fig-pane">
      <div className="az-fig-pane__head">
        <span className="az-fig-label">{label}</span>
        <span className="az-fig-pane__meta">{reveal ? (isGen ? 'generator' : 'random') : ''}</span>
      </div>
      <button type="button" onClick={pick} aria-label={`Pick ${label} as the generator`}
        style={{ padding: 6, background: 'var(--fig-well)', border: `2px solid ${border}`, borderRadius: 10, cursor: 'pointer' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIDE}, 1fr)`, gap: 1, aspectRatio: '1' }}>
          {bits.map((b, i) => <span key={i} style={{ background: b ? 'var(--fig-ink)' : 'transparent', borderRadius: 1 }} />)}
        </div>
      </button>
    </div>
  );
}

export default function RandomOrNot() {
  const [kind, setKind] = useState('weak');
  const [seed, setSeed] = useState(1);
  const [guess, setGuess] = useState(null);

  const genOnLeft = seed % 2 === 0;
  const gen = (kind === 'weak' ? weak : strong)(seed + 3);
  const rnd = truly(seed);
  const left = genOnLeft ? gen : rnd;
  const right = genOnLeft ? rnd : gen;
  const correct = guess !== null && (guess === 'left') === genOnLeft;

  let status = <>One grid came from a generator with a short secret seed. Click the one you think it is.</>;
  let tone;
  if (guess) {
    tone = correct ? 'good' : 'bad';
    status = correct
      ? <><b>Caught it.</b> {kind === 'weak' ? 'The weak generator repeats every 16 bits, so every row is the same.' : 'Lucky, or a sharp eye. Try a few more: you should be right about half the time.'}</>
      : <><b>Fooled.</b> {kind === 'weak' ? 'Look for rows that repeat.' : 'Nothing visible gives the strong generator away.'}</>;
  }

  return (
    <Figure
      title="Which one is pseudorandom?"
      tools={
        <>
          <Segmented label="Generator" value={kind} onChange={k => { setKind(k); setGuess(null); }}
            options={[{ value: 'weak', label: 'Weak generator' }, { value: 'strong', label: 'Stronger generator' }]} />
          <Button onClick={() => { setSeed(s => s + 1); setGuess(null); }}>New pair</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-pair">
        <Grid bits={left} label="Grid A" pick={() => setGuess('left')} picked={guess === 'left'} reveal={!!guess} isGen={genOnLeft} />
        <Grid bits={right} label="Grid B" pick={() => setGuess('right')} picked={guess === 'right'} reveal={!!guess} isGen={!genOnLeft} />
      </div>
    </Figure>
  );
}
