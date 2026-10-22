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
  const [hints, setHints] = useState(0);

  const shuffleDeck = useCallback(() => {
    setDeck([...ALL].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setHints(0);
  }, []);

  useEffect(() => {
    shuffleDeck();
  }, [shuffleDeck]);

  function go(step: number) {
    setIndex((i) => Math.min(Math.max(i + step, 0), deck.length - 1));
    setFlipped(false);
    setHints(0);
  }

  const name = deck[index];
  const region = findRegion(name);
  const feature = geo.features.find((f) => f.properties.name === name);
  if (!region || !feature) return null;

  const hintLines = [
    `It is a ${region.type === "State" ? "state" : "union territory"}.`,
    `Its name starts with "${region.name[0]}".`,
    `Its capital starts with "${region.capital[0]}".`,
  ];

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5">
      {/* Progress */}
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <span
          className="block h-full bg-primary transition-[width] duration-300"
          style={{ width: `${((index + 1) / deck.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-muted">
        Card {index + 1} of {deck.length}
      </p>

      {/* Flashcard */}
      <motion.div
        key={`${index}-${flipped}`}
        className="my-4 flex min-h-[360px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center"
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => setFlipped((f) => !f)}
      >
        {flipped ? (
          <>
            <StateShape feature={feature} fill={colorFor(name)} />
            <div className="mt-2 text-lg font-bold text-tx">{region.name}</div>
            <div className="text-sm text-muted">
              {region.type} · Capital: {region.capital}
            </div>
          </>
        ) : (
          <>
            <StateShape feature={feature} fill="var(--color-border)" />
            <div className="mt-2 text-lg font-semibold text-tx">
              Which state is this?
            </div>
            {hintLines.slice(0, hints).map((line) => (
              <div key={line} className="text-sm text-muted">
                {line}
              </div>
            ))}
            {hints < hintLines.length && (
              <button
                className="mt-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-tx transition hover:border-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setHints((h) => h + 1);
                }}
              >
                {hints === 0 ? "Hint" : "More hint"}
              </button>
            )}
            <div className="mt-1 text-xs text-muted">
              Tap the card to flip.
            </div>
          </>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-tx transition hover:border-primary disabled:opacity-40"
          onClick={() => go(-1)}
          disabled={index === 0}
        >
          Previous
        </button>
        <button
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-tx transition hover:border-primary"
          onClick={shuffleDeck}
        >
          Shuffle
        </button>
        <button
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-tx transition hover:border-primary disabled:opacity-40"
          onClick={() => go(1)}
          disabled={index === deck.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
