import {
  startOfWeek,
  addDays,
  format,
  subWeeks,
  addWeeks,
  isToday as isDateToday,
} from "date-fns";

export function getWeekDates(startDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

export function navigateToWeek(
  currentStart: Date,
  direction: "prev" | "next"
): Date {
  return direction === "prev"
    ? subWeeks(currentStart, 1)
    : addWeeks(currentStart, 1);
}

export function isCurrentWeek(date: Date): boolean {
  return (
    date.getTime() === startOfWeek(new Date(), { weekStartsOn: 1 }).getTime()
  );
}

export function formatDateRange(startDate: Date): string {
  return `${format(startDate, "MMM d")} - ${format(addDays(startDate, 6), "MMM d, yyyy")}`;
}

export { format, isDateToday, startOfWeek };
