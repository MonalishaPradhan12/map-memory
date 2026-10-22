"use client";

import { useCallback, useEffect, useState } from "react";
import { REGIONS, type Region } from "@/lib/states";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { streakMessage } from "@/lib/feedback";
import { recordMistake } from "@/lib/progress";

const TOTAL = 10;
const LETTERS = ["A", "B", "C", "D"];
// Haryana and Punjab share Chandigarh, so they would make unfair questions.
const POOL = REGIONS.filter((r) => r.type === "State" && r.capital !== "Chandigarh");

type Mode = "toState" | "toCapital";
type Question = { region: string; prompt: string; answer: string; options: string[] };

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeQuiz(mode: Mode): Question[] {
  const value = (r: Region) => (mode === "toState" ? r.name : r.capital);
  return shuffle(POOL)
    .slice(0, TOTAL)
    .map((r) => {
      const answer = value(r);
      const wrong = shuffle(POOL.filter((o) => o !== r))
        .slice(0, 3)
        .map(value);
      return {
        region: r.name,
        prompt:
          mode === "toState"
            ? `${r.capital} is the capital of which state?`
            : `What is the capital of ${r.name}?`,
        answer,
        options: shuffle([answer, ...wrong]),
      };
    });
}

function resultMessage(score: number): { emoji: string; text: string } {
  if (score >= 9) return { emoji: "🏆", text: "Outstanding! You know your capitals." };
  if (score >= 7) return { emoji: "🎉", text: "Great job! Almost perfect." };
  if (score >= 4) return { emoji: "👍", text: "Good effort. Practice makes perfect." };
  return { emoji: "📚", text: "Keep going. You'll improve every round." };
}

export default function CapitalsTab() {
  const [mode, setMode] = useState<Mode>("toState");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);

  const start = useCallback(() => {
    setQuestions(makeQuiz(mode));
    setIndex(0);
    setChosen(null);
    setScore(0);
    setStreak(0); // a new round starts with no streak
  }, [mode]);

  // New quiz on load, and again whenever the mode changes.
  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("capitalsBest") ?? 0));
    } catch {
      /* storage not available: ignore */
    }
  }, []);

  function choose(option: string) {
    if (chosen) return;
    setChosen(option);

    if (option === questions[index].answer) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 2) {
        const m = streakMessage(newStreak);
        toast.success(m.title, { description: m.text, duration: 2500 });
      }
    } else {
      setStreak(0); // a wrong answer breaks the streak
      recordMistake("capital", questions[index].region);
    }
  }

  function next() {
    if (index + 1 === TOTAL) {
      if (score > best) {
        setBest(score);
        try {
          localStorage.setItem("capitalsBest", String(score));
        } catch {
          /* ignore */
        }
      }
      if (score >= 8) {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      }
    }
    setIndex((i) => i + 1);
    setChosen(null);
  }

  const segBase =
    "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition cursor-pointer";

  const modePills = (
    <div
      className="mb-4 flex gap-1 rounded-xl border border-border bg-surface p-1"
      role="group"
      aria-label="Quiz direction"
    >
      <button
        className={`${segBase} ${
          mode === "toState"
            ? "bg-primary text-on-primary shadow-sm"
            : "text-muted hover:text-tx"
        }`}
        aria-pressed={mode === "toState"}
        onClick={() => setMode("toState")}
      >
        Capital → State
      </button>
      <button
        className={`${segBase} ${
          mode === "toCapital"
            ? "bg-primary text-on-primary shadow-sm"
            : "text-muted hover:text-tx"
        }`}
        aria-pressed={mode === "toCapital"}
        onClick={() => setMode("toCapital")}
      >
        State → Capital
      </button>
    </div>
  );

  if (questions.length === 0) return null;

  /* Result screen */
  if (index >= TOTAL) {
    const r = resultMessage(score);
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5">
        {modePills}
        <div className="py-4 text-center">
          <div className="text-6xl" aria-hidden="true">
            {r.emoji}
          </div>
          <p className="mt-2 text-4xl font-extrabold text-tx">
            {score} / {TOTAL}
          </p>
          <p className="mt-1 font-semibold text-tx">{r.text}</p>
          <p className="mt-1 text-sm text-muted">
            Best score: {best} / {TOTAL}
          </p>
          <button
            className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition hover:bg-primary-dark"
            onClick={start}
          >
            Play again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const correct = chosen === q.answer;

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-5">
      {modePills}

      {/* Progress + streak */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <span
            className="block h-full bg-primary transition-[width] duration-300"
            style={{ width: `${(index / TOTAL) * 100}%` }}
          />
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-sm font-bold transition ${
            streak >= 2
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-surface text-muted"
          }`}
        >
          🔥 {streak}
        </span>
      </div>
      <p className="mt-2 text-center text-sm text-muted">
        Question {index + 1} of {TOTAL} · Score {score}
      </p>

      {/* Question */}
      <div
        key={index}
        className="my-4 animate-rise rounded-2xl border border-border bg-surface px-4 py-6 text-center"
      >
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
          {mode === "toState" ? "Find the state" : "Find the capital"}
        </span>
        <h2 className="mt-2 text-xl font-bold text-tx">{q.prompt}</h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          let cls =
            "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ";
          let keyCls =
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ";
          if (chosen) {
            if (opt === q.answer) {
              cls += "border-ok bg-ok-bg text-ok-tx";
              keyCls += "bg-ok text-white";
            } else if (opt === chosen) {
              cls += "border-bad bg-bad-bg text-bad-tx animate-shake";
              keyCls += "bg-bad text-white";
            } else {
              cls += "border-border bg-card text-tx opacity-60";
              keyCls += "bg-surface text-muted";
            }
          } else {
            cls += "border-border bg-card text-tx hover:border-primary";
            keyCls += "bg-surface text-muted";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)}>
              <span className={keyCls}>{LETTERS[i]}</span>
              <span className="flex-1">{opt}</span>
              {chosen && opt === q.answer && <span aria-hidden="true">✓</span>}
              {chosen && opt === chosen && opt !== q.answer && (
                <span aria-hidden="true">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {chosen && (
        <div
          className={`mt-4 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-semibold ${
            correct ? "bg-ok-bg text-ok-tx" : "bg-bad-bg text-bad-tx"
          }`}
        >
          <span>{correct ? "Correct! 🎉" : `Not quite. It's ${q.answer}.`}</span>
          <button
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-on-primary transition hover:bg-primary-dark"
            onClick={next}
          >
            {index + 1 === TOTAL ? "See result" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
