import React, { useState } from 'react';
import { Figure, Segmented } from './figure';

/* ── Toy RSA with tiny primes ───────────────────────────────
   n = p·q is public, along with e. Decrypting needs d, and
   finding d needs p and q. With tiny numbers, factoring n by
   trial division is instant, which is the point to contrast. */

const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const powmod = (b, e, m) => { let r = 1; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; };
function inverse(e, phi) {
  let [r0, r1, s0, s1] = [phi, e, 0, 1];
  while (r1 !== 0) { const q = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
  return ((s0 % phi) + phi) % phi;
}
function trialDivision(n) {
  let steps = 0;
  for (let k = 2; k * k <= n; k++) { steps++; if (n % k === 0) return { factor: k, steps }; }
  return { factor: null, steps };
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
      <span style={{ color: 'var(--fig-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ? 'var(--fig-accent)' : 'var(--fig-ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

export default function RSAToy() {
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [m, setM] = useState(65);

  const same = p === q;
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const e = [3, 5, 7, 11, 13, 17, 19, 23].find(x => gcd(x, phi) === 1);
  const d = inverse(e, phi);
  const msg = Math.min(m, n - 1);
  const c = powmod(msg, e, n);
  const back = powmod(c, d, n);
  const attack = trialDivision(n);

  return (
    <Figure
      title="RSA with tiny numbers"
      tools={
        <>
          <Segmented label="p" value={p} onChange={setP} options={PRIMES.slice(-5).map(x => ({ value: x, label: `p = ${x}` }))} />
          <Segmented label="q" value={q} onChange={setQ} options={PRIMES.slice(-6, -1).map(x => ({ value: x, label: `q = ${x}` }))} />
        </>
      }
      status={same
        ? <>Pick two <b>different</b> primes.</>
        : <>Decrypted message: <b>{back}</b>. An attacker who factors n = {n} by trial division finds {attack.factor} after only <b>{attack.steps}</b> divisions.</>}
      tone={same ? 'bad' : 'good'}
    >
      <div className="az-rt__input">
        <label className="az-fig-label" htmlFor="az-rsa-m">Message m</label>
        <input id="az-rsa-m" className="az-fig-range" type="range" min={2} max={Math.min(500, n - 1)} value={msg} onChange={ev => setM(+ev.target.value)} />
        <span className="az-rt__n">{msg}</span>
      </div>
      {!same && (
        <div className="az-fig-pair">
          <div className="az-fig-pane">
            <div className="az-fig-pane__head"><span className="az-fig-label">Public</span><span className="az-fig-pane__meta">anyone can see</span></div>
            <div className="az-fig-well" style={{ padding: '8px 14px' }}>
              <Row label="n = p × q" value={n} />
              <Row label="e" value={e} />
              <Row label="ciphertext c = mᵉ mod n" value={c} accent />
            </div>
          </div>
          <div className="az-fig-pane">
            <div className="az-fig-pane__head"><span className="az-fig-label">Private</span><span className="az-fig-pane__meta">only the owner</span></div>
            <div className="az-fig-well" style={{ padding: '8px 14px' }}>
              <Row label="p, q" value={`${p}, ${q}`} />
              <Row label="d (needs p and q)" value={d} />
              <Row label="cᵈ mod n" value={back} accent />
            </div>
          </div>
        </div>
      )}
    </Figure>
  );
}
