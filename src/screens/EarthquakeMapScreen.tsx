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
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { getAppConfig } from "../config/appConfig";
import { useEarthquakesPolling } from "../hooks/useEarthquakesPolling";
import { EarthquakeList } from "../components/EarthquakeList";
import { CountrySelector } from "../components/CountrySelector";
import { useUserLocationRegion } from "../hooks/useUserLocationRegion";
import type { Earthquake } from "../models/earthquakes";
import type { CountryOption } from "../models/country";
import { useAppTheme } from "../hooks/useAppTheme";

const LOADING_LABEL = "Loading earthquakes...";

export const EarthquakeMapScreen = (): ReactElement => {
  const { mapDefaultLatitude, mapDefaultLongitude, mapDefaultZoomDelta } =
    getAppConfig();

  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<
    string | null
  >(null);
  const [isSelectingCountry, setIsSelectingCountry] = useState<boolean>(false);
  const [manualCountry, setManualCountry] = useState<CountryOption | null>(
    null
  );

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
    boundingBox:
      manualCountry != null
        ? {
            minLatitude: manualCountry.latitude - 7,
            maxLatitude: manualCountry.latitude + 7,
            minLongitude: manualCountry.longitude - 7,
            maxLongitude: manualCountry.longitude + 7,
          }
        : boundingBox ?? undefined,
  });

  const mapRef = useRef<MapView | null>(null);
  const isProgrammaticMoveRef = useRef<boolean>(false);

  const initialRegion: Region = useMemo(() => {
    const latitude =
      manualCountry?.latitude ?? centerLatitude ?? mapDefaultLatitude;
    const longitude =
      manualCountry?.longitude ?? centerLongitude ?? mapDefaultLongitude;

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

  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
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
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        regionHeader: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          backgroundColor: colors.surfaceAlt,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        regionHeaderText: {
          flex: 1,
          fontSize: 12,
          color: colors.secondaryText,
        },
        changeText: {
          marginLeft: 8,
          fontSize: 12,
          fontWeight: "600",
          color: colors.primaryText,
        },
        loadingOverlay: {
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.mapLoadingOverlay,
        },
        loadingText: {
          marginTop: 8,
          color: colors.primaryText,
        },
        errorBanner: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.errorBackground,
        },
        errorText: {
          color: colors.errorText,
          textAlign: "center",
        },
      }),
    [colors]
  );

  const activeCountryLabel = manualCountry?.name ?? countryLabel;
  const changeLabel = isSelectingCountry ? "Close" : "Change";

  const handleOpenCountrySelector = useCallback(() => {
    setIsSelectingCountry((previous) => !previous);
  }, []);

  const handleCountrySelected = useCallback(
    (country: CountryOption) => {
      setManualCountry(country);
      setIsSelectingCountry(false);
      setSelectedEarthquakeId(null);

      if (!mapRef.current) {
        return;
      }

      mapRef.current.animateToRegion(
        {
          latitude: country.latitude,
          longitude: country.longitude,
          latitudeDelta: mapDefaultZoomDelta,
          longitudeDelta: mapDefaultZoomDelta,
        },
        500
      );
    },
    [mapDefaultZoomDelta]
  );

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
        {activeCountryLabel ? (
          <View style={styles.regionHeader}>
            <Text style={styles.regionHeaderText}>
              Showing earthquakes in and around {activeCountryLabel}
            </Text>
            <Pressable onPress={handleOpenCountrySelector}>
              <Text style={styles.changeText}>{changeLabel}</Text>
            </Pressable>
          </View>
        ) : null}

        {isSelectingCountry ? (
          <CountrySelector onSelectCountry={handleCountrySelected} />
        ) : (
          <EarthquakeList
            earthquakes={earthquakes}
            selectedEarthquakeId={selectedEarthquakeId}
            onSelectEarthquake={handleSelectEarthquake}
          />
        )}
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
