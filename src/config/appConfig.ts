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
};

const DEFAULT_CONFIG: AppExtraConfig = {
  usgsApiBaseUrl: "https://earthquake.usgs.gov/fdsnws/event/1",
  defaultMinMagnitude: 3,
  defaultPollIntervalMs: 30_000,
  mapDefaultLatitude: 0,
  mapDefaultLongitude: 0,
  mapDefaultZoomDelta: 60,
};

export const getAppConfig = (): AppExtraConfig => {
  const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppExtraConfig>;

  return {
    ...DEFAULT_CONFIG,
    ...extra,
  };
};
