import React, { useState } from 'react';
import { Button, Figure } from './figure';

/* ── One qubit, three gates ─────────────────────────────────
   State = two real amplitudes (for |0⟩ and |1⟩). Probabilities
   are squares of amplitudes. H twice cancels itself: that
   cancellation is interference. */

const S = Math.SQRT1_2;
const GATES = {
  H: { label: 'H', apply: ([a, b]) => [S * (a + b), S * (a - b)], text: 'Hadamard: spread into both, with a sign' },
  X: { label: 'X', apply: ([a, b]) => [b, a], text: 'NOT: swap the two amplitudes' },
  Z: { label: 'Z', apply: ([a, b]) => [a, -b], text: 'Phase flip: make the |1⟩ amplitude negative' },
};
const PRESETS = [['H'], ['H', 'H'], ['H', 'Z', 'H']];
const MAX = 8;
const clean = x => (Math.abs(x) < 1e-9 ? 0 : x);
const fmt = x => {
  const v = clean(x);
  if (Math.abs(Math.abs(v) - S) < 1e-9) return `${v < 0 ? '−' : '+'}0.707`;
  return `${v < 0 ? '−' : v > 0 ? '+' : ' '}${Math.abs(v).toFixed(3)}`;
};

function Bar({ label, amp }) {
  const p = clean(amp) ** 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 120px', alignItems: 'center', gap: 10 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <div className="az-fig-well" style={{ height: 22, overflow: 'hidden' }}>
        <div style={{ width: `${p * 100}%`, height: '100%', background: 'var(--fig-accent)', opacity: 0.8, transition: 'width 0.25s ease' }} />
      </div>
      <span style={{ color: 'var(--fig-muted)', fontVariantNumeric: 'tabular-nums' }}>amp {fmt(amp)} · {Math.round(p * 100)}%</span>
    </div>
  );
}

export default function QubitInterference() {
  const [gates, setGates] = useState(['H']);
  const states = gates.reduce((acc, g) => [...acc, GATES[g].apply(acc[acc.length - 1])], [[1, 0]]);
  const [a, b] = states[states.length - 1];

  return (
    <Figure
      title="One qubit"
      tools={
        <>
          {Object.keys(GATES).map(g => (
            <Button key={g} onClick={() => setGates(gs => [...gs, g])} disabled={gates.length >= MAX} label={GATES[g].text}>+ {g}</Button>
          ))}
          <Button onClick={() => setGates(gs => gs.slice(0, -1))} disabled={!gates.length}>Undo</Button>
          {PRESETS.map(p => (
            <Button key={p.join('')} onClick={() => setGates(p)}>{p.join(' ')}</Button>
          ))}
        </>
      }
      status={<>Measuring now gives <b>0</b> with probability {Math.round(clean(a) ** 2 * 100)}% and <b>1</b> with probability {Math.round(clean(b) ** 2 * 100)}%</>}
    >
      <div className="az-fig-formula" style={{ fontSize: 14 }}>
        |0⟩ {gates.length ? '→ ' : ''}{gates.join(' → ')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Bar label="|0⟩" amp={a} />
        <Bar label="|1⟩" amp={b} />
      </div>
    </Figure>
  );
}
