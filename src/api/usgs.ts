/**
 * USGS Earthquake Catalog API integration.
 *
 * This module is responsible for making HTTP requests to the USGS API
 * and mapping the external GeoJSON response into the internal Earthquake model.
 */
import { getAppConfig } from "../config/appConfig";
import type {
  Earthquake,
  UsgsEarthquakeFeature,
  UsgsEarthquakeResponse,
} from "../models/earthquakes";
import { logError } from "../utils/logger";

const USGS_REQUEST_FAILED_MESSAGE =
  "Failed to load earthquake data. Please try again.";
const UNKNOWN_LOCATION_LABEL = "Unknown location";

type FetchEarthquakesArgs = {
  minMagnitude?: number;
  limit?: number;
  startTimeIso?: string;
  endTimeIso?: string;
};

const mapFeatureToEarthquake = (feature: UsgsEarthquakeFeature): Earthquake => {
  const [longitude, latitude, depthKm] = feature.geometry.coordinates;

  return {
    id: feature.id,
    magnitude: feature.properties.mag,
    place: feature.properties.title ?? UNKNOWN_LOCATION_LABEL,
    occurredAt: new Date(feature.properties.time),
    latitude,
    longitude,
    depthKm,
  };
};

export const fetchEarthquakes = async ({
  minMagnitude,
  limit = 200,
  startTimeIso,
  endTimeIso,
}: FetchEarthquakesArgs = {}): Promise<Earthquake[]> => {
  const { usgsApiBaseUrl, defaultMinMagnitude } = getAppConfig();

  const params = new URLSearchParams({
    format: "geojson",
    orderby: "time",
    limit: String(limit),
    minmagnitude: String(minMagnitude ?? defaultMinMagnitude),
  });

  if (startTimeIso) {
    params.append("starttime", startTimeIso);
  }

  if (endTimeIso) {
    params.append("endtime", endTimeIso);
  }

  const url = `${usgsApiBaseUrl}/query?${params.toString()}`;

  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    logError("Network error fetching earthquakes", error);
    throw new Error(USGS_REQUEST_FAILED_MESSAGE);
  }

  if (!response.ok) {
    logError("USGS API returned non-200 response", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(USGS_REQUEST_FAILED_MESSAGE);
  }

  let json: UsgsEarthquakeResponse;

  try {
    json = (await response.json()) as UsgsEarthquakeResponse;
  } catch (error) {
    logError("Failed to parse USGS GeoJSON", error);
    throw new Error(USGS_REQUEST_FAILED_MESSAGE);
  }

  return json.features.map(mapFeatureToEarthquake);
};
