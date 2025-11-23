/**
 * useUserLocationRegion
 *
 * Requests foreground location permission, fetches the user's current position,
 * and derives a simple bounding box and label that can be used to prioritize
 * earthquakes near the user.
 */
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { logError, logInfo } from "../utils/logger";

const LOCATION_PERMISSION_DENIED_MESSAGE =
  "Location permission was denied. Showing default region instead.";
const LOCATION_UNAVAILABLE_MESSAGE =
  "Unable to determine your location. Showing default region instead.";

type BoundingBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

type UseUserLocationRegionArgs = {
  latitudeDeltaDegrees?: number;
  longitudeDeltaDegrees?: number;
};

type UseUserLocationRegionResult = {
  isLoading: boolean;
  errorMessage: string | null;
  countryLabel: string | null;
  centerLatitude: number | null;
  centerLongitude: number | null;
  boundingBox: BoundingBox | null;
};

const DEFAULT_LATITUDE_DELTA_DEGREES = 5;
const DEFAULT_LONGITUDE_DELTA_DEGREES = 5;

export const useUserLocationRegion = ({
  latitudeDeltaDegrees,
  longitudeDeltaDegrees,
}: UseUserLocationRegionArgs = {}): UseUserLocationRegionResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countryLabel, setCountryLabel] = useState<string | null>(null);
  const [centerLatitude, setCenterLatitude] = useState<number | null>(null);
  const [centerLongitude, setCenterLongitude] = useState<number | null>(null);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const determineRegion = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (!isCancelled) {
            setErrorMessage(LOCATION_PERMISSION_DENIED_MESSAGE);
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({});

        if (!position.coords) {
          if (!isCancelled) {
            setErrorMessage(LOCATION_UNAVAILABLE_MESSAGE);
          }
          return;
        }

        const { latitude, longitude } = position.coords;

        const latDelta = latitudeDeltaDegrees ?? DEFAULT_LATITUDE_DELTA_DEGREES;
        const lonDelta =
          longitudeDeltaDegrees ?? DEFAULT_LONGITUDE_DELTA_DEGREES;

        const calculatedBoundingBox: BoundingBox = {
          minLatitude: latitude - latDelta,
          maxLatitude: latitude + latDelta,
          minLongitude: longitude - lonDelta,
          maxLongitude: longitude + lonDelta,
        };

        let derivedCountryLabel: string | null = null;

        try {
          const geocodeResults = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (geocodeResults.length > 0) {
            derivedCountryLabel = geocodeResults[0]?.country ?? null;
          }
        } catch (geocodeError) {
          logError("Reverse geocoding failed", geocodeError);
        }

        if (!isCancelled) {
          setCenterLatitude(latitude);
          setCenterLongitude(longitude);
          setBoundingBox(calculatedBoundingBox);
          setCountryLabel(derivedCountryLabel);
          logInfo("User region determined", {
            latitude,
            longitude,
            boundingBox: calculatedBoundingBox,
            country: derivedCountryLabel,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(LOCATION_UNAVAILABLE_MESSAGE);
          logError("Failed to determine user location region", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void determineRegion();

    return () => {
      isCancelled = true;
    };
  }, [latitudeDeltaDegrees, longitudeDeltaDegrees]);

  return {
    isLoading,
    errorMessage,
    countryLabel,
    centerLatitude,
    centerLongitude,
    boundingBox,
  };
};
