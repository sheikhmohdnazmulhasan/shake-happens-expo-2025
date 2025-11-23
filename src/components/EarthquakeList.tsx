/**
 * EarthquakeList
 *
 * Simple list component that shows each earthquake's location and incident time.
 * This is designed to be re-usable below the map or on a dedicated list screen.
 */
import React, {
  memo,
  useCallback,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import type { Earthquake } from "../models/earthquakes";
import { formatLocalDateTime } from "../utils/dateTime";
import { useAppTheme } from "../hooks/useAppTheme";

const NO_EARTHQUAKES_LABEL = "No recent earthquakes detected in Bangladesh.";
const UNKNOWN_MAGNITUDE_LABEL = "M N/A";

/**
 * Returns a color representing the severity of a magnitude.
 *
 * The goal is to give a quick visual signal without overwhelming
 * the list with too many colors.
 */
const getMagnitudeColor = (magnitude: number | null): string => {
  if (magnitude == null) {
    return "#666666";
  }

  if (magnitude >= 6) {
    return "#b71c1c"; // strong - dark red
  }

  if (magnitude >= 4) {
    return "#e65100"; // moderate - orange
  }

  if (magnitude >= 2) {
    return "#f9a825"; // light - yellow-ish
  }

  return "#2e7d32"; // very small - green
};

type EarthquakeListProps = {
  earthquakes: Earthquake[];
  selectedEarthquakeId?: string | null;
  onSelectEarthquake?: (earthquake: Earthquake) => void;
};

type EarthquakeListItemProps = {
  earthquake: Earthquake;
  isSelected: boolean;
  onPress?: (earthquake: Earthquake) => void;
};

const EarthquakeListItem = ({
  earthquake,
  isSelected,
  onPress,
}: EarthquakeListItemProps): ReactElement => {
  const magnitudeLabel =
    earthquake.magnitude != null
      ? `M ${earthquake.magnitude.toFixed(1)}`
      : UNKNOWN_MAGNITUDE_LABEL;

  const magnitudeColor = getMagnitudeColor(earthquake.magnitude);

  const timeLabel = formatLocalDateTime(earthquake.occurredAt);

  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        itemContainer: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        itemSelected: {
          backgroundColor: colors.listItemSelected,
        },
        itemPressed: {
          backgroundColor: colors.listItemPressedOverlay,
        },
        itemHeaderRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        },
        itemTitle: {
          flex: 1,
          marginRight: 8,
          fontSize: 14,
          fontWeight: "600",
          color: colors.primaryText,
        },
        itemMagnitude: {
          fontSize: 13,
          fontWeight: "500",
          color: colors.secondaryText,
        },
        itemTime: {
          fontSize: 12,
          color: colors.secondaryText,
        },
      }),
    [colors],
  );

  return (
    <Pressable
      onPress={onPress ? () => onPress(earthquake) : undefined}
      style={({ pressed }) => [
        styles.itemContainer,
        isSelected && styles.itemSelected,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {earthquake.place}
        </Text>
        <Text style={[styles.itemMagnitude, { color: magnitudeColor }]}>
          {magnitudeLabel}
        </Text>
      </View>
      <Text style={styles.itemTime}>{timeLabel}</Text>
    </Pressable>
  );
};

const EarthquakeListComponent = ({
  earthquakes,
  selectedEarthquakeId,
  onSelectEarthquake,
}: EarthquakeListProps): ReactElement => {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        listContent: {
          paddingVertical: 8,
        },
        emptyListContent: {
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        itemContainer: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        itemSelected: {
          backgroundColor: colors.listItemSelected,
        },
        itemPressed: {
          backgroundColor: colors.listItemPressedOverlay,
        },
        itemHeaderRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        },
        itemTitle: {
          flex: 1,
          marginRight: 8,
          fontSize: 14,
          fontWeight: "600",
          color: colors.primaryText,
        },
        itemMagnitude: {
          fontSize: 13,
          fontWeight: "500",
          color: colors.secondaryText,
        },
        itemTime: {
          fontSize: 12,
          color: colors.secondaryText,
        },
        emptyContainer: {
          alignItems: "center",
        },
        emptyText: {
          fontSize: 13,
          color: colors.secondaryText,
          textAlign: "center",
        },
      }),
    [colors],
  );
  const keyExtractor = useCallback((item: Earthquake): string => item.id, []);

  const renderItem = useCallback<ListRenderItem<Earthquake>>(
    ({ item }) => (
      <EarthquakeListItem
        earthquake={item}
        isSelected={item.id === selectedEarthquakeId}
        onPress={onSelectEarthquake}
      />
    ),
    [onSelectEarthquake, selectedEarthquakeId],
  );

  const renderEmptyComponent = useCallback((): ReactNode => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{NO_EARTHQUAKES_LABEL}</Text>
      </View>
    );
  }, []);

  return (
    <FlatList
      data={earthquakes}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={
        earthquakes.length === 0 ? styles.emptyListContent : styles.listContent
      }
    />
  );
};

export const EarthquakeList = memo(EarthquakeListComponent);
