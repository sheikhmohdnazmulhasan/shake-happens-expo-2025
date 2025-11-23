/**
 * notificationRegistrationService
 *
 * Responsible for sending the device's Expo push token and regional
 * earthquake preferences to a backend service that can schedule alerts.
 */
import { getAppConfig } from "../config/appConfig";
import { logError, logInfo } from "../utils/logger";

type BoundingBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

type RegisterDeviceArgs = {
  expoPushToken: string;
  countryLabel: string | null;
  boundingBox: BoundingBox | null;
  minMagnitude: number;
};

export const registerDeviceForEarthquakeAlerts = async ({
  expoPushToken,
  countryLabel,
  boundingBox,
  minMagnitude,
}: RegisterDeviceArgs): Promise<void> => {
  const { notificationRegistrationUrl, significantMagnitudeThreshold } =
    getAppConfig();

  if (!notificationRegistrationUrl) {
    logInfo(
      "Skipping device registration because notificationRegistrationUrl is not configured"
    );
    return;
  }

  const payload = {
    expoPushToken,
    country: countryLabel,
    boundingBox,
    minMagnitude,
    significantMagnitudeThreshold,
  };

  try {
    const response = await fetch(notificationRegistrationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logError("Failed to register device for earthquake alerts", {
        status: response.status,
        statusText: response.statusText,
      });
      return;
    }

    logInfo("Device registered for earthquake alerts", payload);
  } catch (error) {
    logError("Network error registering device for earthquake alerts", error);
  }
};
