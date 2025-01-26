import {
  startOfWeek,
  addDays,
  format,
  subWeeks,
  addWeeks,
  isToday as isDateToday,
  startOfDay,
  parseISO,
} from "date-fns";

export function getWeekDates(startDate: Date): Date[] {
  const start = startOfDay(startDate);
  return Array.from({ length: 7 }, (_, i) => startOfDay(addDays(start, i)));
}

export function navigateToWeek(
  currentStart: Date,
  direction: "prev" | "next"
): Date {
  return startOfDay(
    direction === "prev" ? subWeeks(currentStart, 1) : addWeeks(currentStart, 1)
  );
}

export function isCurrentWeek(date: Date): boolean {
  return (
    startOfDay(date).getTime() ===
    startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })).getTime()
  );
}

export function formatDateRange(startDate: Date): string {
  const start = startOfDay(startDate);
  const end = addDays(start, 6);
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

export function formatDateToYYYYMMDD(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function normalizeDate(date: Date): Date {
  return startOfDay(date);
}

export { format, isDateToday, startOfWeek };
