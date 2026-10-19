"use client";

import { useCallback, useEffect, useState } from "react";
import { REGIONS, type Region } from "@/lib/states";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { streakMessage } from "@/lib/feedback";

const TOTAL = 10;
const LETTERS = ["A", "B", "C", "D"];
// Haryana and Punjab share Chandigarh, so they would make unfair questions.
const POOL = REGIONS.filter((r) => r.type === "State" && r.capital !== "Chandigarh");

type Mode = "toState" | "toCapital";
type Question = { prompt: string; answer: string; options: string[] };

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
    setStreak(0); // fix: a new round starts with no streak
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

  const modePills = (
    <div className="seg" role="group" aria-label="Quiz direction">
      <button className={mode === "toState" ? "on" : ""} aria-pressed={mode === "toState"} onClick={() => setMode("toState")}>
        Capital → State
      </button>
      <button className={mode === "toCapital" ? "on" : ""} aria-pressed={mode === "toCapital"} onClick={() => setMode("toCapital")}>
        State → Capital
      </button>
    </div>
  );

  if (questions.length === 0) return null;

  // Result screen
  if (index >= TOTAL) {
    const r = resultMessage(score);
    return (
      <div className="card quiz">
        {modePills}
        <div className="finish">
          <div className="big-emoji">{r.emoji}</div>
          <p className="result">
            {score} / {TOTAL}
          </p>
          <p className="finish-text">{r.text}</p>
          <p className="hint">
            Best score: {best} / {TOTAL}
          </p>
          <button className="btn primary" onClick={start}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const correct = chosen === q.answer;

  return (
    <div className="card quiz">
      {modePills}

      <div className="topbar">
        <div className="progress grow">
          <span style={{ width: `${(index / TOTAL) * 100}%` }} />
        </div>
        <span className={streak >= 2 ? "streak-chip hot" : "streak-chip"}>🔥 {streak}</span>
      </div>
      <p className="stat">
        Question {index + 1} of {TOTAL} · Score {score}
      </p>

      <div className="qcard" key={index}>
        <span className="qlabel">{mode === "toState" ? "Find the state" : "Find the capital"}</span>
        <h2 className="qtext">{q.prompt}</h2>
      </div>

      <div className="opts">
        {q.options.map((opt, i) => {
          let cls = "opt";
          if (chosen) {
            if (opt === q.answer) cls += " right";
            else if (opt === chosen) cls += " wrong";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)}>
              <span className="key">{LETTERS[i]}</span>
              <span className="opt-text">{opt}</span>
              {chosen && opt === q.answer && <span className="mark">✓</span>}
              {chosen && opt === chosen && opt !== q.answer && <span className="mark">✗</span>}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className={correct ? "fb ok" : "fb bad"}>
          <span>{correct ? "Correct! 🎉" : `Not quite. It's ${q.answer}.`}</span>
          <button className="btn primary" onClick={next}>
            {index + 1 === TOTAL ? "See result" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}