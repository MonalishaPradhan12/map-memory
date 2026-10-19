"use client";

import { useCallback, useEffect, useState } from "react";
import IndiaMap, { type IndiaGeo } from "./IndiaMap";
import { REGIONS, colorFor } from "@/lib/states";

const TOTAL = 10; // questions per round
const STATES = REGIONS.filter((r) => r.type === "State").map((r) => r.name);

type Question = { answer: string; options: string[] };

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

// 10 random states, each with 3 wrong choices + the right one, in random order.
function makeQuiz(): Question[] {
  return shuffle(STATES)
    .slice(0, TOTAL)
    .map((answer) => {
      const wrong = shuffle(STATES.filter((s) => s !== answer)).slice(0, 3);
      return { answer, options: shuffle([answer, ...wrong]) };
    });
}

export default function QuizTab({ geo }: { geo: IndiaGeo }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0); // current question (TOTAL = finished)
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const start = useCallback(() => {
    setQuestions(makeQuiz());
    setIndex(0);
    setChosen(null);
    setScore(0);
  }, []);

  // Make the quiz after the page loads, and read the saved best score.
  useEffect(() => {
    start();
    try {
      setBest(Number(localStorage.getItem("quizBest") ?? 0));
    } catch {
      /* storage not available: ignore */
    }
  }, [start]);

  function choose(option: string) {
    if (chosen) return; // already answered
    setChosen(option);
    if (option === questions[index].answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 === TOTAL && score > best) {
      setBest(score);
      try {
        localStorage.setItem("quizBest", String(score));
      } catch {
        /* ignore */
      }
    }
    setIndex((i) => i + 1);
    setChosen(null);
  }

  if (questions.length === 0) return null;

  // Finished screen
  if (index >= TOTAL) {
    return (
      <div className="card quiz">
        <h2>Quiz complete</h2>
        <p className="result">
          {score} / {TOTAL}
        </p>
        <p className="hint">Best score: {best} / {TOTAL}</p>
        <button className="btn" onClick={start}>
          Play again
        </button>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="card quiz">
      <div className="progress">
        <span style={{ width: `${(index / TOTAL) * 100}%` }} />
      </div>
      <p className="stat">
        Question {index + 1} of {TOTAL} · Score {score}
      </p>

      <IndiaMap
        data={geo}
        outline
        fillFor={(name) => (name === q.answer ? colorFor(name) : "var(--bd)")}
        labeled={chosen ? [q.answer] : []}
      />

      <h2 className="ask">Which state is this?</h2>

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
