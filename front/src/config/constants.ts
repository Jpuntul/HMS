/**
 * Shared Application Constants
 */

export const PAGINATION = {
  /** Page size for card grid views (Staff, Persons, Schedules: 6 rows x 3 columns) */
  CARD_GRID_PAGE_SIZE: 18,
  /** Page size for tabular views (Facilities, Infections, Vaccinations) */
  TABLE_PAGE_SIZE: 20,
} as const;

export const UI_TIMINGS = {
  /** Duration in milliseconds before success / alert banners auto-dismiss */
  SUCCESS_MESSAGE_DURATION_MS: 5000,
  /** Debounce delay in milliseconds for search inputs */
  SEARCH_DEBOUNCE_MS: 500,
} as const;

export const GRID_LAYOUTS = {
  /** Standard responsive grid matching 3-column card list layout */
  CARD_GRID: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "hms_access",
  REFRESH_TOKEN: "hms_refresh",
  USER: "hms_user",
} as const;
