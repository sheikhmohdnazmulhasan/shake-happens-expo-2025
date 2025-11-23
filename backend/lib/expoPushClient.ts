/**
 * Minimal Expo Push API client for Vercel serverless functions.
 *
 * This module sends push notifications to the Expo Push API. It assumes that
 * the Expo push tokens have already been validated on the client side.
 */

export type ExpoPushMessage = {
  to: string;
  sound?: "default" | null;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

export const sendPushMessages = async (
  messages: ExpoPushMessage[]
): Promise<void> => {
  if (messages.length === 0) {
    return;
  }

  const response = await fetch(EXPO_PUSH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    // In production you may want to forward this to a logging/monitoring service.
    console.error("Expo push API returned non-200 response", {
      status: response.status,
      statusText: response.statusText,
    });
  } else {
    const json = await response.json();
    console.log("Expo push API response", json);
  }
};
