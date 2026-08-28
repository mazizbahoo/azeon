import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── Milestones in the attempt to separate P from NP ────────
   Barriers (proofs that a whole technique can't work) are
   marked with the accent. */

const EVENTS = [
  { year: '1936', name: 'The Halting Problem', who: 'Alan Turing', post: 46, text: 'Diagonalization shows some problems have no algorithm at all.' },
  { year: '1965', name: 'Time Hierarchy Theorem', who: 'Hartmanis and Stearns', post: 29, text: 'More time solves strictly more problems, so P ≠ EXP.' },
  { year: '1971', name: 'Cook–Levin Theorem', who: 'Stephen Cook, and independently Leonid Levin', post: 12, text: 'SAT is NP-Complete. The P vs NP question takes its modern form.' },
  { year: '1975', name: 'Relativization barrier', who: 'Baker, Gill and Solovay', post: 37, barrier: true, text: 'Techniques that work the same with any oracle cannot settle P vs NP.' },
  { year: '1981–83', name: 'Parity is not in AC⁰', who: 'Furst, Saxe and Sipser; Ajtai', post: 39, text: 'First strong lower bound for a restricted kind of circuit.' },
  { year: '1985', name: 'Monotone circuits for Clique', who: 'Razborov', post: 39, text: 'Clique needs huge circuits if NOT gates are banned.' },
  { year: '1990', name: 'IP = PSPACE', who: 'Shamir, building on Lund, Fortnow, Karloff and Nisan', post: 42, text: 'A major result that does not relativize.' },
  { year: '1994', name: 'Natural Proofs barrier', who: 'Razborov and Rudich', post: 40, barrier: true, text: 'If strong cryptography exists, "natural" circuit lower bound proofs cannot work.' },
  { year: '2001', name: 'Geometric Complexity Theory', who: 'Mulmuley and Sohoni', post: 44, text: 'A program to use algebraic geometry and symmetry to separate classes.' },
  { year: '2008', name: 'Algebrization barrier', who: 'Aaronson and Wigderson', post: 43, barrier: true, text: 'Even the techniques that beat relativization cannot settle P vs NP.' },
  { year: '2011', name: 'NEXP is not in ACC⁰', who: 'Ryan Williams', post: 50, text: 'A new lower bound built by turning faster algorithms into impossibility proofs.' },
  { year: '2016', name: 'No occurrence obstructions', who: 'Bürgisser, Ikenmeyer and Panova', post: 45, text: 'The simplest kind of GCT obstruction provably cannot work.' },
];

export default function BarrierTimeline() {
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState(3);
  const shown = EVENTS.map((e, i) => ({ ...e, i })).filter(e => filter === 'all' || e.barrier);
  const cur = EVENTS[sel];

  return (
    <Figure
      title="Fifty years of trying"
      tools={<Segmented label="Show" value={filter} onChange={setFilter}
        options={[{ value: 'all', label: 'All milestones' }, { value: 'barriers', label: 'Barriers only' }]} />}
      status={<><b>{cur.year} · {cur.name}</b> ({cur.who}). {cur.text}</>}
    >
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shown.map(e => (
          <li key={e.name} style={{ margin: 0 }}>
            <button type="button" onClick={() => setSel(e.i)} aria-pressed={sel === e.i}
              className="az-fig-btn" style={{
                width: '100%', height: 'auto', minHeight: 38, justifyContent: 'space-between', padding: '8px 12px',
                borderColor: e.barrier ? 'var(--fig-accent)' : undefined,
                background: sel === e.i ? 'var(--fig-accent-soft)' : undefined,
              }}>
              <span style={{ display: 'flex', gap: 12, alignItems: 'baseline', textAlign: 'left' }}>
                <span style={{ minWidth: 58, color: 'var(--fig-muted)', fontVariantNumeric: 'tabular-nums' }}>{e.year}</span>
                <span style={{ color: e.barrier ? 'var(--fig-accent)' : 'var(--fig-ink)', fontWeight: e.barrier ? 600 : 500 }}>{e.name}</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--fig-muted)', whiteSpace: 'nowrap' }}>Post {e.post}</span>
            </button>
          </li>
        ))}
      </ol>
    </Figure>
  );
}
