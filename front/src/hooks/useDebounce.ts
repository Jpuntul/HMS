import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value (typically a search input).
 *
 * Previously this was redeclared *inside the component body* of all six list
 * pages, so a fresh copy of the hook was constructed on every render of every
 * list. Same behaviour, one definition.
 *
 * @param value  the value to debounce
 * @param delay  quiet period in ms before the value propagates (default 500)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
