import React, { useState } from 'react';
import { Button, Figure, Segmented } from './figure';

/* ── Graph non-isomorphism by conversation ──────────────────
   You (the verifier) secretly pick graph 0 or 1, scramble its
   labels, and show the result. The prover says which one you
   picked. If the graphs really differ, it's always right. If
   they're secretly the same, it can only guess. */

const N = 5;
const G0 = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]; // 5-cycle
const G1_DIFF = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]]; // triangle with a tail, also 5 edges
const G1_SAME = [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]]; // a 5-cycle with different labels

const key = edges => new Set(edges.map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`)));
const apply = (edges, p) => edges.map(([a, b]) => [p[a], p[b]]);
const PERMS = (() => {
  const out = [];
  const go = (arr, k) => {
    if (k === arr.length) { out.push([...arr]); return; }
    for (let i = k; i < arr.length; i++) { [arr[k], arr[i]] = [arr[i], arr[k]]; go(arr, k + 1); [arr[k], arr[i]] = [arr[i], arr[k]]; }
  };
  go([0, 1, 2, 3, 4], 0);
  return out;
})();
const sameGraph = (a, b) => { const ka = key(a); const kb = key(b); return ka.size === kb.size && [...ka].every(e => kb.has(e)); };
const isomorphic = (a, b) => PERMS.some(p => sameGraph(apply(a, p), b));

const W = 170;
const pos = i => {
  const ang = (i * 2 * Math.PI) / N - Math.PI / 2;
  return [W / 2 + 62 * Math.cos(ang), W / 2 + 62 * Math.sin(ang)];
};

function Mini({ edges, label, meta }) {
  return (
    <div className="az-fig-pane">
      <div className="az-fig-pane__head"><span className="az-fig-label">{label}</span><span className="az-fig-pane__meta">{meta}</span></div>
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${W}`} className="az-fig-svg" role="img" aria-label={label}>
          {edges.map(([a, b]) => {
            const [x1, y1] = pos(a);
            const [x2, y2] = pos(b);
            return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fig-line-strong)" strokeWidth={1.75} />;
          })}
          {Array.from({ length: N }, (_, i) => {
            const [x, y] = pos(i);
            return <circle key={i} cx={x} cy={y} r={9} fill="var(--fig-bg)" stroke="var(--fig-ink)" strokeWidth={1.25} />;
          })}
        </svg>
      </div>
    </div>
  );
}

export default function GraphNonIsoGame() {
  const [mode, setMode] = useState('diff');
  const [round, setRound] = useState(null);
  const [tally, setTally] = useState({ rounds: 0, right: 0 });
  const G1 = mode === 'diff' ? G1_DIFF : G1_SAME;

  const play = () => {
    const secret = Math.random() < 0.5 ? 0 : 1;
    const p = PERMS[Math.floor(Math.random() * PERMS.length)];
    const shown = apply(secret ? G1 : G0, p);
    // Honest, all-powerful prover: checks which graph the scrambled one matches.
    const m0 = isomorphic(G0, shown);
    const m1 = isomorphic(G1, shown);
    const answer = m0 && !m1 ? 0 : m1 && !m0 ? 1 : (Math.random() < 0.5 ? 0 : 1);
    setRound({ secret, shown, answer });
    setTally(t => ({ rounds: t.rounds + 1, right: t.right + (answer === secret ? 1 : 0) }));
  };
  const reset = m => { setMode(m); setRound(null); setTally({ rounds: 0, right: 0 }); };

  let status = <>Press <b>Send a scrambled graph</b>. You secretly pick graph 0 or 1 and shuffle its labels.</>;
  let tone;
  if (round) {
    const ok = round.answer === round.secret;
    tone = ok ? 'good' : 'bad';
    const allRight = tally.right === tally.rounds;
    status = <>You picked {round.secret}, the prover said <b>{round.answer}</b>. Score: <b>{tally.right} / {tally.rounds}</b>.{' '}
      {allRight
        ? <>If the graphs were secretly the same, the chance of this many correct guesses would be {(0.5 ** tally.rounds).toPrecision(2)}.</>
        : <>A wrong answer: the prover has been caught, so the graphs must be the same.</>}</>;
  }

  return (
    <Figure
      title="Prove two graphs are different"
      tools={
        <>
          <Segmented label="Graphs" value={mode} onChange={reset}
            options={[{ value: 'diff', label: 'Really different' }, { value: 'same', label: 'Secretly the same' }]} />
          <Button primary onClick={play}>Send a scrambled graph</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div className="az-fig-pair" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <Mini edges={G0} label="Graph 0" meta="" />
        <Mini edges={G1} label="Graph 1" meta="" />
        <Mini edges={round ? round.shown : []} label="Sent" meta={round ? `prover: ${round.answer}` : ''} />
      </div>
    </Figure>
  );
}
