import { useSyncExternalStore } from "react";

/* ── Keys ────────────────────────────────────────────────── */
const NAME_KEY = "imm:name";
const WEAK_KEY = "imm:weak";
const MAX_WEIGHT = 5;

/* ── Saved name ──────────────────────────────────────────── */
export function getSavedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* storage not available: ignore */
  }
}

/* ── Saved numbers (best scores) ─────────────────────────── */
export function readNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

/* ── Weak spots (mistake list) ───────────────────────────── */
// "map"     = the user could not locate / name the state on the map
// "capital" = the user did not know the capital
export type Kind = "map" | "capital";
export type Weak = Record<string, number>; // "kind:Region name" -> how weak (1..5)

const EMPTY: Weak = {};
let cache: Weak | null = null;
const listeners = new Set<() => void>();

export const weakKey = (kind: Kind, name: string) => `${kind}:${name}`;

export function parseWeakKey(key: string): { kind: Kind; name: string } | null {
  const i = key.indexOf(":");
  if (i < 0) return null;
  const kind = key.slice(0, i);
  if (kind !== "map" && kind !== "capital") return null;
  return { kind, name: key.slice(i + 1) };
}

function load(): Weak {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(WEAK_KEY) ?? "{}");
    cache = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    cache = {};
  }
  return cache!;
}

function commit(next: Weak) {
  cache = next;
  try {
    localStorage.setItem(WEAK_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** The user got this wrong: add it to (or strengthen it in) the list. */
export function recordMistake(kind: Kind, name: string) {
  const w = load();
  const k = weakKey(kind, name);
  commit({ ...w, [k]: Math.min((w[k] ?? 0) + 1, MAX_WEIGHT) });
}

/** The user got a weak item right in practice. Returns true when it is mastered (removed). */
export function recordCorrect(kind: Kind, name: string): boolean {
  const w = load();
  const k = weakKey(kind, name);
  if (!(k in w)) return false;
  const left = w[k] - 1;
  const next = { ...w };
  if (left <= 0) delete next[k];
  else next[k] = left;
  commit(next);
  return left <= 0;
}

export function clearWeak() {
  commit({});
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** React hook: the current weak-spot list, kept in sync across tabs. */
export function useWeak(): Weak {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
