"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { IndiaGeo } from "@/components/IndiaMap";
import LearnTab from "@/components/LearnTab";
import PlaceTab from "@/components/PlaceTab";
import QuizTab from "@/components/QuizTab";
import FlashcardsTab from "@/components/FlashcardsTab";
import CapitalsTab from "@/components/CapitalsTab";
import ThemeToggle from "@/components/ThemeToggle";
import WeakSpotsTab from "@/components/WeakSpotsTab";
import { getSavedName, saveName, useWeak } from "@/lib/progress";
import rawGeo from "@/data/india-states.json";

const geo = rawGeo as unknown as IndiaGeo;

type Tab = "learn" | "place" | "quiz" | "capitals" | "flash" | "weak";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "learn", label: "Learn", icon: "🎨" },
  { id: "place", label: "Place the States", icon: "📍" },
  { id: "quiz", label: "Quiz", icon: "🧠" },
  { id: "capitals", label: "Capitals", icon: "🏛️" },
  { id: "flash", label: "Flashcards", icon: "📚" },
  { id: "weak", label: "Weak Spots", icon: "🎯" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("learn");
  const [loaded, setLoaded] = useState(false);
  const weakCount = Object.keys(useWeak()).length;

  // Restore the saved name so the user skips the welcome screen.
  useEffect(() => {
    const saved = getSavedName();
    if (saved) {
      setName(saved);
      setUserName(saved);
      setStarted(true);
    }
    setLoaded(true);
  }, []);

  const handleStart = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setUserName(trimmedName);
    saveName(trimmedName);
    setStarted(true);
  };

  // Wait for the saved name to load (avoids a flash of the welcome screen).
  if (!loaded) return <main className="min-h-dvh bg-surface" />;

  /* ── Welcome / Name Entry Screen ── */
  if (!started) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-surface px-4 py-8">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg sm:p-10">
          <div className="mb-4 text-6xl" aria-hidden="true">
            🗺️
          </div>

          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Welcome to
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-tx sm:text-4xl">
            India Map Memory
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Explore Indian states, learn their locations, and discover
            their capitals through fun activities.
          </p>

          <form onSubmit={handleStart} className="mt-8 space-y-4 text-left">
            <label
              htmlFor="userName"
              className="block text-sm font-semibold text-tx"
            >
              What should we call you?
            </label>

            <input
              id="userName"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoComplete="given-name"
              required
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-tx outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-5 py-3.5 font-bold text-on-primary shadow-md transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98]"
            >
              Start Learning
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </button>
          </form>

          <p className="mt-6 text-xs text-muted">
            Learn India. One color at a time.
          </p>
        </div>
      </main>
    );
  }

  /* ── Main Application ── */
  return (
    <main className="mx-auto max-w-[1000px] px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-tx md:text-3xl">
            India Map Memory
          </h1>
          <p className="mt-1 text-sm text-muted">
            Welcome, <span className="font-semibold text-primary">{userName}</span>! Ready to explore India?
          </p>
        </div>

        <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => {
            setName(userName); // prefill with the current name
            setTab("learn");
            setStarted(false);
          }}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-tx transition hover:border-primary hover:text-primary"
        >
          Change Name
        </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Learning activities"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="tab-content"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-card text-tx hover:border-primary"
            }`}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
            {t.id === "weak" && weakCount > 0 && (
              <span className="rounded-full bg-bad px-1.5 text-xs font-bold text-white">
                {weakCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div id="tab-content" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "learn" && <LearnTab geo={geo} />}
        {tab === "place" && <PlaceTab geo={geo} />}
        {tab === "quiz" && <QuizTab geo={geo} />}
        {tab === "capitals" && <CapitalsTab />}
        {tab === "flash" && <FlashcardsTab geo={geo} />}
        {tab === "weak" && <WeakSpotsTab geo={geo} />}
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-border pt-5 pb-2 text-center text-sm text-muted">
        <div className="mb-1 inline-block border-b-2 border-primary font-bold text-tx">
          India Map Memory
        </div>
        <p>Learn India. One color at a time.</p>
        <p className="mt-1 text-xs opacity-80">
          Map is for learning only. Boundaries are approximate.
        </p>
      </footer>
    </main>
  );
}
