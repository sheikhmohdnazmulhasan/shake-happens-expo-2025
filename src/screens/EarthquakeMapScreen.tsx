/**
 * EarthquakeMapScreen
 *
 * Top-level screen that renders a map and displays earthquakes as markers.
 * Uses the polling hook to keep data up to date with the USGS API.
 */
import React, { useMemo, type ReactElement } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { getAppConfig } from "../config/appConfig";
import { useEarthquakesPolling } from "../hooks/useEarthquakesPolling";

const LOADING_LABEL = "Loading earthquakes...";

export const EarthquakeMapScreen = (): ReactElement => {
  const { mapDefaultLatitude, mapDefaultLongitude, mapDefaultZoomDelta } =
    getAppConfig();

  const { earthquakes, isLoading, errorMessage } = useEarthquakesPolling({});

  const initialRegion: Region = useMemo(
    () => ({
      latitude: mapDefaultLatitude,
      longitude: mapDefaultLongitude,
      latitudeDelta: mapDefaultZoomDelta,
      longitudeDelta: mapDefaultZoomDelta,
    }),
    [mapDefaultLatitude, mapDefaultLongitude, mapDefaultZoomDelta]
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {earthquakes.map((quake) => (
          <Marker
            key={quake.id}
            coordinate={{
              latitude: quake.latitude,
              longitude: quake.longitude,
            }}
            title={quake.place}
            description={
              quake.magnitude != null
                ? `M ${quake.magnitude.toFixed(1)}`
                : undefined
            }
          />
        ))}
      </MapView>

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{LOADING_LABEL}</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  loadingText: {
    marginTop: 8,
  },
  errorBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffdddd",
  },
  errorText: {
    color: "#a80000",
    textAlign: "center",
  },
});
