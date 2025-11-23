/**
 * useAppTheme
 *
 * Convenience hook that exposes the current AppTheme from ThemeProvider.
 */
import { useThemeContext } from "../theme/ThemeProvider";
import type { AppTheme } from "../theme/theme";

export const useAppTheme = (): AppTheme => {
  return useThemeContext();
};
