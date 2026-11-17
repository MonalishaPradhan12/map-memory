"use client";

import { useEffect } from "react";

const ORIGINAL = "World Map Memory";
const ALERT = "1 new message";
const INTERVAL_MS = 500;

// Blinks the browser tab title between the app name and a "new message"
// text while the tab is in the background. Stops when the user returns.
export default function TitleBlink() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
      document.title = ORIGINAL;
    };

    const start = () => {
      if (timer) return;
      let showAlert = true;
      document.title = ALERT;
      timer = setInterval(() => {
        showAlert = !showAlert;
        document.title = showAlert ? ALERT : ORIGINAL;
      }, INTERVAL_MS);
    };

    const onVisibility = () => (document.hidden ? start() : stop());

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return null;
}