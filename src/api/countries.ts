/**
 * Countries API integration.
 *
 * Fetches a list of countries and their approximate coordinates from the
 * REST Countries API, then maps them into a lightweight model.
 */
import type { CountryOption } from "../models/country";
import { logError } from "../utils/logger";

const COUNTRIES_REQUEST_FAILED_MESSAGE =
  "Failed to load countries. Please try again.";

let cachedCountries: CountryOption[] | null = null;

type RestCountry = {
  cca2?: string;
  name?: {
    common?: string;
  };
  latlng?: [number, number];
};

export const fetchCountries = async (): Promise<CountryOption[]> => {
  if (cachedCountries) {
    return cachedCountries;
  }

  let response: Response;

  try {
    response = await fetch(
      "https://restcountries.com/v3.1/all?fields=cca2,name,latlng",
    );
  } catch (error) {
    logError("Network error fetching countries", error);
    throw new Error(COUNTRIES_REQUEST_FAILED_MESSAGE);
  }

  if (!response.ok) {
    logError("Countries API returned non-200 response", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(COUNTRIES_REQUEST_FAILED_MESSAGE);
  }

  let json: RestCountry[];

  try {
    json = (await response.json()) as RestCountry[];
  } catch (error) {
    logError("Failed to parse countries response", error);
    throw new Error(COUNTRIES_REQUEST_FAILED_MESSAGE);
  }

  const mapped = json
    .filter(
      (country) =>
        country.name?.common &&
        Array.isArray(country.latlng) &&
        country.latlng.length === 2,
    )
    .map<CountryOption>((country) => ({
      code: country.cca2 ?? country.name?.common ?? "??",
      name: country.name?.common ?? "Unknown",
      latitude: country.latlng![0],
      longitude: country.latlng![1],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  cachedCountries = mapped;

  return mapped;
};
