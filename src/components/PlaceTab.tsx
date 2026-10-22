"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import IndiaMap, { type IndiaGeo } from "./IndiaMap";
import { REGIONS, colorFor } from "@/lib/states";
import { feedback } from "@/lib/feedback";
import { readNumber, recordMistake, writeNumber } from "@/lib/progress";

export default function PlaceTab({ geo }: { geo: IndiaGeo }) {
  const [withUTs, setWithUTs] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const bestKey = withUTs ? "placeBestUT" : "placeBest";

  useEffect(() => {
    setBest(readNumber(bestKey));
  }, [bestKey]);

  const pool = useMemo(
    () => REGIONS.filter((r) => withUTs || r.type === "State").map((r) => r.name),
    [withUTs]
  );

  const reset = useCallback(() => {
    setOrder([...pool].sort(() => Math.random() - 0.5));
    setPlaced([]);
    setMistakes(0);
    setPicked(null);
    setStreak(0);
  }, [pool]);

  useEffect(() => {
    reset();
  }, [reset]);

  function attempt(regionName: string, name: string) {
    if (!name || !pool.includes(regionName) || placed.includes(regionName)) return;

    if (regionName === name) {
      const newStreak = streak + 1;
      setPlaced((p) => [...p, name]);
      setPicked(null);
      setStreak(newStreak);

      if (placed.length + 1 === pool.length) {
        feedback.finished(mistakes);
        // Best = fewest mistakes.
        if (best === null || mistakes < best) {
          setBest(mistakes);
          writeNumber(bestKey, mistakes);
        }
      } else {
        feedback.correct(name, newStreak);
      }
    } else {
      setMistakes((m) => m + 1);
      recordMistake("map", name);
      setFlash(regionName);
      setTimeout(() => setFlash(null), 600);
      feedback.wrong(streak >= 2);
      setStreak(0);
    }
  }

  function fillFor(name: string): string {
    if (!pool.includes(name)) return "var(--color-border)";
    if (placed.includes(name)) return colorFor(name);
    if (flash === name) return "#f2a0a0";
    return "var(--color-card)";
  }

  const remaining = order.filter((n) => !placed.includes(n));
  const done = pool.length > 0 && placed.length === pool.length;

  return (
    <>
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={withUTs}
            onChange={(e) => setWithUTs(e.target.checked)}
            className="accent-primary"
          />
          Include union territories
        </label>
        <span className="font-semibold text-tx">
          Placed {placed.length} / {pool.length} · Mistakes {mistakes}
          {best !== null && <span className="font-normal text-muted"> · Best {best}</span>}
        </span>
        <button
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-tx transition hover:border-primary"
          onClick={reset}
        >
          Restart
        </button>
      </div>

      {/* Grid: map + chips */}
      <div className="grid grid-cols-1 gap-4 items-start md:grid-cols-[1fr_260px]">
        <section className="rounded-2xl border border-border bg-card p-3">
          <IndiaMap
            data={geo}
            outline
            fillFor={fillFor}
            labeled={placed}
            onDropName={attempt}
            onSelect={(regionName) => picked && attempt(regionName, picked)}
          />
          {done && (
            <p className="mt-3 font-bold text-ok">
              All placed! You made {mistakes} mistake{mistakes === 1 ? "" : "s"}.
              Press Restart to try again.
            </p>
          )}
        </section>

        <aside className="rounded-2xl border border-border bg-card p-3 md:order-none order-first">
          <h2 className="mb-1 text-base font-bold text-tx">
            Drag a name onto its state
          </h2>
          <p className="mb-2 text-xs text-muted">
            On a phone: tap a name, then tap the state.
          </p>
          <div className="flex max-h-[70vh] flex-wrap gap-2 overflow-y-auto">
            {remaining.map((n) => (
              <span
                key={n}
                draggable
                className={`cursor-grab select-none rounded-lg border px-2.5 py-1.5 text-sm transition ${
                  n === picked
                    ? "border-primary ring-2 ring-primary/30 bg-surface"
                    : "border-border bg-surface hover:border-primary"
                }`}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", n)}
                onClick={() => setPicked(n === picked ? null : n)}
              >
                {n}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
