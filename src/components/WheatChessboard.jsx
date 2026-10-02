import React, { useState } from 'react';
import { Wheat } from 'lucide-react';
import { Figure, Note, Stat, Stats } from './figure';

/* ── The chessboard story (Post 6) ─────────────────────────
   Square k holds 2^(k−1) grains; squares 1..k hold 2^k − 1.
   BigInt keeps every value exact up to square 64. */

const GRAIN_GRAMS = 0.04;          // a typical wheat grain weighs ~40 mg
const WORLD_HARVEST_TONNES = 790e6; // world wheat harvest per year, roughly

const grainsOn = k => 2n ** BigInt(k - 1);
const totalTo = k => 2n ** BigInt(k) - 1n;
const fmt = n => n.toLocaleString('en-US');
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[+d]).join('');

function sci(n) {
  const s = n.toString();
  if (s.length <= 6) return fmt(n);
  return `${s[0]}.${s.slice(1, 3)} × 10${sup(s.length - 1)}`;
}

function weight(grains) {
  const grams = Number(grains) * GRAIN_GRAMS;
  if (grams < 1000) return `${grams.toFixed(grams < 10 ? 2 : 0)} g`;
  const kg = grams / 1000;
  if (kg < 1000) return `${kg.toFixed(kg < 10 ? 1 : 0)} kg`;
  const t = kg / 1000;
  if (t < 1e6) return `${fmt(Math.round(t))} tonnes`;
  return `${(t / 1e9).toPrecision(3)} billion tonnes`;
}

function harvestYears(grains) {
  const tonnes = (Number(grains) * GRAIN_GRAMS) / 1e6;
  return tonnes / WORLD_HARVEST_TONNES;
}

export default function WheatChessboard() {
  const [k, setK] = useState(20);
  const [hover, setHover] = useState(null);
  const shown = hover ?? k;

  const years = harvestYears(totalTo(shown));
  let note;
  if (shown <= 20) {
    note = <>Up to square {shown} the total is about {weight(totalTo(shown))} of wheat. Still comfortable. This is the part where exponential growth feels ordinary.</>;
  } else if (years < 1) {
    note = <>By square {shown} the pile weighs {weight(totalTo(shown))}. That is {(years * 100).toPrecision(2)}% of the whole world’s yearly wheat harvest.</>;
  } else {
    note = <>By square {shown} the pile weighs {weight(totalTo(shown))}: about <em>{years < 10 ? years.toFixed(1) : fmt(Math.round(years))} years</em> of the entire world’s wheat harvest. All from doubling a single grain {shown - 1} times.</>;
  }

  return (
    <Figure
      icon={Wheat}
      kicker="Exponential growth"
      title="The wheat and chessboard problem"
      caption="Hover or click a square. Each square doubles the one before it. Weights assume ~40 mg per grain and a world harvest of ~790 million tonnes a year."
    >
      <div className="az-board-wrap">
        <div className="az-board" role="grid" aria-label="Chessboard, squares 1 to 64" onMouseLeave={() => setHover(null)}>
          {Array.from({ length: 64 }, (_, i) => {
            const sq = i + 1;
            const filled = sq <= shown;
            const level = filled ? 0.12 + 0.88 * (sq / 64) : 0;
            return (
              <button
                key={sq}
                type="button"
                role="gridcell"
                aria-label={`Square ${sq}: ${sci(grainsOn(sq))} grains`}
                aria-selected={sq === k}
                className="az-board__sq"
                data-dark={String((Math.floor(i / 8) + i) % 2 === 1)}
                data-current={String(sq === shown)}
                data-filled={String(filled)}
                style={{ '--fill': level }}
                onMouseEnter={() => setHover(sq)}
                onFocus={() => setHover(sq)}
                onBlur={() => setHover(null)}
                onClick={() => setK(sq)}
              >
                {sq}
              </button>
            );
          })}
        </div>

        <div className="az-board__readout">
          <Stats cols={1}>
            <Stat value={`#${shown}`} label="Square" tone="plain" />
            <Stat value={sci(grainsOn(shown))} label={`Grains on this square, 2${sup(shown - 1)}`} />
            <Stat value={sci(totalTo(shown))} label={`Running total, 2${sup(shown)} − 1`} />
            <Stat value={weight(totalTo(shown))} label="Weight of the whole pile" tone={years >= 1 ? 'no' : 'plain'} />
          </Stats>
        </div>
      </div>

      <Note tone={years >= 1 ? 'no' : undefined}>{note}</Note>
    </Figure>
  );
}
