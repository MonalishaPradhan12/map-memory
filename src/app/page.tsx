"use client";

import { useState } from "react";
import type { IndiaGeo } from "@/components/IndiaMap";
import LearnTab from "@/components/LearnTab";
import PlaceTab from "@/components/PlaceTab";
import QuizTab from "@/components/QuizTab";
import rawGeo from "@/data/india-states.json";
import FlashcardsTab from "@/components/FlashcardsTab";
import CapitalsTab from "@/components/CapitalsTab";

const geo = rawGeo as unknown as IndiaGeo;
type Tab = "learn" | "place" | "quiz" | "flash" | "capitals";

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn (Color Mode)" },
  { id: "place", label: "Place the States" },
  { id: "quiz", label: "Quiz" },
  { id: "flash", label: "Flashcards" },
  { id: "capitals", label: "Capitals" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("learn");

  return (
    <main className="wrap">
      <h1>India Map Memory</h1>
      <p className="sub">Learn with colors, then test yourself.</p>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            className={tab === t.id ? "tab on" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "learn" && <LearnTab geo={geo} />}
      {tab === "place" && <PlaceTab geo={geo} />}
      {tab === "quiz" && <QuizTab geo={geo} />}
      {tab === "flash" && <FlashcardsTab geo={geo} />}
      {tab === "capitals" && <CapitalsTab />}
     <footer className="footer">
  <div className="footer-brand">India Map Memory</div>
  <p>Learn India. One color at a time.</p>
  <p className="footer-note">
    Map is for learning only. Boundaries are approximate.
  </p>
</footer>
    </main>
  );
}
