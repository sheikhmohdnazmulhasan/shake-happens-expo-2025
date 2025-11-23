/**
 * Central application configuration for Shake Happens.
 *
 * This module exposes a typed configuration object so the rest of the app
 * does not need to know about `expo-constants` or environment details.
 */
import Constants from "expo-constants";

type AppExtraConfig = {
  usgsApiBaseUrl: string;
  defaultMinMagnitude: number;
  defaultPollIntervalMs: number;
  mapDefaultLatitude: number;
  mapDefaultLongitude: number;
  mapDefaultZoomDelta: number;
  bangladeshBoundingBox: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
  notificationRegistrationUrl?: string;
  significantMagnitudeThreshold: number;
};

const DEFAULT_CONFIG: AppExtraConfig = {
  usgsApiBaseUrl: "https://earthquake.usgs.gov/fdsnws/event/1",
  // Include even very small earthquakes by default.
  defaultMinMagnitude: 0,
  defaultPollIntervalMs: 30_000,
  // Approximate center of Bangladesh.
  mapDefaultLatitude: 23.7,
  mapDefaultLongitude: 90.3,
  // Smaller delta to focus on Bangladesh region.
  mapDefaultZoomDelta: 5,
  // Rough bounding box for Bangladesh region for API filtering.
  bangladeshBoundingBox: {
    minLatitude: 20.5,
    maxLatitude: 26.7,
    minLongitude: 88.0,
    maxLongitude: 92.7,
  },
  significantMagnitudeThreshold: 4.5,
};

export const getAppConfig = (): AppExtraConfig => {
  const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppExtraConfig>;

  return {
    ...DEFAULT_CONFIG,
    ...extra,
  };
};
