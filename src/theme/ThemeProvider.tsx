/**
 * ThemeProvider
 *
 * Provides the AppTheme based on the device color scheme
 * and exposes it via React context.
 */
import React, {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import { useColorScheme } from "react-native";
import { getThemeForScheme, type AppTheme } from "./theme";

const ThemeContext = createContext<AppTheme>(getThemeForScheme("light"));

export const ThemeProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const scheme = useColorScheme();

  const theme = useMemo<AppTheme>(() => getThemeForScheme(scheme), [scheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = (): AppTheme => {
  return useContext(ThemeContext);
};
