import React, { useState } from 'react';
import { ListOrdered, Shuffle } from 'lucide-react';
import { Button, Figure, Note, Playback, Stat, Stats, usePlayback } from './figure';

/* ── Algorithm: linear search for the maximum (Post 2) ─────
   Each state is one executed line of the pseudocode, so the
   figure steps exactly as the written algorithm does. */

const START = [3, 7, 1, 9, 4];

const CODE = [
  { n: '1', text: 'max ← L[0]' },
  { n: '2', text: 'for each x in L, from L[1]:' },
  { n: 'a', text: '    if x > max: max ← x', indent: true },
  { n: '3', text: 'return max' },
];

function init(list) {
  return { list, line: null, i: null, max: null, maxAt: null, comparisons: 0, updated: false, done: false, history: [] };
}

function step(s) {
  if (s.done) return s;
  const base = { ...s, history: [...s.history, s], updated: false };
  if (s.line === null) return { ...base, line: 0, i: 0, max: s.list[0], maxAt: 0 };
  if (s.line === 0 || s.line === 2) {
    const i = s.i + 1;
    return i < s.list.length ? { ...base, line: 1, i } : { ...base, line: 3, i: null, done: true };
  }
  // line 1 → evaluate the comparison on line a
  const x = s.list[s.i];
  const bigger = x > s.max;
  return { ...base, line: 2, max: bigger ? x : s.max, maxAt: bigger ? s.i : s.maxAt, comparisons: s.comparisons + 1, updated: bigger };
}

const back = s => (s.history.length ? s.history[s.history.length - 1] : s);
const isDone = s => s.done;

function shuffled() {
  const n = 5 + Math.floor(Math.random() * 3);
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 20));
}

export default function AlgorithmTrace() {
  const [s, set] = useState(() => init(START));
  const [playing, togglePlay, stop] = usePlayback(s, set, step, isDone, 800);

  const load = list => { stop(); set(init(list)); };

  let note;
  let tone;
  if (s.line === null) {
    note = <>The input is <em>L = [{s.list.join(', ')}]</em>, so n = {s.list.length}. Press Step to run the algorithm one line at a time.</>;
  } else if (s.line === 0) {
    note = <>Line 1: assume the first element is the largest. <em>max ← {s.max}</em>.</>;
  } else if (s.line === 1) {
    note = <>Line 2: look at the next element, <em>x = L[{s.i}] = {s.list[s.i]}</em>.</>;
  } else if (s.line === 2) {
    const x = s.list[s.i];
    note = s.updated
      ? <>Is {x} &gt; {back(s).max}? Yes, so <em>max ← {x}</em>.</>
      : <>Is {x} &gt; {s.max}? No. max stays <em>{s.max}</em>.</>;
  } else {
    tone = 'ok';
    note = <>Every element has been looked at exactly once. <em>Return {s.max}</em>. That took {s.comparisons} comparisons for n = {s.list.length}: one fewer than n, whatever the list.</>;
  }

  return (
    <Figure
      icon={ListOrdered}
      kicker="Algorithm"
      title="Linear search for the maximum"
      tools={<Button icon={Shuffle} onClick={() => load(shuffled())}>New list</Button>}
      caption="The same four lines handle any list. That generality, plus being finite and unambiguous, is what makes it an algorithm."
    >
      <div className="az-trace">
        <div className="az-trace__array" role="list" aria-label="The list L">
          {s.list.map((v, i) => {
            let state = 'idle';
            if (i === s.maxAt) state = i === s.i ? 'both' : 'max';
            else if (i === s.i) state = 'current';
            else if (s.done || (s.i !== null && i < s.i)) state = 'seen';
            return (
              <div key={i} className="az-trace__cell" data-state={state} role="listitem">
                <span className="az-trace__value">{v}</span>
                <span className="az-trace__index">L[{i}]</span>
              </div>
            );
          })}
        </div>

        <div className="az-trace__code" aria-label="Pseudocode">
          {CODE.map((c, i) => (
            <div key={c.n} className="az-trace__line" data-active={String(s.line === i)} data-indent={String(!!c.indent)}>
              <span className="az-trace__ln">{c.n}</span>
              <code>{c.text.trim()}</code>
            </div>
          ))}
        </div>
      </div>

      <Stats cols={3}>
        <Stat value={s.max ?? '–'} label="max" />
        <Stat value={s.i === null ? (s.done ? 'done' : '–') : s.list[s.i]} label="x (current)" tone="plain" />
        <Stat value={s.comparisons} label="Comparisons" tone="plain" />
      </Stats>

      <Playback
        onReset={() => load(s.list)}
        onBack={() => { stop(); set(back); }}
        canBack={s.history.length > 0}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={togglePlay}
        done={s.done}
      />

      <Note tone={tone}>{note}</Note>
    </Figure>
  );
}
