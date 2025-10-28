/* eslint-disable no-bitwise */

/**
 * Generates a consistent, visually appealing color from a string (e.g., a user ID).
 * This hashing function is simple and not cryptographically secure.
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use HSL for more visually pleasing and distinct colors
  const h = hash % 360;
  // Keep saturation and lightness within a pleasant range
  const s = 70; // 70% saturation
  const l = 50; // 50% lightness

  return `hsl(${h}, ${s}%, ${l}%)`;
}
