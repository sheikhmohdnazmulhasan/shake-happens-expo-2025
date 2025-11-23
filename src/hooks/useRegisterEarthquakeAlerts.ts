/**
 * useRegisterEarthquakeAlerts
 *
 * Combines push notification registration and region detection to
 * register the device with a backend for earthquake alerts.
 */
import { useEffect, useRef } from "react";
import { usePushNotifications } from "./usePushNotifications";
import { registerDeviceForEarthquakeAlerts } from "../services/notificationRegistrationService";
import { logInfo } from "../utils/logger";

type BoundingBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

type UseRegisterEarthquakeAlertsArgs = {
  countryLabel: string | null;
  boundingBox: BoundingBox | null;
  minMagnitude: number;
};

export const useRegisterEarthquakeAlerts = ({
  countryLabel,
  boundingBox,
  minMagnitude,
}: UseRegisterEarthquakeAlertsArgs): void => {
  const { expoPushToken, isSupported } = usePushNotifications();
  const hasRegisteredRef = useRef<boolean>(false);

  useEffect(() => {
    const shouldRegister =
      !hasRegisteredRef.current &&
      isSupported &&
      expoPushToken != null &&
      boundingBox != null;

    if (!shouldRegister) {
      return;
    }

    hasRegisteredRef.current = true;
    logInfo("Registering device for earthquake alerts", {
      countryLabel,
      boundingBox,
      minMagnitude,
    });

    void registerDeviceForEarthquakeAlerts({
      expoPushToken,
      countryLabel,
      boundingBox,
      minMagnitude,
    });
  }, [boundingBox, countryLabel, expoPushToken, isSupported, minMagnitude]);
};
