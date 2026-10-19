"use client";

import { useState } from "react";
import IndiaMap, { type IndiaGeo } from "./IndiaMap";
import { REGIONS, colorFor, findRegion } from "@/lib/states";

const sortedRegions = [...REGIONS].sort((a, b) => a.name.localeCompare(b.name));

export default function LearnTab({ geo }: { geo: IndiaGeo }) {
  const [selected, setSelected] = useState<string | null>(null);
  const region = selected ? findRegion(selected) : undefined;

  return (
    <div className="grid">
      <section className="card">
        <IndiaMap data={geo} selected={selected} onSelect={setSelected} />
        <div className="info">
          <div className="swatch" style={{ background: selected ? colorFor(selected) : undefined }} />
          <div>
            <div className="name">{region ? region.name : "Tap a region"}</div>
            <div className="cap">
              {region ? `${region.type} · Capital: ${region.capital}` : "Its capital will show here"}
            </div>
          </div>
        </div>
      </section>

      <aside className="card">
        <h2>Color palette</h2>
        <ul className="list">
          {sortedRegions.map((r) => (
            <li
              key={r.name}
              className={r.name === selected ? "sel" : ""}
              onClick={() => setSelected(r.name)}
            >
              <i style={{ background: colorFor(r.name) }} />
              {r.name}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
