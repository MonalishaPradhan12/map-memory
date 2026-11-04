"use client";

import { useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { WorldGeo } from "@/data/world";
import { colorFor } from "@/lib/states";

type Props = {
  data: WorldGeo;
  selected?: string | null;
  onSelect?: (name: string) => void;
  // Which fill color each region gets (default: its fixed palette color)
  fillFor?: (name: string) => string;
  // Called when a name is dropped on a region
  onDropName?: (regionName: string, droppedName: string) => void;
  // Regions that should show their name written on the map
  labeled?: string[];
  // Draw dark outlines (used by the drag-and-drop tab)
  outline?: boolean;
  // Show the country name in a tooltip on hover (turn off in quiz screens)
  showHover?: boolean;
};

const WIDTH = 1000;
const HEIGHT = 520;

export default function WorldMap({
  data,
  selected = null,
  onSelect,
  fillFor = colorFor,
  onDropName,
  labeled = [],
  outline = false,
  showHover = true,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);

  // Work out each country's SVG outline and center point once.
  const shapes = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], data);
    const makePath = geoPath(projection);
    return data.features.map((f) => ({
      name: f.properties.name,
      d: makePath(f) ?? "",
      center: makePath.centroid(f),
    }));
  }, [data]);

  return (
    <div ref={wrapRef} className="relative" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={outline ? "map outline" : "map"}
        role="img"
        aria-label="World map"
      >
        {shapes.map((s) => (
          <path
            key={s.name}
            d={s.d}
            style={{ fill: fillFor(s.name) }}
            className={s.name === selected ? "sel" : ""}
            onClick={() => onSelect?.(s.name)}
            onMouseMove={(e) => {
              if (!showHover || !wrapRef.current) return;
              const box = wrapRef.current.getBoundingClientRect();
              setHover({
                name: s.name,
                x: e.clientX - box.left,
                y: e.clientY - box.top,
              });
            }}
            onMouseLeave={() => setHover(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onDropName?.(s.name, e.dataTransfer.getData("text/plain"));
            }}
          />
        ))}
        {shapes
          .filter((s) => labeled.includes(s.name))
          .map((s) => (
            <text key={s.name} x={s.center[0]} y={s.center[1]} className="lbl">
              {s.name}
            </text>
          ))}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1 text-sm font-semibold text-tx shadow-md"
          style={{
            left: hover.x,
            top: hover.y,
            transform: "translate(-50%, -140%)",
          }}
        >
          {hover.name}
        </div>
      )}
    </div>
  );
}
