import { toast } from "sonner";
import confetti from "canvas-confetti";
import { findRegion } from "@/lib/states";

// Same id means a new toast replaces the old one, so they never pile up.
const ID = "game-feedback";

// Friendly text for a streak of correct answers in a row.
export function streakMessage(streak: number): { title: string; text: string } {
  if (streak === 2) return { title: "🔥 2 in a row!", text: "Nice start, keep it going!" };
  if (streak === 3) return { title: "⚡ 3 in a row!", text: "You're getting the hang of it." };
  if (streak === 4) return { title: "🌟 4 in a row!", text: "Your memory is on fire!" };
  if (streak === 5) return { title: "🏆 5 in a row!", text: "Amazing! You really know your map." };
  return { title: `🚀 ${streak} in a row!`, text: "Unstoppable! Keep going!" };
}

export const feedback = {
  // A name was placed on the right state.
  correct(name: string, streak: number) {
    if (streak >= 2) {
      const m = streakMessage(streak);
      toast.success(m.title, { id: ID, description: `${name} ✓ ${m.text}`, duration: 2200 });
      return;
    }
    const capital = findRegion(name)?.capital;
    toast.success(`${name} ✓`, {
      id: ID,
      description: capital ? `Capital: ${capital}` : undefined,
      duration: 1800,
    });
  },

  // A name was dropped on the wrong state. It doesn't reveal the answer.
  wrong(streakEnded: boolean) {
    toast.error("Not quite. Try another state.", {
      id: ID,
      description: streakEnded ? "Streak ended. Start a new one!" : undefined,
      duration: 1800,
    });
  },

  // Every name is placed.
  finished(mistakes: number) {
    toast.success("All placed! 🎉", {
      id: ID,
      description:
        mistakes === 0
          ? "Perfect, no mistakes!"
          : `You made ${mistakes} mistake${mistakes === 1 ? "" : "s"}.`,
      duration: 4000,
    });
    if (mistakes <= 3) confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  },
};