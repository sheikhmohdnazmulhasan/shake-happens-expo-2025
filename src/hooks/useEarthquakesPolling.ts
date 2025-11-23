/**
 * Polling hook for fetching earthquakes from the USGS API.
 *
 * This hook encapsulates:
 * - periodic polling with a configurable interval,
 * - basic exponential backoff on repeated failures,
 * - controlled loading and error state for the UI.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEarthquakes } from "../api/usgs";
import { getAppConfig } from "../config/appConfig";
import type { Earthquake } from "../models/earthquakes";
import { logError } from "../utils/logger";

const REFRESH_FAILED_MESSAGE =
  "Unable to refresh earthquakes. Please check your connection.";
const MAX_BACKOFF_MS = 5 * 60_000;
const INITIAL_BACKOFF_MS = 5_000;

type UseEarthquakesPollingArgs = {
  pollIntervalMs?: number;
  minMagnitude?: number;
};

type UseEarthquakesPollingResult = {
  earthquakes: Earthquake[];
  isLoading: boolean;
  errorMessage: string | null;
  lastUpdatedAt: Date | null;
  refresh: () => Promise<void>;
};

export const useEarthquakesPolling = ({
  pollIntervalMs,
  minMagnitude,
}: UseEarthquakesPollingArgs = {}): UseEarthquakesPollingResult => {
  const { defaultPollIntervalMs } = getAppConfig();
  const effectiveInterval = pollIntervalMs ?? defaultPollIntervalMs;

  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const isRequestInFlightRef = useRef<boolean>(false);
  const backoffMsRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNextPoll = useCallback(
    (delayMs: number): void => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = setTimeout(() => {
        void performFetch();
      }, delayMs);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const performFetch = useCallback(async (): Promise<void> => {
    if (isRequestInFlightRef.current) {
      return;
    }

    isRequestInFlightRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchEarthquakes({ minMagnitude });
      setEarthquakes(data);
      setLastUpdatedAt(new Date());
      backoffMsRef.current = null;
      scheduleNextPoll(effectiveInterval);
    } catch (error) {
      logError("Polling error in useEarthquakesPolling", error);
      setErrorMessage(REFRESH_FAILED_MESSAGE);

      const currentBackoff =
        backoffMsRef.current == null
          ? INITIAL_BACKOFF_MS
          : Math.min(backoffMsRef.current * 2, MAX_BACKOFF_MS);

      backoffMsRef.current = currentBackoff;
      scheduleNextPoll(currentBackoff);
    } finally {
      isRequestInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [effectiveInterval, minMagnitude, scheduleNextPoll]);

  const refresh = useCallback(async (): Promise<void> => {
    await performFetch();
  }, [performFetch]);

  useEffect(() => {
    void performFetch();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [performFetch]);

  return {
    earthquakes,
    isLoading,
    errorMessage,
    lastUpdatedAt,
    refresh,
  };
};
