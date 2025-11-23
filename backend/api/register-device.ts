/**
 * Vercel serverless function: /api/register-device
 *
 * This endpoint receives device registration payloads from the Shake Happens app
 * and stores them in an in-memory registry. In production you should replace the
 * in-memory storage with a real database (e.g., Postgres, Supabase).
 */

type BoundingBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

export type DeviceRegistration = {
  expoPushToken: string;
  country: string | null;
  boundingBox: BoundingBox | null;
  minMagnitude: number;
  significantMagnitudeThreshold: number;
  lastNotifiedAt?: number;
};

/**
 * Simple in-memory store. This only persists for as long as the serverless
 * function instance is warm. For real usage, store registrations in a database.
 */
const registrations: DeviceRegistration[] = [];

const isValidBoundingBox = (value: unknown): value is BoundingBox => {
  if (value == null || typeof value !== "object") {
    return false;
  }

  const box = value as Partial<BoundingBox>;

  return (
    typeof box.minLatitude === "number" &&
    typeof box.maxLatitude === "number" &&
    typeof box.minLongitude === "number" &&
    typeof box.maxLongitude === "number"
  );
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const {
    expoPushToken,
    country,
    boundingBox,
    minMagnitude,
    significantMagnitudeThreshold,
  } = body as Partial<DeviceRegistration>;

  if (typeof expoPushToken !== "string" || expoPushToken.length === 0) {
    return new Response("expoPushToken is required", { status: 400 });
  }

  if (typeof minMagnitude !== "number") {
    return new Response("minMagnitude must be a number", { status: 400 });
  }

  if (typeof significantMagnitudeThreshold !== "number") {
    return new Response("significantMagnitudeThreshold must be a number", {
      status: 400,
    });
  }

  if (boundingBox != null && !isValidBoundingBox(boundingBox)) {
    return new Response("boundingBox is invalid", { status: 400 });
  }

  const registration: DeviceRegistration = {
    expoPushToken,
    country: country ?? null,
    boundingBox: boundingBox ?? null,
    minMagnitude,
    significantMagnitudeThreshold,
  };

  registrations.push(registration);

  return new Response(
    JSON.stringify({
      success: true,
      registrationsCount: registrations.length,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
