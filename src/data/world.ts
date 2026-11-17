import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import topo from "world-atlas/countries-50m.json";

export type WorldGeo = FeatureCollection<Geometry, { name: string }>;

const t = topo as unknown as Topology;
const all = feature(t, t.objects.countries) as unknown as WorldGeo;

export const worldGeo: WorldGeo = {
  ...all,
  // Antarctica takes a lot of space and isn't useful for a quiz
  features: all.features.filter((f) => f.properties.name !== "Antarctica"),
};