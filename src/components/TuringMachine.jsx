import React, { useState } from 'react';
import { Figure, Playback, Segmented, usePlayback } from './figure';

/* ── Machine: accept strings made only of 1s ─────────────── */

const RULES = [
  { mode: 'Checking', read: '1', write: '1', move: 'Right', next: 'Checking' },
  { mode: 'Checking', read: '_', write: '_', move: 'Stay', next: 'Accept' },
  { mode: 'Checking', read: '0', write: '0', move: 'Stay', next: 'Reject' },
];

const INPUTS = ['1101', '111', '11111'];
const WINDOW = 8;

const halted = s => s.mode !== 'Checking';
const ruleIndex = s => RULES.findIndex(r => r.mode === s.mode && r.read === (s.tape[s.head] ?? '_'));

const init = input => ({ input, tape: [...input, '_', '_', '_', '_'], head: 0, mode: 'Checking', steps: 0, prev: null });

function step(s) {
  if (halted(s)) return s;
  const i = ruleIndex(s);
  if (i < 0) return { ...s, mode: 'Reject', prev: s };
  const r = RULES[i];
  const tape = [...s.tape];
  tape[s.head] = r.write;
  const head = r.move === 'Right' ? s.head + 1 : s.head;
  if (head >= tape.length) tape.push('_');
  return { ...s, tape, head, mode: r.next, steps: s.steps + 1, prev: s };
}

const show = sym => (sym === '_' ? '' : sym);

export default function TuringMachine() {
  const [s, set] = useState(() => init(INPUTS[0]));
  const [playing, toggle, stop] = usePlayback(s, set, step, halted, 650);

  const load = input => { stop(); set(init(input)); };
  const start = Math.max(0, Math.min(s.head - 2, s.tape.length - WINDOW));
  const next = halted(s) ? -1 : ruleIndex(s);

  let status = <>Mode <b>{s.mode}</b> · step {s.steps}</>;
  let tone;
  if (s.mode === 'Accept') { status = <><b>Accepted</b> after {s.steps} steps</>; tone = 'good'; }
  if (s.mode === 'Reject') { status = <><b>Rejected</b> after {s.steps} steps: found a 0</>; tone = 'bad'; }

  return (
    <Figure
      title="Turing machine"
      tools={<Segmented label="Input" value={s.input} onChange={load} options={INPUTS.map(v => ({ value: v, label: v }))} />}
      status={status}
      tone={tone}
    >
      <div className="az-tm">
        {Array.from({ length: WINDOW }, (_, i) => {
          const idx = start + i;
          const on = idx === s.head;
          return (
            <div key={idx} className="az-tm__slot">
              <span className="az-tm__head" data-on={String(on)} aria-hidden="true" />
              <span className="az-tm__cell" data-on={String(on)}>{show(s.tape[idx] ?? '_')}</span>
            </div>
          );
        })}
      </div>

      <div className="az-fig-well">
        <table className="az-fig-table">
          <thead>
            <tr><th>Mode</th><th>Read</th><th>Write</th><th>Move</th><th>Next</th></tr>
          </thead>
          <tbody>
            {RULES.map((r, i) => (
              <tr key={i} data-on={String(i === next)}>
                <td>{r.mode}</td>
                <td>{r.read === '_' ? 'blank' : r.read}</td>
                <td>{r.write === '_' ? 'blank' : r.write}</td>
                <td>{r.move}</td>
                <td>{r.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Playback
        onReset={() => load(s.input)}
        onBack={() => { stop(); set(prev => prev.prev ?? prev); }}
        canBack={!!s.prev}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={toggle}
        done={halted(s)}
      />
    </Figure>
  );
}
