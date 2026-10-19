"use client";

import { useCallback, useEffect, useState } from "react";
import type { IndiaGeo } from "./IndiaMap";
import StateShape from "./StateShape";
import { REGIONS, colorFor, findRegion } from "@/lib/states";
import { motion } from "framer-motion";
const ALL = REGIONS.map((r) => r.name);

export default function FlashcardsTab({ geo }: { geo: IndiaGeo }) {
  const [deck, setDeck] = useState<string[]>(ALL);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hints, setHints] = useState(0); // how many hints are showing (0 to 3)

  const shuffleDeck = useCallback(() => {
    setDeck([...ALL].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setHints(0);
  }, []);

  // Shuffle after the page loads (random order can't be made on the server).
  useEffect(() => {
    shuffleDeck();
  }, [shuffleDeck]);

  function go(step: number) {
    setIndex((i) => Math.min(Math.max(i + step, 0), deck.length - 1));
    setFlipped(false);
    setHints(0); // new card, start with no hints
  }

  const name = deck[index];
  const region = findRegion(name);
  const feature = geo.features.find((f) => f.properties.name === name);
  if (!region || !feature) return null;

  // Each tap on "Hint" reveals one more clue, from easiest to biggest.
  const hintLines = [
    `It is a ${region.type === "State" ? "state" : "union territory"}.`,
    `Its name starts with "${region.name[0]}".`,
    `Its capital starts with "${region.capital[0]}".`,
  ];

  return (
    <div className="card quiz">
      <div className="progress">
        <span style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
      </div>
      <p className="stat">
        Card {index + 1} of {deck.length}
      </p>

      <motion.div
        key={`${index}-${flipped}`}
        className="flash"
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => setFlipped((f) => !f)}
      >
        {flipped ? (
          <>
            <StateShape feature={feature} fill={colorFor(name)} />
            <div className="name">{region.name}</div>
            <div className="cap">
              {region.type} · Capital: {region.capital}
            </div>
          </>
        ) : (
          <>
            <StateShape feature={feature} fill="var(--bd)" />
            <div className="ask">Which state is this?</div>
            {hintLines.slice(0, hints).map((line) => (
              <div key={line} className="cap">
                {line}
              </div>
            ))}
            {hints < hintLines.length && (
              <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation(); // don't flip the card
                  setHints((h) => h + 1);
                }}
              >
                {hints === 0 ? "Hint" : "More hint"}
              </button>
            )}
            <div className="cap">Tap the card to flip.</div>
          </>
        )}
      </motion.div>

      <div className="feedback">
        <button className="btn" onClick={() => go(-1)}>
          Previous
        </button>
        <button className="btn" onClick={shuffleDeck}>
          Shuffle
        </button>
        <button className="btn" onClick={() => go(1)}>
          Next
        </button>
      </div>
    </div>
  );
}