/**
 * Root application entry for Shake Happens.
 *
 * This component is intentionally lightweight and delegates actual UI
 * to the screen layer so it remains easy to test and maintain.
 */
import React, { type ReactElement } from "react";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { EarthquakeMapScreen } from "./src/screens/EarthquakeMapScreen";
import { ThemeProvider } from "./src/theme/ThemeProvider";

const App = (): ReactElement => {
  const colorScheme = useColorScheme();
  const barStyle = colorScheme === "dark" ? "light-content" : "dark-content";

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaView
          style={[
            styles.container,
            colorScheme === "dark"
              ? styles.containerDark
              : styles.containerLight,
          ]}
        >
          <StatusBar barStyle={barStyle} />
          <EarthquakeMapScreen />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#ffffff",
  },
  containerDark: {
    backgroundColor: "#000000",
  },
});

export default App;
