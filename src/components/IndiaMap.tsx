"use client";

import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { colorFor } from "@/lib/states";

export type IndiaGeo = FeatureCollection<Geometry, { name: string }>;

type Props = {
  data: IndiaGeo;
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
};

const WIDTH = 700;
const HEIGHT = 760;

export default function IndiaMap({
  data,
  selected = null,
  onSelect,
  fillFor = colorFor,
  onDropName,
  labeled = [],
  outline = false,
}: Props) {
  // Work out each state's SVG outline and center point once.
  const shapes = useMemo(() => {
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], data);
    const makePath = geoPath(projection);
    return data.features.map((f) => ({
      name: f.properties.name,
      d: makePath(f) ?? "",
      center: makePath.centroid(f),
    }));
  }, [data]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={outline ? "map outline" : "map"}
      role="img"
      aria-label="Map of India"
    >
      {shapes.map((s) => (
        <path
          key={s.name}
          d={s.d}
          style={{ fill: fillFor(s.name) }}
          className={s.name === selected ? "sel" : ""}
          onClick={() => onSelect?.(s.name)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onDropName?.(s.name, e.dataTransfer.getData("text/plain"));
          }}
        >
          {!outline && <title>{s.name}</title>}
        </path>
      ))}
      {shapes
        .filter((s) => labeled.includes(s.name))
        .map((s) => (
          <text key={s.name} x={s.center[0]} y={s.center[1]} className="lbl">
            {s.name}
          </text>
        ))}
    </svg>
  );
}
