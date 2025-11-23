/**
 * TypeScript models for USGS earthquake GeoJSON and the internal
 * domain representation used by the app.
 *
 * Keeping this in a dedicated module helps ensure consistent typing
 * across API, hooks, and UI components.
 */

export type UsgsEarthquakeFeature = {
  type: "Feature";
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    updated: number;
    tz: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number | null;
    gap: number | null;
    magType: string | null;
    type: string;
    title: string | null;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
};

export type UsgsEarthquakeResponse = {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: UsgsEarthquakeFeature[];
};

export type Earthquake = {
  id: string;
  magnitude: number | null;
  place: string;
  occurredAt: Date;
  latitude: number;
  longitude: number;
  depthKm: number;
};
