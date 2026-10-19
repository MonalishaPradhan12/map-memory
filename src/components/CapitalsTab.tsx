"use client";

import { useCallback, useEffect, useState } from "react";
import { REGIONS, type Region } from "@/lib/states";

const TOTAL = 10;
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

export default function CapitalsTab() {
  const [mode, setMode] = useState<Mode>("toState");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const start = useCallback(() => {
    setQuestions(makeQuiz(mode));
    setIndex(0);
    setChosen(null);
    setScore(0);
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
    if (option === questions[index].answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 === TOTAL && score > best) {
      setBest(score);
      try {
        localStorage.setItem("capitalsBest", String(score));
      } catch {
        /* ignore */
      }
    }
    setIndex((i) => i + 1);
    setChosen(null);
  }

  const modePills = (
    <div className="tabs2">
      <button className={mode === "toState" ? "tb on" : "tb"} onClick={() => setMode("toState")}>
        Capital → State
      </button>
      <button className={mode === "toCapital" ? "tb on" : "tb"} onClick={() => setMode("toCapital")}>
        State → Capital
      </button>
    </div>
  );

  if (questions.length === 0) return null;

  if (index >= TOTAL) {
    return (
      <div className="card quiz">
        {modePills}
        <h2>Quiz complete</h2>
        <p className="result">
          {score} / {TOTAL}
        </p>
        <p className="hint">
          Best score: {best} / {TOTAL}
        </p>
        <button className="btn" onClick={start}>
          Play again
        </button>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="card quiz">
      {modePills}
      <div className="progress" style={{ marginTop: 12 }}>
        <span style={{ width: `${(index / TOTAL) * 100}%` }} />
      </div>
      <p className="stat">
        Question {index + 1} of {TOTAL} · Score {score}
      </p>

      <h2 className="ask big">{q.prompt}</h2>

      <div className="answers">
        {q.options.map((opt) => {
          let cls = "ans";
          if (chosen) {
            if (opt === q.answer) cls += " right";
            else if (opt === chosen) cls += " wrong";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="feedback">
          <span>{chosen === q.answer ? "Correct!" : `Not quite. It's ${q.answer}.`}</span>
          <button className="btn" onClick={next}>
            {index + 1 === TOTAL ? "See result" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}