"use client";

import { useEffect, useRef } from "react";

/**
 * Google AdSense ad unit.
 *
 * HOW TO USE:
 * 1. Replace `YOUR-PUB-ID` in layout.tsx with your real AdSense publisher ID
 *    (looks like `ca-pub-1234567890123456`).
 * 2. Replace the `data-ad-slot` value below with the slot ID Google gives you
 *    when you create an ad unit in your AdSense dashboard.
 * 3. Set `adFormat` and `adLayout` as needed for the ad type.
 *
 * Ad formats:
 *   - "auto"        → responsive, fills container width (most common)
 *   - "rectangle"   → 300×250 or similar
 *   - "horizontal"  → wide banner
 *   - "vertical"    → sidebar skyscraper
 *   - "fluid"       → in-feed / in-article native ad
 */

interface AdBannerProps {
  /** The ad slot ID from your AdSense dashboard (e.g. "1234567890") */
  adSlot: string;
  /** Ad format. Default "auto" (responsive). */
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  /** Set true for responsive auto-sized ads. Default true. */
  fullWidth?: boolean;
  /** Optional Tailwind / CSS class for the wrapper div. */
  className?: string;
}

export default function AdBanner({
  adSlot,
  adFormat = "auto",
  fullWidth = true,
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Push the ad only once per mount
    if (pushed.current) return;
    try {
      const adsbygoogle = (window as unknown as Record<string, unknown[]>)
        .adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet or blocked — that's fine
    }
  }, []);

  return (
    <div
      className={`overflow-hidden text-center ${className}`}
      aria-hidden="true"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="" /* filled by the global script's ?client= param */
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth ? "true" : "false"}
      />
    </div>
  );
}
