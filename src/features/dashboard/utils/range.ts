import { endOfMonthIso, startOfMonthIso, toIsoDate } from "../../../utils/date";
import type { DateRange } from "../types/dashboard";

export function currentMonthRange(): DateRange {
  return { from: startOfMonthIso(), to: endOfMonthIso() };
}

export function lastMonthRange(): DateRange {
  const previous = new Date();
  previous.setMonth(previous.getMonth() - 1);
  return { from: startOfMonthIso(previous), to: endOfMonthIso(previous) };
}

export function last30DaysRange(): DateRange {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 29,
  );
  return { from: toIsoDate(start), to: toIsoDate(now) };
}

export function currentYearRange(): DateRange {
  const now = new Date();
  return {
    from: toIsoDate(new Date(now.getFullYear(), 0, 1)),
    to: toIsoDate(new Date(now.getFullYear(), 11, 31)),
  };
}
