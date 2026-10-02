import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, Cpu } from 'lucide-react';
import { Figure, Note, Playback, Segmented, usePlayback } from './figure';

/* ── Machine ─────────────────────────────────────────────── */

const RULES = [
  { mode: 'Checking', read: '1', write: '1', next: 'Checking', dir: 'Right' },
  { mode: 'Checking', read: '_', write: '_', next: 'Accept', dir: 'Stay' },
  { mode: 'Checking', read: '0', write: '0', next: 'Reject', dir: 'Stay' },
];

const INPUTS = ['1101', '111', '11111'];
const VISIBLE = 7;
const GAP = 6;
const ELLIPSIS = 20;

const isHalted = s => s.mode === 'Accept' || s.mode === 'Reject';
const ruleFor = s => RULES.findIndex(r => r.mode === s.mode && r.read === (s.tape[s.head] ?? '_'));

function init(input) {
  return {
    tape: [...input, '_', '_', '_'],
    head: 0,
    mode: 'Checking',
    steps: 0,
    lastRule: null,
    history: [],
  };
}

function step(s) {
  if (isHalted(s)) return s;
  const ri = ruleFor(s);
  if (ri < 0) return { ...s, mode: 'Reject' };
  const rule = RULES[ri];
  const tape = [...s.tape];
  tape[s.head] = rule.write;
  let head = s.head;
  if (rule.dir === 'Right') head++;
  if (rule.dir === 'Left') head = Math.max(0, head - 1);
  if (head >= tape.length) tape.push('_');
  return {
    tape, head,
    mode: rule.next,
    steps: s.steps + 1,
    lastRule: ri,
    history: [...s.history, s],
  };
}

const back = s => (s.history.length ? s.history[s.history.length - 1] : s);

/* ── Component ───────────────────────────────────────────── */

export default function TuringMachine() {
  const [input, setInput] = useState(INPUTS[0]);
  const [s, set] = useState(() => init(INPUTS[0]));
  const [playing, togglePlay, stop] = usePlayback(s, set, step, isHalted, 650);
  const [cellWidth, setCellWidth] = useState(52);
  const ref = useRef(null);
  const done = isHalted(s);

  const measure = useCallback(() => {
    if (!ref.current) return;
    const available = ref.current.offsetWidth - 48 - (VISIBLE - 1) * GAP - ELLIPSIS * 2;
    setCellWidth(Math.max(28, Math.min(52, Math.floor(available / VISIBLE))));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);

  const load = value => {
    stop();
    setInput(value);
    set(init(value));
  };

  const start = Math.max(0, s.head - 3);
  const cells = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = start + i;
    return { idx, sym: s.tape[idx] ?? '_', active: idx === s.head, first: i === 0, last: i === VISIBLE - 1 };
  });

  const nextRule = done ? null : ruleFor(s);
  const highlight = done ? s.lastRule : nextRule;

  let message;
  let tone;
  if (s.mode === 'Accept') {
    message = <>The head reached a blank without ever seeing a 0. <em>Accept</em>: “{input}” contains only 1s.</>;
    tone = 'ok';
  } else if (s.mode === 'Reject') {
    message = <>The head read a 0. <em>Reject</em>: “{input}” is not made only of 1s.</>;
    tone = 'no';
  } else if (s.steps === 0) {
    message = <>The head starts on the first symbol in mode <em>Checking</em>. Step through it, or press Play.</>;
  } else {
    const r = RULES[s.lastRule];
    message = <>Read <em>{r.read}</em>, wrote <em>{r.write}</em>, moved {r.dir.toLowerCase()}, stayed in <em>{r.next}</em>.</>;
  }

  return (
    <Figure
      icon={Cpu}
      kicker="Turing machine"
      title="Accept only strings made of 1s"
      tools={
        <Segmented
          label="Input string"
          value={input}
          onChange={load}
          options={INPUTS.map(v => ({ value: v, label: v }))}
        />
      }
      caption="The highlighted rule is the one the machine will apply next. Every step is decided entirely by the current mode and the symbol under the head."
    >
      <div ref={ref} className="az-tape">
        <span className="az-tape__ellipsis">…</span>
        {cells.map(({ idx, sym, active, first, last }) => (
          <div className="az-tape__slot" key={idx} style={{ width: cellWidth }}>
            <div className="az-tape__head" data-on={String(active)}>
              <span className="az-tape__head-tag">Head</span>
              <ArrowDown size={14} strokeWidth={2.25} aria-hidden="true" />
            </div>
            <div
              className="az-tape__cell"
              data-on={String(active)}
              data-blank={String(sym === '_')}
              style={{
                width: cellWidth,
                marginLeft: first ? 0 : -1,
                borderRadius: first ? '8px 0 0 8px' : last ? '0 8px 8px 0' : 0,
              }}
            >
              {sym === '_' ? '␣' : sym}
            </div>
            <span className="az-tape__index">{idx}</span>
          </div>
        ))}
        <span className="az-tape__ellipsis">…</span>
      </div>

      <div className="az-tape__status">
        <div className="az-tape__status-item">
          <span className="az-viz-verdict__label">Mode</span>
          <span className="az-tape__mode-value" data-mode={s.mode}>{s.mode}</span>
        </div>
        <div className="az-tape__status-item">
          <span className="az-viz-verdict__label">Steps</span>
          <span className="az-tape__mode-value">{s.steps}</span>
        </div>
      </div>

      <div className="az-viz__stage">
        <table className="az-viz-table az-viz-table--rules">
          <thead>
            <tr><th>In mode</th><th>Reading</th><th>Write</th><th>Move</th><th>Next mode</th></tr>
          </thead>
          <tbody>
            {RULES.map((r, i) => (
              <tr key={i} data-active={String(i === highlight)}>
                <td>{r.mode}</td>
                <td>{r.read === '_' ? '␣ blank' : r.read}</td>
                <td>{r.write === '_' ? '␣' : r.write}</td>
                <td>{r.dir}</td>
                <td>{r.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Playback
        onReset={() => { stop(); set(init(input)); }}
        onBack={() => { stop(); set(back); }}
        canBack={s.history.length > 0}
        onStep={() => set(step)}
        playing={playing}
        onTogglePlay={togglePlay}
        done={done}
      />

      <Note tone={tone}>{message}</Note>
    </Figure>
  );
}
