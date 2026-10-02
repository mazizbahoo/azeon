import React, { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { Button, Figure, Playback, usePlayback } from './figure';

/* ── Linear search for the maximum, one line at a time ───── */

const START = [3, 7, 1, 9, 4];
const CODE = [
  { n: '1', text: 'max ← L[0]' },
  { n: '2', text: 'for each x in L, from L[1]:' },
  { n: 'a', text: 'if x > max: max ← x', indent: true },
  { n: '3', text: 'return max' },
];

const init = list => ({ list, line: null, i: null, maxAt: null, prev: null });
const isDone = s => s.line === 3;
const max = s => (s.maxAt === null ? null : s.list[s.maxAt]);

function step(s) {
  if (isDone(s)) return s;
  const base = { ...s, prev: s };
  if (s.line === null) return { ...base, line: 0, i: 0, maxAt: 0 };
  if (s.line === 1) return { ...base, line: 2, maxAt: s.list[s.i] > max(s) ? s.i : s.maxAt };
  const i = s.i + 1;
  return i < s.list.length ? { ...base, line: 1, i } : { ...base, line: 3, i: null };
}

const randomList = () => Array.from({ length: 5 + Math.floor(Math.random() * 3) }, () => 1 + Math.floor(Math.random() * 20));

export default function AlgorithmTrace() {
  const [s, set] = useState(() => init(START));
  const [playing, toggle, stop] = usePlayback(s, set, step, isDone, 800);
  const load = list => { stop(); set(init(list)); };

  let status = <>L = [{s.list.join(', ')}]</>;
  if (s.line === 0) status = <>max = <b>{max(s)}</b></>;
  if (s.line === 1) status = <>x = L[{s.i}] = <b>{s.list[s.i]}</b> · max = {max(s)}</>;
  if (s.line === 2) status = <>Is {s.list[s.i]} &gt; {max(s.prev)}? {s.maxAt === s.i ? <>Yes, max = <b>{max(s)}</b></> : <>No, max stays <b>{max(s)}</b></>}</>;
  if (isDone(s)) status = <>Returns <b>{max(s)}</b></>;

  return (
    <Figure
      title="Find the largest number"
      tools={<Button icon={Shuffle} onClick={() => load(randomList())}>New list</Button>}
      status={status}
      tone={isDone(s) ? 'good' : undefined}
    >
      <div className="az-trace">
        <div className="az-trace__list">
          {s.list.map((v, i) => (
            <div key={i} className="az-trace__item">
              <span className="az-fig-token az-trace__value" data-on={String(i === s.maxAt)}
                data-current={String(i === s.i)} data-dim={String(s.i !== null && i < s.i && i !== s.maxAt)}>
                {v}
              </span>
              <span className="az-trace__index">{i === s.i ? 'x' : `L[${i}]`}</span>
            </div>
          ))}
        </div>

        <div className="az-fig-well az-trace__code">
          {CODE.map((c, i) => (
            <div key={c.n} className="az-trace__line" data-on={String(s.line === i)} data-indent={String(!!c.indent)}>
              <span className="az-trace__ln">{c.n}</span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      <Playback
        onReset={() => load(s.list)}
        onBack={() => { stop(); set(p => p.prev ?? p); }}
        canBack={!!s.prev}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={toggle}
        done={isDone(s)}
      />
    </Figure>
  );
}
