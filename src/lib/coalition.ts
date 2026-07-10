export const COALITION_COLORS: Record<string, string> = {
  PH: "bg-red-500",
  BN: "bg-blue-600",
  PN: "bg-sky-500", // lighter blue, different from BN
  MUDA: "bg-yellow-400",
  BERSAMA: "bg-yellow-300", // bright yellow, slightly lighter than MUDA
  ALONE: "bg-purple-400", // bebas
};

export const COALITION_BADGE: Record<string, string> = {
  PH: "bg-red-100 text-red-700",
  BN: "bg-blue-100 text-blue-700",
  PN: "bg-sky-100 text-sky-700",
  MUDA: "bg-yellow-100 text-yellow-700",
  BERSAMA: "bg-yellow-50 text-yellow-600",
  ALONE: "bg-purple-100 text-purple-700",
};

export const PARTY_COLORS: Record<string, string> = {
  MUDA: "text-yellow-500",
  BN: "text-blue-600",
  UMNO: "text-blue-600",
  PH: "text-red-600",
  PKR: "text-red-500",
  DAP: "text-red-600",
  AMANAH: "text-red-400",
  PN: "text-sky-600",
  PAS: "text-sky-600",
  BERSATU: "text-sky-500",
  BERSAMA: "text-yellow-500",
  BEBAS: "text-purple-500",
};

export const PARTY_BG_COLORS: Record<string, string> = {
  MUDA: "bg-yellow-100 text-yellow-700",
  BN: "bg-blue-100 text-blue-700",
  UMNO: "bg-blue-100 text-blue-700",
  MCA: "bg-blue-100 text-blue-700",
  MIC: "bg-blue-100 text-blue-700",
  PH: "bg-red-100 text-red-700",
  PKR: "bg-red-100 text-red-700",
  DAP: "bg-red-100 text-red-700",
  AMANAH: "bg-red-50 text-red-600",
  PN: "bg-sky-100 text-sky-700",
  PAS: "bg-sky-100 text-sky-700",
  BERSATU: "bg-sky-100 text-sky-600",
  BERSAMA: "bg-yellow-50 text-yellow-600",
  BEBAS: "bg-purple-100 text-purple-700",
};

export function getCoalitionColor(coalition: string): string {
  return COALITION_COLORS[coalition] ?? "bg-gray-400";
}

export function getCoalitionBadge(coalition: string): string {
  return COALITION_BADGE[coalition] ?? "bg-gray-100 text-gray-600";
}

export function getPartyColor(party: string): string {
  return PARTY_COLORS[party] ?? "text-gray-500";
}

export function getPartyBg(party: string): string {
  return PARTY_BG_COLORS[party] ?? "bg-gray-100 text-gray-600";
}
