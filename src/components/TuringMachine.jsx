import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';

const RULES = [
  { mode: 'Checking', read: '1', write: '1', next: 'Checking', dir: 'Right' },
  { mode: 'Checking', read: '_', write: '_', next: 'Accept', dir: 'Stay' },
  { mode: 'Checking', read: '0', write: '0', next: 'Reject', dir: 'Stay' },
];

const INIT_TAPE = ['1', '1', '0', '1', '_', '_', '_'];
const VISIBLE = 7;
const GAP = 6;
const ELLIPSIS = 20;

function init() {
  return {
    tape: [...INIT_TAPE],
    head: 0,
    mode: 'Checking',
    history: [],
    log: 'Press Step to begin.',
  };
}

function stepState(s) {
  if (s.mode === 'Accept' || s.mode === 'Reject') return s;
  const sym = s.tape[s.head] ?? '_';
  const rule = RULES.find(r => r.mode === s.mode && r.read === sym);
  if (!rule) return { ...s, log: 'No matching rule — halted.' };
  const tape = [...s.tape];
  tape[s.head] = rule.write;
  let head = s.head;
  if (rule.dir === 'Right') head++;
  if (rule.dir === 'Left') head = Math.max(0, head - 1);
  if (head >= tape.length) tape.push('_');
  return {
    tape, head,
    mode: rule.next,
    history: [...s.history, { tape: s.tape, head: s.head, mode: s.mode }],
    log: `Read "${rule.read}", wrote "${rule.write}", switched to ${rule.next}, moved ${rule.dir}.`,
  };
}

function undoState(s) {
  if (!s.history.length) return s;
  const p = s.history[s.history.length - 1];
  return {
    tape: [...p.tape], head: p.head, mode: p.mode,
    history: s.history.slice(0, -1),
    log: 'Stepped back one move.',
  };
}

export default function TuringMachine() {
  const [s, set] = useState(init);
  const [running, setRunning] = useState(false);
  const [cellWidth, setCellWidth] = useState(52);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const done = s.mode === 'Accept' || s.mode === 'Reject';

  const updateCellWidth = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const available = w - 48 - (VISIBLE - 1) * GAP - ELLIPSIS * 2;
    setCellWidth(Math.max(28, Math.min(52, Math.floor(available / VISIBLE))));
  }, []);

  useEffect(() => {
    updateCellWidth();
    const ro = new ResizeObserver(updateCellWidth);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateCellWidth]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    set(init());
  };

  const toggleRun = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
      return;
    }
    setRunning(true);
    intervalRef.current = setInterval(() => {
      set(prev => {
        if (prev.mode === 'Accept' || prev.mode === 'Reject') {
          clearInterval(intervalRef.current);
          setRunning(false);
          return prev;
        }
        return stepState(prev);
      });
    }, 650);
  };

  const start = Math.max(0, s.head - 3);
  const cells = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = start + i;
    return {
      idx,
      sym: s.tape[idx] ?? '_',
      active: idx === s.head,
      first: i === 0,
      last: i === VISIBLE - 1,
    };
  });

  const CONTROLS = [
    { label: 'Reset', onClick: reset, disabled: false, solid: false },
    { label: 'Back', onClick: () => set(undoState), disabled: !s.history.length, solid: false },
    { label: 'Step', onClick: () => set(stepState), disabled: done, solid: true },
    { label: running ? 'Pause' : 'Run', onClick: toggleRun, disabled: done, solid: false },
  ];

  return (
    <div className="az-viz" ref={containerRef}>
      <div className="az-viz__head">
        <span className="az-viz__label">Turing machine — accepts strings of only 1s</span>
      </div>

      <div className="az-viz__body">
        <div className="az-tape">
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
                style={{
                  width: cellWidth,
                  marginLeft: first ? 0 : -1,
                  borderRadius: first && last ? 8 : first ? '8px 0 0 8px' : last ? '0 8px 8px 0' : 0,
                }}
              >
                {sym === '_' ? '' : sym}
              </div>
            </div>
          ))}

          <span className="az-tape__ellipsis">…</span>
        </div>

        <div className="az-tape__mode">
          <span className="az-viz-verdict__label">Current mode</span>
          <span className="az-tape__mode-value" data-mode={s.mode}>{s.mode}</span>
        </div>

        <div className="az-viz-controls">
          {CONTROLS.map(({ label, onClick, disabled, solid }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              className={'az-viz-btn' + (solid ? ' az-viz-btn--solid' : '')}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="az-viz-hint" style={{ margin: 0 }}>{s.log}</p>
      </div>
    </div>
  );
}
