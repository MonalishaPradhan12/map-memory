import Script from "next/script";

/**
 * Loads the Google AdSense script globally.
 *
 * Usage: drop <AdSenseScript /> inside <body> in your root layout.tsx.
 *
 * ⚠️  Replace the placeholder below with your real AdSense publisher ID.
 *     You get it from https://www.google.com/adsense after approval.
 *     It looks like: ca-pub-1234567890123456
 */

// ──────────────────────────────────────────────────────────────
// ⬇️  PUT YOUR REAL PUBLISHER ID HERE
const ADSENSE_PUB_ID = "ca-pub-6341378947249316";
// ──────────────────────────────────────────────────────────────

export default function AdSenseScript() {
  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
