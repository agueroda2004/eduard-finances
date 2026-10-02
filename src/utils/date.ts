const DATE_LOCALE = "es-CR";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function startOfMonthIso(date: Date = new Date()): string {
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonthIso(date: Date = new Date()): string {
  return toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseIsoDate(value));
}

export function formatMonthLabel(date: Date): string {
  const label = new Intl.DateTimeFormat(DATE_LOCALE, {
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
