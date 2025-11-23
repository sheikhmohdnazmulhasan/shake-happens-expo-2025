/**
 * Theme configuration for Shake Happens.
 *
 * This module defines light and dark themes and a helper to select the
 * appropriate theme based on the device color scheme.
 */

export type AppThemeName = "light" | "dark";

export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primaryText: string;
  secondaryText: string;
  listItemSelected: string;
  listItemPressedOverlay: string;
  errorBackground: string;
  errorText: string;
  mapLoadingOverlay: string;
};

export type AppTheme = {
  name: AppThemeName;
  colors: AppThemeColors;
};

const LIGHT_THEME: AppTheme = {
  name: "light",
  colors: {
    background: "#f2f2f2",
    surface: "#ffffff",
    surfaceAlt: "#fafafa",
    border: "#dddddd",
    primaryText: "#111111",
    secondaryText: "#555555",
    listItemSelected: "#eef6ff",
    listItemPressedOverlay: "rgba(0, 0, 0, 0.05)",
    errorBackground: "#ffdddd",
    errorText: "#a80000",
    mapLoadingOverlay: "rgba(255, 255, 255, 0.3)",
  },
};

const DARK_THEME: AppTheme = {
  name: "dark",
  colors: {
    background: "#000000",
    surface: "#121212",
    surfaceAlt: "#1c1c1c",
    border: "#333333",
    primaryText: "#ffffff",
    secondaryText: "#cccccc",
    listItemSelected: "#263238",
    listItemPressedOverlay: "rgba(255, 255, 255, 0.08)",
    errorBackground: "#4a1f1f",
    errorText: "#ffb3b3",
    mapLoadingOverlay: "rgba(0, 0, 0, 0.4)",
  },
};

export const getThemeForScheme = (
  scheme: "light" | "dark" | null | undefined,
): AppTheme => {
  if (scheme === "dark") {
    return DARK_THEME;
  }

  return LIGHT_THEME;
};
