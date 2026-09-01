import React, { useState } from 'react';
import { Figure, Segmented, svgButton } from './figure';

/* ── A Boolean circuit, evaluated live ──────────────────────
   Click an input to flip it. Wires carrying 1 use the accent.
   Size = number of gates. Depth = longest input-to-output path. */

const CIRCUITS = {
  xor: {
    label: 'XOR',
    inputs: ['x', 'y'],
    gates: [
      { id: 'g1', op: 'OR', in: ['x', 'y'], col: 1, row: 0 },
      { id: 'g2', op: 'AND', in: ['x', 'y'], col: 1, row: 1 },
      { id: 'g3', op: 'NOT', in: ['g2'], col: 2, row: 1 },
      { id: 'g4', op: 'AND', in: ['g1', 'g3'], col: 3, row: 0.5 },
    ],
    out: 'g4',
    text: 'Output is 1 when exactly one input is 1',
  },
  maj: {
    label: 'Majority',
    inputs: ['x', 'y', 'z'],
    gates: [
      { id: 'a', op: 'AND', in: ['x', 'y'], col: 1, row: 0 },
      { id: 'b', op: 'AND', in: ['x', 'z'], col: 1, row: 1 },
      { id: 'c', op: 'AND', in: ['y', 'z'], col: 1, row: 2 },
      { id: 'd', op: 'OR', in: ['a', 'b'], col: 2, row: 0.5 },
      { id: 'e', op: 'OR', in: ['d', 'c'], col: 3, row: 1.25 },
    ],
    out: 'e',
    text: 'Output is 1 when at least two inputs are 1',
  },
};

const OPS = { AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: a => 1 - a };
const W = 520;
const COLW = 125;
const ROWH = 84;
const X0 = 50;
const Y0 = 50;

function evaluate(c, inputs) {
  const v = { ...inputs };
  c.gates.forEach(g => { v[g.id] = OPS[g.op](...g.in.map(i => v[i])); });
  return v;
}
function depth(c) {
  const d = Object.fromEntries(c.inputs.map(i => [i, 0]));
  c.gates.forEach(g => { d[g.id] = 1 + Math.max(...g.in.map(i => d[i])); });
  return d[c.out];
}

export default function CircuitEval() {
  const [name, setName] = useState('xor');
  const [inp, setInp] = useState({ x: 1, y: 0, z: 1 });
  const c = CIRCUITS[name];
  const v = evaluate(c, inp);

  const pos = {};
  const rows = c.inputs.length;
  c.inputs.forEach((id, i) => { pos[id] = { x: X0, y: Y0 + i * ROWH }; });
  c.gates.forEach(g => { pos[g.id] = { x: X0 + g.col * COLW, y: Y0 + g.row * ROWH }; });
  const H = Y0 * 2 + (Math.max(rows, 2) - 1) * ROWH;

  return (
    <Figure
      title="A Boolean circuit"
      tools={<Segmented label="Circuit" value={name} onChange={setName}
        options={Object.entries(CIRCUITS).map(([value, k]) => ({ value, label: k.label }))} />}
      status={<>{c.text}. Output: <b>{v[c.out]}</b> · size {c.gates.length} gates · depth {depth(c)}</>}
      tone={v[c.out] ? 'good' : undefined}
    >
      <div className="az-fig-well">
        <svg viewBox={`0 0 ${W} ${H}`} className="az-fig-svg" role="group" aria-label={`${c.label} circuit`}>
          {c.gates.flatMap(g => g.in.map(src => {
            const a = pos[src];
            const b = pos[g.id];
            const on = v[src] === 1;
            const mx = (a.x + b.x) / 2;
            return (
              <path key={`${src}-${g.id}`} d={`M${a.x + 20},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x - 26},${b.y}`} fill="none"
                stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on ? 2.25 : 1.25} />
            );
          }))}
          <line x1={pos[c.out].x + 26} y1={pos[c.out].y} x2={W - 20} y2={pos[c.out].y}
            stroke={v[c.out] ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={v[c.out] ? 2.25 : 1.25} />
          <text x={W - 22} y={pos[c.out].y - 10} textAnchor="end" fontSize="11" fill="var(--fig-muted)">out = {v[c.out]}</text>

          {c.inputs.map(id => {
            const p = pos[id];
            const on = inp[id] === 1;
            return (
              <g key={id} {...svgButton(() => setInp(s => ({ ...s, [id]: 1 - s[id] })), `Input ${id} is ${inp[id]}`, on)}>
                <rect className="az-fig-node" x={p.x - 20} y={p.y - 16} width={40} height={32} rx={8}
                  fill={on ? 'var(--fig-accent)' : 'var(--fig-bg)'} fillOpacity={on ? 0.16 : 1}
                  stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={1.5} />
                <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13"
                  fill={on ? 'var(--fig-accent)' : 'var(--fig-ink)'}>{id}={inp[id]}</text>
              </g>
            );
          })}
          {c.gates.map(g => {
            const p = pos[g.id];
            const on = v[g.id] === 1;
            return (
              <g key={g.id}>
                <rect x={p.x - 26} y={p.y - 16} width={52} height={32} rx={8} fill="var(--fig-bg)"
                  stroke={on ? 'var(--fig-accent)' : 'var(--fig-line-strong)'} strokeWidth={on ? 1.75 : 1.25} />
                <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="600"
                  fill={on ? 'var(--fig-accent)' : 'var(--fig-muted)'}>{g.op}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
