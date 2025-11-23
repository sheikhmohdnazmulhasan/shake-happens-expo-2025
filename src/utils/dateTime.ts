/**
 * Date and time formatting helpers.
 *
 * These utilities keep all formatting logic in one place so the UI components
 * stay clean and focused on layout.
 */

export const formatLocalDateTime = (value: Date): string => {
  try {
    return value.toLocaleString();
  } catch {
    return value.toISOString();
  }
};
