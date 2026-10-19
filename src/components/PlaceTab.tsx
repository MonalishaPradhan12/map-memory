"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import IndiaMap, { type IndiaGeo } from "./IndiaMap";
import { REGIONS, colorFor } from "@/lib/states";
import { feedback } from "@/lib/feedback"; // NEW

export default function PlaceTab({ geo }: { geo: IndiaGeo }) {
  const [withUTs, setWithUTs] = useState(false);
  const [order, setOrder] = useState<string[]>([]); // names shown beside the map
  const [placed, setPlaced] = useState<string[]>([]); // names placed correctly
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<string | null>(null); // tap-to-place (phones)
  const [flash, setFlash] = useState<string | null>(null); // region that flashes red
  const [streak, setStreak] = useState(0); // NEW: correct placements in a row

  // The names you must place: 28 states, or 36 with union territories.
  const pool = useMemo(
    () => REGIONS.filter((r) => withUTs || r.type === "State").map((r) => r.name),
    [withUTs]
  );

  const reset = useCallback(() => {
    setOrder([...pool].sort(() => Math.random() - 0.5));
    setPlaced([]);
    setMistakes(0);
    setPicked(null);
    setStreak(0); // NEW
  }, [pool]);

  // Shuffle after the page loads (random order can't be made on the server).
  useEffect(() => {
    reset();
  }, [reset]);

  function attempt(regionName: string, name: string) {
    if (!name || !pool.includes(regionName) || placed.includes(regionName)) return;

    if (regionName === name) {
      const newStreak = streak + 1; // NEW
      setPlaced((p) => [...p, name]);
      setPicked(null);
      setStreak(newStreak); // NEW

      // NEW: last one gets the "finished" toast, others get the normal one
      if (placed.length + 1 === pool.length) feedback.finished(mistakes);
      else feedback.correct(name, newStreak);
    } else {
      setMistakes((m) => m + 1);
      setFlash(regionName);
      setTimeout(() => setFlash(null), 600);
      feedback.wrong(streak >= 2); // NEW
      setStreak(0); // NEW
    }
  }

  function fillFor(name: string): string {
    if (!pool.includes(name)) return "var(--bd)"; // not part of this round
    if (placed.includes(name)) return colorFor(name);
    if (flash === name) return "#f2a0a0";
    return "var(--card)";
  }

  const remaining = order.filter((n) => !placed.includes(n));
  const done = pool.length > 0 && placed.length === pool.length;

  return (
    <>
      <div className="toolbar">
        <label>
          <input type="checkbox" checked={withUTs} onChange={(e) => setWithUTs(e.target.checked)} />{" "}
          Include union territories
        </label>
        <span className="score">
          Placed {placed.length} / {pool.length} · Mistakes {mistakes}
        </span>
        <button className="btn" onClick={reset}>
          Restart
        </button>
      </div>

      <div className="grid place">
        <section className="card">
          <IndiaMap
            data={geo}
            outline
            fillFor={fillFor}
            labeled={placed}
            onDropName={attempt}
            onSelect={(regionName) => picked && attempt(regionName, picked)}
          />
          {done && (
            <p className="done">
              All placed! You made {mistakes} mistake{mistakes === 1 ? "" : "s"}. Press Restart to try again.
            </p>
          )}
        </section>

        <aside className="card">
          <h2>Drag a name onto its state</h2>
          <p className="hint">On a phone: tap a name, then tap the state.</p>
          <div className="chips">
            {remaining.map((n) => (
              <span
                key={n}
                draggable
                className={n === picked ? "chip on" : "chip"}
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