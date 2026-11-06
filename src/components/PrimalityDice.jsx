import React, { useState } from 'react';
import { Button, Figure, Segmented } from './figure';

/* ── Randomised primality testing ───────────────────────────
   Each round picks a random base a. Fermat: is a^(n−1) ≡ 1?
   Miller–Rabin adds a square-root check that Carmichael
   numbers can't fool. A failed round proves "composite". */

const NUMBERS = [
  { n: 97, note: 'prime' },
  { n: 221, note: '13 × 17' },
  { n: 561, note: '3 × 11 × 17, a Carmichael number' },
  { n: 7919, note: 'prime' },
  { n: 8911, note: '7 × 19 × 67, a Carmichael number' },
];

const powmod = (b, e, m) => {
  let r = 1;
  b %= m;
  while (e > 0) {
    if (e & 1) r = (r * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
  }
  return r;
};

const fermat = (n, a) => powmod(a, n - 1, n) === 1;

function millerRabin(n, a) {
  let d = n - 1;
  let s = 0;
  while (d % 2 === 0) { d /= 2; s++; }
  let x = powmod(a, d, n);
  if (x === 1 || x === n - 1) return true;
  for (let i = 1; i < s; i++) {
    x = (x * x) % n;
    if (x === n - 1) return true;
  }
  return false;
}

export default function PrimalityDice() {
  const [n, setN] = useState(561);
  const [test, setTest] = useState('fermat');
  const [log, setLog] = useState([]);

  const reset = (nn, tt) => { setN(nn); setTest(tt); setLog([]); };
  const run = k => {
    const out = [];
    for (let i = 0; i < k; i++) {
      const a = 2 + Math.floor(Math.random() * (n - 3));
      out.push({ a, pass: test === 'fermat' ? fermat(n, a) : millerRabin(n, a) });
    }
    setLog(l => [...l, ...out]);
  };

  const caught = log.find(r => !r.pass);
  const passes = log.filter(r => r.pass).length;
  const info = NUMBERS.find(x => x.n === n);

  let status = <>Press <b>Run a round</b> to test {n} with a random base</>;
  let tone;
  if (caught) {
    tone = 'bad';
    status = <>Base {caught.a} is a <b>witness</b>: {n} is definitely composite. (It is {info.note}.)</>;
  } else if (passes) {
    status = test === 'mr'
      ? <><b>Probably prime</b> after {passes} round{passes === 1 ? '' : 's'}. A composite survives each round with chance at most ¼, so here at most {(0.25 ** passes).toExponential(1)}.</>
      : <><b>Probably prime</b>, says Fermat, after {passes} round{passes === 1 ? '' : 's'}. (It is {info.note}.)</>;
  }

  return (
    <Figure
      title="Is it prime? Ask a coin"
      tools={
        <>
          <Segmented label="Number" value={n} onChange={v => reset(v, test)} options={NUMBERS.map(x => ({ value: x.n, label: String(x.n) }))} />
          <Segmented label="Test" value={test} onChange={v => reset(n, v)} options={[{ value: 'fermat', label: 'Fermat' }, { value: 'mr', label: 'Miller–Rabin' }]} />
        </>
      }
      status={status}
      tone={tone}
    >
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        <Button primary onClick={() => run(1)}>Run a round</Button>
        <Button onClick={() => run(10)}>Run 10</Button>
        <Button onClick={() => setLog([])} disabled={!log.length}>Clear</Button>
      </div>
      <div className="az-fig-well" style={{ padding: 12, minHeight: 64, display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start' }}>
        {log.length === 0 && <span style={{ color: 'var(--fig-muted)', margin: 'auto' }}>No rounds yet</span>}
        {log.slice(-40).map((r, i) => (
          <span key={i} className="az-fig-token" data-bad={String(!r.pass)} title={r.pass ? 'passed' : 'witness of compositeness'}>
            a={r.a} {r.pass ? '✓' : '✗'}
          </span>
        ))}
      </div>
    </Figure>
  );
}
