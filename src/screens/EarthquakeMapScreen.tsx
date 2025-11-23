/**
 * EarthquakeMapScreen
 *
 * Top-level screen that renders a map and displays earthquakes as markers.
 * Uses the polling hook to keep data up to date with the USGS API.
 */
import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  type ReactElement,
} from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { getAppConfig } from "../config/appConfig";
import { useEarthquakesPolling } from "../hooks/useEarthquakesPolling";
import { EarthquakeList } from "../components/EarthquakeList";
import { useUserLocationRegion } from "../hooks/useUserLocationRegion";
import type { Earthquake } from "../models/earthquakes";

const LOADING_LABEL = "Loading earthquakes...";

export const EarthquakeMapScreen = (): ReactElement => {
  const { mapDefaultLatitude, mapDefaultLongitude, mapDefaultZoomDelta } =
    getAppConfig();

  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<
    string | null
  >(null);

  const {
    isLoading: isLocationLoading,
    errorMessage: locationErrorMessage,
    countryLabel,
    centerLatitude,
    centerLongitude,
    boundingBox,
  } = useUserLocationRegion({});

  const {
    earthquakes,
    isLoading: isEarthquakesLoading,
    errorMessage: earthquakesErrorMessage,
  } = useEarthquakesPolling({
    boundingBox: boundingBox ?? undefined,
  });

  const mapRef = useRef<MapView | null>(null);
  const isProgrammaticMoveRef = useRef<boolean>(false);

  const initialRegion: Region = useMemo(() => {
    const latitude = centerLatitude ?? mapDefaultLatitude;
    const longitude = centerLongitude ?? mapDefaultLongitude;

    return {
      latitude,
      longitude,
      latitudeDelta: mapDefaultZoomDelta,
      longitudeDelta: mapDefaultZoomDelta,
    };
  }, [
    centerLatitude,
    centerLongitude,
    mapDefaultLatitude,
    mapDefaultLongitude,
    mapDefaultZoomDelta,
  ]);

  const handleSelectEarthquake = useCallback(
    (quake: Earthquake) => {
      if (!mapRef.current) {
        return;
      }

      if (quake.latitude == null || quake.longitude == null) {
        return;
      }

      setSelectedEarthquakeId(quake.id);
      isProgrammaticMoveRef.current = true;

      mapRef.current.animateToRegion(
        {
          latitude: quake.latitude,
          longitude: quake.longitude,
          latitudeDelta: mapDefaultZoomDelta / 5,
          longitudeDelta: mapDefaultZoomDelta / 5,
        },
        500
      );
    },
    [mapDefaultZoomDelta]
  );

  const handleRegionChangeComplete = useCallback(() => {
    if (isProgrammaticMoveRef.current) {
      isProgrammaticMoveRef.current = false;
      return;
    }

    if (selectedEarthquakeId != null) {
      setSelectedEarthquakeId(null);
    }
  }, [selectedEarthquakeId]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
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
      </View>

      <View style={styles.listContainer}>
        {countryLabel ? (
          <View style={styles.regionHeader}>
            <Text style={styles.regionHeaderText}>
              Showing earthquakes in and around {countryLabel}
            </Text>
          </View>
        ) : null}
        <EarthquakeList
          earthquakes={earthquakes}
          selectedEarthquakeId={selectedEarthquakeId}
          onSelectEarthquake={handleSelectEarthquake}
        />
      </View>

      {isEarthquakesLoading || isLocationLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{LOADING_LABEL}</Text>
        </View>
      ) : null}

      {earthquakesErrorMessage || locationErrorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {earthquakesErrorMessage ?? locationErrorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 2,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  regionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    backgroundColor: "#fafafa",
  },
  regionHeaderText: {
    fontSize: 12,
    color: "#555",
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
