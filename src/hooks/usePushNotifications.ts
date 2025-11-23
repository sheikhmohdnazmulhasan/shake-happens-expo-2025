/**
 * usePushNotifications
 *
 * Handles requesting notification permissions and retrieving an Expo push token.
 * This hook does not talk to any backend; it only manages local permission/token state.
 */
import { useEffect, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { logError } from "../utils/logger";

const NOTIFICATIONS_UNSUPPORTED_MESSAGE =
  "Push notifications are not supported on this device.";
const NOTIFICATIONS_PERMISSION_DENIED_MESSAGE =
  "Notification permissions were not granted.";

type UsePushNotificationsResult = {
  expoPushToken: string | null;
  isSupported: boolean;
  isLoading: boolean;
  errorMessage: string | null;
};

export const usePushNotifications = (): UsePushNotificationsResult => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const registerAsync = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (!Device.isDevice) {
          if (!isCancelled) {
            setIsSupported(false);
            setErrorMessage(NOTIFICATIONS_UNSUPPORTED_MESSAGE);
          }
          return;
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          if (!isCancelled) {
            setErrorMessage(NOTIFICATIONS_PERMISSION_DENIED_MESSAGE);
          }
          return;
        }

        const { data } = await Notifications.getExpoPushTokenAsync();

        if (!isCancelled) {
          setExpoPushToken(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage("Failed to register for push notifications.");
          logError("Failed to register for push notifications", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void registerAsync();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    expoPushToken,
    isSupported,
    isLoading,
    errorMessage,
  };
};
