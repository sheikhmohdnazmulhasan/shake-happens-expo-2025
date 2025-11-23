/**
 * CountrySelector
 *
 * Renders a searchable list of countries and allows the user to pick
 * one to prioritize earthquakes for that country.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import type { CountryOption } from "../models/country";
import { fetchCountries } from "../api/countries";
import { useAppTheme } from "../hooks/useAppTheme";

const SEARCH_PLACEHOLDER = "Search country";
const TITLE_LABEL = "Select a country";
const CANCEL_LABEL = "Close";
const LOAD_FAILED_MESSAGE =
  "Unable to load countries. Please check your connection.";

type CountrySelectorProps = {
  onSelectCountry: (country: CountryOption) => void;
  onCancel: () => void;
};

export const CountrySelector = ({
  onSelectCountry,
  onCancel,
}: CountrySelectorProps): ReactElement => {
  const { colors } = useAppTheme();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const result = await fetchCountries();

        if (!isCancelled) {
          setCountries(result);
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage(LOAD_FAILED_MESSAGE);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        headerRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          backgroundColor: colors.surfaceAlt,
        },
        headerTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: colors.primaryText,
        },
        headerAction: {
          fontSize: 13,
          fontWeight: "500",
          color: colors.secondaryText,
        },
        searchInput: {
          marginHorizontal: 12,
          marginVertical: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 6,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          color: colors.primaryText,
          backgroundColor: colors.surfaceAlt,
        },
        listContent: {
          paddingBottom: 8,
        },
        itemContainer: {
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        itemText: {
          fontSize: 14,
          color: colors.primaryText,
        },
        emptyContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        },
        emptyText: {
          fontSize: 13,
          color: colors.secondaryText,
          textAlign: "center",
        },
        loadingContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        },
        loadingText: {
          marginTop: 8,
          fontSize: 13,
          color: colors.secondaryText,
        },
      }),
    [colors]
  );

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return countries;
    }

    return countries.filter((country) =>
      country.name.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const keyExtractor = useCallback(
    (item: CountryOption): string => item.code,
    []
  );

  const renderItem = useCallback<ListRenderItem<CountryOption>>(
    ({ item }) => (
      <Pressable
        style={styles.itemContainer}
        onPress={() => onSelectCountry(item)}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </Pressable>
    ),
    [onSelectCountry, styles]
  );

  const renderEmpty = useCallback((): ReactElement => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {errorMessage ?? "No countries available."}
        </Text>
      </View>
    );
  }, [errorMessage, styles.emptyContainer, styles.emptyText]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading countries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{TITLE_LABEL}</Text>
        <Pressable onPress={onCancel}>
          <Text style={styles.headerAction}>{CANCEL_LABEL}</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        placeholder={SEARCH_PLACEHOLDER}
        placeholderTextColor={colors.secondaryText}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredCountries}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};
