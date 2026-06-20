/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString: string, locale = 'vi-VN'): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Truncate a string to maxLength and append ellipsis
 */
export const truncate = (str: string, maxLength = 50): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

/**
 * Retrieve a value from localStorage with safe JSON parsing
 */
export const getLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
};

/**
 * Save a value to localStorage with JSON serialization
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};
