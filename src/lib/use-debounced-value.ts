import { useEffect, useState } from "react";

/** Delays reflecting a fast-changing value (e.g. a size/price input) by
 * `delayMs`, so callers that fire a network request per change (like the
 * liquidation-price estimate) don't do it on every keystroke. */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
