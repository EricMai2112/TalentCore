/**
 * Combines CSS classes (simple fallback when clsx / tailwind-merge are not installed)
 */
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Validates if a string is a valid hex color code
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Returns CSS style object with soft background and solid text for badges
 */
export function getStageColorStyle(color: string) {
  const hex = color.startsWith("#") ? color : `#${color}`;
  if (!isValidHexColor(hex)) {
    return {
      backgroundColor: "rgba(99, 102, 241, 0.07)",
      color: "#6366f1",
      borderColor: "rgba(99, 102, 241, 0.18)",
    };
  }
  return {
    backgroundColor: `${hex}12`, // ~7% opacity
    color: hex,
    borderColor: `${hex}30`, // ~18% opacity
  };
}
