/**
 * Vercel serverless function: /api/poll-usgs
 *
 * This endpoint is intended to be triggered by a scheduled job (cron).
 * It fetches recent earthquakes from the USGS API for each registered device
 * and sends push notifications via the Expo Push API when a new significant
 * event is detected.
 *
 * NOTE: This implementation uses the in-memory registrations array that lives
 * in register-device.ts. In production you should replace this with a database
 * query that loads all active registrations.
 */

import type { DeviceRegistration } from "./register-device";
import { sendPushMessages, type ExpoPushMessage } from "../lib/expoPushClient";

const USGS_API_BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const LOOKBACK_MINUTES = 10;

declare const global: {
  registrations?: DeviceRegistration[];
};

const getRegistrations = (): DeviceRegistration[] => {
  if (!global.registrations) {
    global.registrations = [];
  }
  return global.registrations;
};

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
  };
};

type UsgsResponse = {
  features: UsgsFeature[];
};

const getStartTimeIso = (): string => {
  const now = new Date();
  const past = new Date(now.getTime() - LOOKBACK_MINUTES * 60 * 1000);
  return past.toISOString();
};

const fetchRecentEarthquakes = async (
  registration: DeviceRegistration
): Promise<UsgsFeature[]> => {
  const params = new URLSearchParams({
    format: "geojson",
    orderby: "time",
    starttime: getStartTimeIso(),
    minmagnitude: String(registration.minMagnitude),
    limit: "50",
  });

  if (registration.boundingBox) {
    params.append("minlatitude", String(registration.boundingBox.minLatitude));
    params.append("maxlatitude", String(registration.boundingBox.maxLatitude));
    params.append(
      "minlongitude",
      String(registration.boundingBox.minLongitude)
    );
    params.append(
      "maxlongitude",
      String(registration.boundingBox.maxLongitude)
    );
  }

  const url = `${USGS_API_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    console.error("USGS API returned error status for poll-usgs", {
      status: response.status,
      statusText: response.statusText,
    });
    return [];
  }

  const json = (await response.json()) as UsgsResponse;
  return json.features ?? [];
};

export default async function handler(): Promise<Response> {
  const registrations = getRegistrations();

  if (registrations.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: "No registrations to process.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const messages: ExpoPushMessage[] = [];

  for (const registration of registrations) {
    const features = await fetchRecentEarthquakes(registration);

    if (features.length === 0) {
      continue;
    }

    const newest = features[0];

    const magnitude = newest.properties.mag ?? 0;

    if (magnitude < registration.significantMagnitudeThreshold) {
      continue;
    }

    const eventTime = newest.properties.time;

    if (
      registration.lastNotifiedAt != null &&
      eventTime <= registration.lastNotifiedAt
    ) {
      continue;
    }

    registration.lastNotifiedAt = eventTime;

    messages.push({
      to: registration.expoPushToken,
      sound: "default",
      title: `Earthquake M${magnitude.toFixed(1)}`,
      body:
        newest.properties.place ??
        "A significant earthquake was detected in your region.",
      data: {
        usgsId: newest.id,
        country: registration.country,
      },
    });
  }

  if (messages.length > 0) {
    await sendPushMessages(messages);
  }

  return new Response(
    JSON.stringify({
      success: true,
      processedRegistrations: registrations.length,
      sentMessages: messages.length,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
