/**
 * EarthquakeList
 *
 * Simple list component that shows each earthquake's location and incident time.
 * This is designed to be re-usable below the map or on a dedicated list screen.
 */
import React, {
  memo,
  useCallback,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import type { Earthquake } from "../models/earthquakes";
import { formatLocalDateTime } from "../utils/dateTime";

const NO_EARTHQUAKES_LABEL = "No recent earthquakes detected in Bangladesh.";

type EarthquakeListProps = {
  earthquakes: Earthquake[];
};

type EarthquakeListItemProps = {
  earthquake: Earthquake;
};

const EarthquakeListItem = ({
  earthquake,
}: EarthquakeListItemProps): ReactElement => {
  const magnitudeLabel =
    earthquake.magnitude != null
      ? `M ${earthquake.magnitude.toFixed(1)}`
      : "M N/A";

  const timeLabel = formatLocalDateTime(earthquake.occurredAt);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {earthquake.place}
        </Text>
        <Text style={styles.itemMagnitude}>{magnitudeLabel}</Text>
      </View>
      <Text style={styles.itemTime}>{timeLabel}</Text>
    </View>
  );
};

const EarthquakeListComponent = ({
  earthquakes,
}: EarthquakeListProps): ReactElement => {
  const keyExtractor = useCallback((item: Earthquake): string => item.id, []);

  const renderItem = useCallback<ListRenderItem<Earthquake>>(
    ({ item }) => <EarthquakeListItem earthquake={item} />,
    []
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

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
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
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
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
  },
  itemMagnitude: {
    fontSize: 13,
    fontWeight: "500",
    color: "#444",
  },
  itemTime: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
});
