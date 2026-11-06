import React, { useState } from 'react';
import { Figure } from './figure';

/* ── Arithmetization: logic as a polynomial ─────────────────
   AND → multiply, NOT x → 1 − x, OR → 1 − (1 − x)(1 − y).
   On 0/1 inputs the polynomial agrees with the formula; it
   also has values everywhere else, which is the whole point. */

const P = (x, y, z) => (1 - (1 - x) * (1 - y)) * (1 - z);
const bool = v => v === 0 || v === 1;

function Slider({ name, value, onChange }) {
  return (
    <div className="az-rt__input" style={{ gridTemplateColumns: '24px 1fr 40px' }}>
      <label className="az-fig-label" htmlFor={`az-ar-${name}`} style={{ textTransform: 'none', fontSize: 14 }}>{name}</label>
      <input id={`az-ar-${name}`} className="az-fig-range" type="range" min={0} max={5} value={value} onChange={e => onChange(+e.target.value)} />
      <span className="az-rt__n">{value}</span>
    </div>
  );
}

export default function Arithmetization() {
  const [x, setX] = useState(1);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  const v = P(x, y, z);
  const allBool = bool(x) && bool(y) && bool(z);
  const truth = ((x === 1 || y === 1) && z === 0);

  return (
    <Figure
      title="Turning logic into arithmetic"
      status={allBool
        ? <>Inputs are 0 or 1: the polynomial gives <b>{v}</b>, and the formula is <b>{truth ? 'true' : 'false'}</b>. They agree.</>
        : <>Inputs outside 0 and 1: the formula has no meaning here, but the polynomial still gives <b>{v}</b>.</>}
      tone={allBool ? 'good' : undefined}
    >
      <div className="az-fig-formula" style={{ fontSize: 14 }}>(x ∨ y) ∧ ¬z</div>
      <div className="az-fig-formula" style={{ fontSize: 14 }}>P(x, y, z) = (1 − (1 − x)(1 − y)) · (1 − z)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Slider name="x" value={x} onChange={setX} />
        <Slider name="y" value={y} onChange={setY} />
        <Slider name="z" value={z} onChange={setZ} />
      </div>
      <div className="az-fig-well" style={{ padding: 14, textAlign: 'center' }}>
        <span className="az-fig-label">P({x}, {y}, {z}) = </span>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--fig-accent)' }}>{v}</span>
      </div>
    </Figure>
  );
}
