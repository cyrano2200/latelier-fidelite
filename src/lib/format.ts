export function formatMoney(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** @deprecated Utiliser formatMoney — alias conservé pour compat. */
export const formatEuro = formatMoney;

export function formatPoints(value: number | string | null | undefined): string {
  const n = Math.round(Number(value ?? 0));
  return `${n.toLocaleString("fr-FR")} pt${n === 1 ? "" : "s"}`;
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  }).format(d);
}

export function formatDateShort(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    timeZone: "Africa/Casablanca",
  }).format(d);
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s.\-()]/g, "").trim();
}

export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function loyaltyRuleLabel(dirhamsPerPoint: number): string {
  const d = Number(dirhamsPerPoint) || 10;
  return `${d} DH = 1 pt`;
}
