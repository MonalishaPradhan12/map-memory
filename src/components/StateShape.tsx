"use client";

import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { IndiaGeo } from "./IndiaMap";

type Feature = IndiaGeo["features"][number];

export default function StateShape({ feature, fill }: { feature: Feature; fill: string }) {
  const d = useMemo(() => {
    // Zoom so this one state fills the square, with 20px padding.
    const projection = geoMercator().fitExtent(
      [
        [20, 20],
        [280, 280],
      ],
      feature
    );
    return geoPath(projection)(feature) ?? "";
  }, [feature]);

  return (
    <svg viewBox="0 0 300 300" className="shape" role="img" aria-label="Shape of a state">
      <path d={d} style={{ fill }} />
    </svg>
  );
}