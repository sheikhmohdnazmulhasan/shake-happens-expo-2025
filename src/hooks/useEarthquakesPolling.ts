/**
 * Polling hook for fetching earthquakes from the USGS API.
 *
 * This hook encapsulates:
 * - fetching earthquakes for a given region (bounding box),
 * - refetching when parameters change,
 * - controlled loading and error state for the UI.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEarthquakes } from "../api/usgs";
import { getAppConfig } from "../config/appConfig";
import type { Earthquake } from "../models/earthquakes";
import { logError, logInfo } from "../utils/logger";

const REFRESH_FAILED_MESSAGE =
  "Unable to refresh earthquakes. Please check your connection.";
const POLLING_START_MESSAGE = "Refetching earthquakes (useEarthquakesPolling)";
const DEFAULT_LOOKBACK_DAYS = 365;

type UseEarthquakesPollingArgs = {
  pollIntervalMs?: number;
  minMagnitude?: number;
  boundingBox?: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
};

type UseEarthquakesPollingResult = {
  earthquakes: Earthquake[];
  isLoading: boolean;
  errorMessage: string | null;
  lastUpdatedAt: Date | null;
  refresh: () => Promise<void>;
};

const getStartDateIso = (lookbackDays: number): string => {
  const now = new Date();
  const past = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

  // USGS accepts YYYY-MM-DD format.
  return past.toISOString().slice(0, 10);
};

export const useEarthquakesPolling = ({
  pollIntervalMs,
  minMagnitude,
  boundingBox,
}: UseEarthquakesPollingArgs = {}): UseEarthquakesPollingResult => {
  const { defaultPollIntervalMs } = getAppConfig();
  const effectiveInterval = pollIntervalMs ?? defaultPollIntervalMs;
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const isRequestInFlightRef = useRef<boolean>(false);
  const lastParamsRef = useRef<string | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const performFetch = useCallback(async (): Promise<void> => {
    if (isRequestInFlightRef.current) {
      return;
    }

    isRequestInFlightRef.current = true;
    logInfo(POLLING_START_MESSAGE, {
      minMagnitude,
      boundingBox,
    });
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const paramsKey = JSON.stringify({
        minMagnitude,
        boundingBox,
      });

      lastParamsRef.current = paramsKey;

      const data = await fetchEarthquakes({
        minMagnitude,
        limit: 500,
        startTimeIso: getStartDateIso(DEFAULT_LOOKBACK_DAYS),
        boundingBox,
      });

      // Only update state if the parameters haven't changed while the
      // request was in flight.
      if (lastParamsRef.current === paramsKey) {
        setEarthquakes(data);
        setLastUpdatedAt(new Date());
      }
    } catch (error) {
      logError("Polling error in useEarthquakesPolling", error);
      setErrorMessage(REFRESH_FAILED_MESSAGE);
    } finally {
      isRequestInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [minMagnitude, boundingBox]);

  const refresh = useCallback(async (): Promise<void> => {
    await performFetch();
  }, [performFetch]);

  useEffect(() => {
    void performFetch();

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      void performFetch();
    }, effectiveInterval);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [performFetch, effectiveInterval]);

  return {
    earthquakes,
    isLoading,
    errorMessage,
    lastUpdatedAt,
    refresh,
  };
};
