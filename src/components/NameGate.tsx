"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function NameGate({
  initial = "",
  onSubmit,
}: {
  initial?: string;
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = value.trim();
    if (clean) onSubmit(clean);
  }

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 text-center"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <motion.div
          className="mb-1 text-5xl"
          animate={{ rotate: [0, -12, 12, -8, 0] }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          🗺️
        </motion.div>

        <h1 className="text-2xl font-bold text-tx">India Map Memory</h1>
        <p className="mt-1 text-muted">Learn India. One color at a time.</p>

        <label htmlFor="player-name" className="mb-2 mt-5 block font-semibold">
          What should we call you?
        </label>
        <input
          id="player-name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          autoFocus
          autoComplete="given-name"
          className="min-h-12 w-full rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-center text-base text-tx focus:border-primary focus:outline-none"
        />

        <motion.button
          type="submit"
          disabled={!value.trim()}
          whileTap={{ scale: 0.97 }}
          className="mb-2.5 mt-3.5 min-h-12 w-full rounded-lg bg-primary text-base font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start learning →
        </motion.button>
        <p className="text-sm text-muted">Your name stays on this device only.</p>
      </motion.form>
    </main>
  );
}