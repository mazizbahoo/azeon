import React, { useState } from 'react';
import { Box, Gem } from 'lucide-react';
import { Button, Figure, Segmented } from './figure';

/* ── The Baker–Gill–Solovay adversary ───────────────────────
   2^n boxes, a budget of n openings (stand-in for "polynomial").
   The adversary decides where the gem goes only after you
   commit, so it can always make your answer wrong. */

export default function OracleAdversary() {
  const [n, setN] = useState(4);
  const [opened, setOpened] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [gem, setGem] = useState(null);

  const boxes = 2 ** n;
  const budget = n;
  const reset = k => { setN(k); setOpened([]); setVerdict(null); setGem(null); };

  const open = i => {
    if (verdict || opened.includes(i) || opened.length >= budget) return;
    setOpened(o => [...o, i]);
  };
  const answer = saysYes => {
    setVerdict(saysYes ? 'yes' : 'no');
    if (saysYes) setGem(null);
    else {
      const unopened = Array.from({ length: boxes }, (_, i) => i).filter(i => !opened.includes(i));
      setGem(unopened[Math.floor(unopened.length / 2)]);
    }
  };

  let status = <>Is there a gem in any of the {boxes} boxes? You may open <b>{budget - opened.length}</b> more.</>;
  let tone;
  if (verdict === 'yes') { tone = 'bad'; status = <>You said <b>yes</b>. The oracle made every box empty. <b>Wrong</b>.</>; }
  if (verdict === 'no') { tone = 'bad'; status = <>You said <b>no</b>. The oracle put the gem in a box you never opened. <b>Wrong</b>.</>; }

  return (
    <Figure
      title="Beat the oracle"
      tools={
        <>
          <Segmented label="n" value={n} onChange={reset}
            options={[4, 5, 6].map(k => ({ value: k, label: `n = ${k}` }))} />
          <Button onClick={() => reset(n)} disabled={!opened.length && !verdict}>Reset</Button>
        </>
      }
      status={status}
      tone={tone}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(boxes, 16)}, minmax(0, 1fr))`, gap: 4 }}>
        {Array.from({ length: boxes }, (_, i) => {
          const isOpen = opened.includes(i) || verdict;
          const hasGem = gem === i;
          return (
            <button key={i} type="button" className="az-fig-btn" onClick={() => open(i)}
              aria-label={`Box ${i + 1}${opened.includes(i) ? ', opened, empty' : ''}`}
              disabled={!!verdict || (!opened.includes(i) && opened.length >= budget)}
              style={{
                height: 30, padding: 0, minWidth: 0,
                background: hasGem ? 'var(--fig-accent-soft)' : opened.includes(i) ? 'var(--fig-well)' : undefined,
                borderColor: hasGem ? 'var(--fig-accent)' : opened.includes(i) ? 'var(--fig-ink)' : undefined,
              }}>
              {hasGem
                ? <Gem size={14} strokeWidth={2} color="var(--fig-accent)" aria-hidden="true" />
                : isOpen ? <span style={{ fontSize: 14, color: 'var(--fig-muted)' }} aria-hidden="true">–</span>
                  : <Box size={14} strokeWidth={2} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        <Button onClick={() => answer(true)} disabled={!!verdict}>Answer: a gem exists</Button>
        <Button onClick={() => answer(false)} disabled={!!verdict}>Answer: all empty</Button>
      </div>
    </Figure>
  );
}
