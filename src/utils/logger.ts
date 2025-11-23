/**
 * Minimal logger utility.
 *
 * This abstraction exists so we can later swap `console` calls with a
 * production-ready logging service without touching call sites.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const formatMessage = (level: LogLevel, message: string): string => {
  return `[ShakeHappens][${level.toUpperCase()}] ${message}`;
};

export const logDebug = (message: string, context?: unknown): void => {
  if (context != null) {
    console.debug(formatMessage("debug", message), context);
    return;
  }

  console.debug(formatMessage("debug", message));
};

export const logInfo = (message: string, context?: unknown): void => {
  if (context != null) {
    console.info(formatMessage("info", message), context);
    return;
  }

  console.info(formatMessage("info", message));
};

export const logWarn = (message: string, context?: unknown): void => {
  if (context != null) {
    console.warn(formatMessage("warn", message), context);
    return;
  }

  console.warn(formatMessage("warn", message));
};

export const logError = (message: string, context?: unknown): void => {
  if (context != null) {
    console.error(formatMessage("error", message), context);
    return;
  }

  console.error(formatMessage("error", message));
};
