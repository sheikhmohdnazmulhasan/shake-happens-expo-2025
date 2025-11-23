/**
 * Root application entry for Shake Happens.
 *
 * This component is intentionally lightweight and delegates actual UI
 * to the screen layer so it remains easy to test and maintain.
 */
import React, { type ReactElement } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { EarthquakeMapScreen } from "./src/screens/EarthquakeMapScreen";

const App = (): ReactElement => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <EarthquakeMapScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
