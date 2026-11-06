import React, { useEffect, useState } from 'react';
import { Figure } from './figure';

/* ── SHA-256 avalanche ──────────────────────────────────────
   Two inputs, two real SHA-256 hashes (Web Crypto, computed in
   the browser). Bits that differ between them are highlighted.
   A one-character change flips about half of the 256 bits. */

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)];
}
const hex = bytes => bytes.map(b => b.toString(16).padStart(2, '0')).join('');
const bits = bytes => bytes.flatMap(b => Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1));

function Input({ id, label, value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '78px 1fr', alignItems: 'center', gap: 10 }}>
      <label className="az-fig-label" htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={e => onChange(e.target.value)} spellCheck={false}
        style={{ font: 'inherit', fontSize: 14, padding: '7px 10px', color: 'var(--fig-ink)', background: 'var(--fig-well)',
          border: '1px solid var(--fig-line-strong)', borderRadius: 8, minWidth: 0 }} />
    </div>
  );
}

export default function HashAvalanche() {
  const [a, setA] = useState('password123');
  const [b, setB] = useState('password124');
  const [ha, setHa] = useState(null);
  const [hb, setHb] = useState(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    let live = true;
    if (typeof crypto === 'undefined' || !crypto.subtle) { setOk(false); return undefined; }
    Promise.all([sha256(a), sha256(b)]).then(([x, y]) => { if (live) { setHa(x); setHb(y); } }).catch(() => setOk(false));
    return () => { live = false; };
  }, [a, b]);

  const ba = ha ? bits(ha) : [];
  const bb = hb ? bits(hb) : [];
  const diff = ba.filter((v, i) => v !== bb[i]).length;

  return (
    <Figure
      title="SHA-256 fingerprints"
      status={!ok
        ? <>This browser doesn't allow hashing here (it needs a secure https page).</>
        : ha && hb
          ? (a === b ? <>Same input, same hash. Every time.</> : <><b>{diff}</b> of 256 bits differ ({Math.round((diff / 256) * 100)}%)</>)
          : <>Computing…</>}
    >
      <Input id="az-hash-a" label="Input A" value={a} onChange={setA} />
      <Input id="az-hash-b" label="Input B" value={b} onChange={setB} />
      {ha && hb && (
        <>
          <div className="az-fig-well" style={{ padding: 12, fontFamily: 'var(--ifm-font-family-monospace)', fontSize: 12, wordBreak: 'break-all', lineHeight: 1.6 }}>
            <div><span style={{ color: 'var(--fig-muted)' }}>A </span>{hex(ha)}</div>
            <div><span style={{ color: 'var(--fig-muted)' }}>B </span>{hex(hb)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(32, 1fr)', gap: 2 }} aria-label="Bits that differ between the two hashes">
            {ba.map((v, i) => (
              <span key={i} style={{ height: 10, borderRadius: 2, background: v !== bb[i] ? 'var(--fig-accent)' : 'var(--fig-line)' }} />
            ))}
          </div>
        </>
      )}
    </Figure>
  );
}
