/**
 * Shared formatting utilities.
 */

/**
 * Format a credit value with thousand separators.
 *
 * Returns `"---"` for `null` / `undefined`.
 *
 * Treats `0` as `"0"` (not `"---"`). Call sites that need to render `"---"`
 * for zero-cost items should guard at the call site (see `ModuleSlotCard`).
 */
export function formatCredits(value: number | null | undefined): string {
  if (value === undefined || value === null) return "---";
  return value.toLocaleString();
}

/**
 * Format a numeric value with thousand separators.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}
