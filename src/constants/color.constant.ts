export const COLOR_VALUES = [
  "#16a34a",
  "#2563eb",
  "#dc2626",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#0891b2",
  "#64748b",
] as const;

export type ColorValue = (typeof COLOR_VALUES)[number];

export const COLOR_LABELS: Record<ColorValue, string> = {
  "#16a34a": "Verde",
  "#2563eb": "Azul",
  "#dc2626": "Rojo",
  "#f59e0b": "Ámbar",
  "#8b5cf6": "Violeta",
  "#ec4899": "Rosa",
  "#0891b2": "Cian",
  "#64748b": "Gris",
};
