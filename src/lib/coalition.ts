export const COALITION_COLORS: Record<string, string> = {
  PH: "bg-red-500",
  BN: "bg-blue-600",
  PN: "bg-green-600",
  ALONE: "bg-gray-400",
};

export const COALITION_BADGE: Record<string, string> = {
  PH: "bg-red-100 text-red-800",
  BN: "bg-blue-100 text-blue-800",
  PN: "bg-green-100 text-green-800",
  ALONE: "bg-gray-100 text-gray-600",
};

export function getCoalitionColor(coalition: string): string {
  return COALITION_COLORS[coalition] ?? "bg-gray-400";
}

export function getCoalitionBadge(coalition: string): string {
  return COALITION_BADGE[coalition] ?? "bg-gray-100 text-gray-600";
}
