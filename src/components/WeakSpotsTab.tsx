"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import IndiaMap, { type IndiaGeo } from "./IndiaMap";
import { REGIONS, colorFor, findRegion } from "@/lib/states";
import {
  clearWeak,
  parseWeakKey,
  recordCorrect,
  recordMistake,
  useWeak,
  type Kind,
  type Weak,
} from "@/lib/progress";

const ROUND = 10;

type Question = { kind: Kind; region: string; answer: string; options: string[] };

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildRound(weak: Weak): Question[] {
  // Weakest first; random order among equals.
  const keys = shuffle(Object.keys(weak)).sort((a, b) => weak[b] - weak[a]);
  const questions: Question[] = [];

  for (const key of keys.slice(0, ROUND)) {
    const parsed = parseWeakKey(key);
    const region = parsed && findRegion(parsed.name);
    if (!parsed || !region) continue;

    if (parsed.kind === "map") {
      const wrong = shuffle(REGIONS.filter((r) => r.name !== region.name))
        .slice(0, 3)
        .map((r) => r.name);
      questions.push({
        kind: "map",
        region: region.name,
        answer: region.name,
        options: shuffle([region.name, ...wrong]),
      });
    } else {
      const capitals = [...new Set(REGIONS.map((r) => r.capital))].filter(
        (c) => c !== region.capital
      );
      questions.push({
        kind: "capital",
        region: region.name,
        answer: region.capital,
        options: shuffle([region.capital, ...shuffle(capitals).slice(0, 3)]),
      });
    }
  }
  return shuffle(questions);
}

const btn =
  "rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-tx transition hover:border-primary";
const btnPrimary =
  "rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition hover:bg-primary-dark";

export default function WeakSpotsTab({ geo }: { geo: IndiaGeo }) {
  const weak = useWeak();
  const [round, setRound] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  const items = Object.entries(weak)
    .map(([key, count]) => ({ key, count, parsed: parseWeakKey(key) }))
    .filter((i) => i.parsed)
    .sort((a, b) => b.count - a.count);

  function startRound() {
    const q = buildRound(weak);
    if (q.length === 0) return;
    setConfirmClear(false);
    setRound(q);
    setIndex(0);
    setChosen(null);
    setScore(0);
    setMastered(0);
  }

  function choose(option: string) {
    if (!round || chosen) return;
    const q = round[index];
    setChosen(option);
    if (option === q.answer) {
      setScore((s) => s + 1);
      if (recordCorrect(q.kind, q.region)) setMastered((m) => m + 1);
    } else {
      recordMistake(q.kind, q.region);
    }
  }

  function next() {
    if (!round) return;
    if (index + 1 === round.length && score === round.length) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }
    setIndex((i) => i + 1);
    setChosen(null);
  }

  /* ── Overview ── */
  if (!round) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-tx">Weak spots</h2>
        <p className="mt-1 text-sm text-muted">
          Everything you got wrong in the other tabs lands here. Answer an item
          correctly a few times and it leaves the list.
        </p>

        {items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-5xl" aria-hidden="true">
              🎉
            </div>
            <p className="mt-2 font-semibold text-tx">No weak spots yet</p>
            <p className="mt-1 text-sm text-muted">
              Play Place the States, Quiz or Capitals, and mistakes will show up here.
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-4 max-h-[50vh] list-none divide-y divide-border overflow-y-auto p-0">
              {items.map(({ key, count, parsed }) => (
                <li key={key} className="flex items-center gap-3 py-2 text-sm">
                  <i
                    className="block h-4 w-4 shrink-0 rounded-full"
                    style={{ background: colorFor(parsed!.name) }}
                  />
                  <span className="flex-1 font-medium text-tx">{parsed!.name}</span>
                  <span className="text-xs text-muted">
                    {parsed!.kind === "map" ? "📍 Locate" : "🏛️ Capital"}
                  </span>
                  <span className="w-8 text-right text-xs font-bold text-bad">
                    {count}×
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className={btnPrimary} onClick={startRound}>
                Practice my weak spots ({Math.min(items.length, ROUND)})
              </button>
              <button className={btn} onClick={() => setConfirmClear(true)}>
                Clear list
              </button>
            </div>
          </>
        )}

        {confirmClear && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setConfirmClear(false)}
            onKeyDown={(e) => e.key === "Escape" && setConfirmClear(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-title"
              className="w-full max-w-sm animate-rise rounded-2xl border border-border bg-card p-6 text-center shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl" aria-hidden="true">
                🗑️
              </div>
              <h3 id="clear-title" className="mt-2 text-lg font-bold text-tx">
                Clear weak spots?
              </h3>
              <p className="mt-1 text-sm text-muted">
                This removes all {items.length} items from your list. You can&apos;t
                undo this.
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  autoFocus
                  className={`${btn} flex-1`}
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-lg bg-bad px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                  onClick={() => {
                    clearWeak();
                    setConfirmClear(false);
                  }}
                >
                  Yes, clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Result ── */
  if (index >= round.length) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 text-center">
        <h2 className="mb-2 text-lg font-bold text-tx">Practice complete</h2>
        <p className="text-4xl font-extrabold text-tx">
          {score} / {round.length}
        </p>
        <p className="mt-2 text-sm text-muted">
          {mastered > 0
            ? `${mastered} item${mastered === 1 ? "" : "s"} mastered and removed from your list.`
            : "Keep practicing: answer an item correctly a few times to clear it."}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {items.length > 0 && (
            <button className={btnPrimary} onClick={startRound}>
              Practice again
            </button>
          )}
          <button className={btn} onClick={() => setRound(null)}>
            Back to list
          </button>
        </div>
      </div>
    );
  }

  /* ── Question ── */
  const q = round[index];
  const correct = chosen === q.answer;

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5">
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <span
          className="block h-full bg-primary transition-[width] duration-300"
          style={{ width: `${(index / round.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-muted">
        Weak spot {index + 1} of {round.length} · Score {score}
      </p>

      {q.kind === "map" ? (
        <>
          <IndiaMap
            data={geo}
            outline
            fillFor={(name) => (name === q.answer ? colorFor(name) : "var(--color-border)")}
            labeled={chosen ? [q.answer] : []}
          />
          <h2 className="my-3 text-center text-lg font-semibold text-tx">
            Which state is this?
          </h2>
        </>
      ) : (
        <div
          key={index}
          className="my-4 animate-rise rounded-2xl border border-border bg-surface px-4 py-6 text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
            Find the capital
          </span>
          <h2 className="mt-2 text-xl font-bold text-tx">
            What is the capital of {q.region}?
          </h2>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((opt) => {
          let cls =
            "min-h-[48px] cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition ";
          if (chosen) {
            if (opt === q.answer) cls += "border-ok bg-ok-bg text-ok-tx";
            else if (opt === chosen) cls += "border-bad bg-bad-bg text-bad-tx animate-shake";
            else cls += "border-border bg-card text-tx opacity-60";
          } else {
            cls += "border-border bg-card text-tx hover:border-primary";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div
          className={`mt-4 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-semibold ${
            correct ? "bg-ok-bg text-ok-tx" : "bg-bad-bg text-bad-tx"
          }`}
        >
          <span>{correct ? "Correct!" : `Not quite. It's ${q.answer}.`}</span>
          <button className={btnPrimary} onClick={next}>
            {index + 1 === round.length ? "See result" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}