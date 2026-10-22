"use client";

import { useState } from "react";
import IndiaMap, { type IndiaGeo } from "./IndiaMap";
import { REGIONS, colorFor, findRegion } from "@/lib/states";

const sortedRegions = [...REGIONS].sort((a, b) => a.name.localeCompare(b.name));

export default function LearnTab({ geo }: { geo: IndiaGeo }) {
  const [selected, setSelected] = useState<string | null>(null);
  const region = selected ? findRegion(selected) : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 items-start md:grid-cols-[1fr_260px]">
      {/* Map panel */}
      <section className="rounded-2xl border border-border bg-card p-3">
        <IndiaMap data={geo} selected={selected} onSelect={setSelected} />

        {/* Info strip below map */}
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-9 w-9 shrink-0 rounded-full border border-border"
            style={{ background: selected ? colorFor(selected) : undefined }}
          />
          <div className="min-w-0">
            <div className="font-bold text-tx">
              {region ? region.name : "Tap a region"}
            </div>
            <div className="text-sm text-muted">
              {region
                ? `${region.type} · Capital: ${region.capital}`
                : "Its capital will show here"}
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar: color palette */}
      <aside className="rounded-2xl border border-border bg-card p-3">
        <h2 className="mb-2 text-base font-bold text-tx">Color palette</h2>
        <ul className="m-0 max-h-[70vh] list-none overflow-y-auto p-0">
          {sortedRegions.map((r) => (
            <li
              key={r.name}
              onClick={() => setSelected(r.name)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm transition ${
                r.name === selected ? "bg-surface" : "hover:bg-surface"
              }`}
            >
              <i
                className="block h-4 w-4 shrink-0 rounded-full"
                style={{ background: colorFor(r.name) }}
              />
              {r.name}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
