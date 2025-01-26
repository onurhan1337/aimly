import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { useGoals } from "@/lib/hooks/use-goals";
import { startOfWeek } from "date-fns";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { DayProgress } from "./day-progress";
import { DaySeparator } from "./day-separator";
import {
  getWeekDates,
  navigateToWeek,
  isCurrentWeek,
  formatDateRange,
  normalizeDate,
  formatDateToYYYYMMDD,
} from "@/lib/utils/date";

export function WeeklyProgress() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    normalizeDate(new Date())
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    normalizeDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
  );

  const weekDates = getWeekDates(currentWeekStart);

  const weeklyData = weekDates.map((date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    const { goals } = useGoals(dateStr);
    return {
      date,
      goals: goals || [],
      total: goals?.length || 0,
      completed: goals?.filter((goal) => goal.completed).length || 0,
    };
  });

  const handleNavigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => navigateToWeek(prev, direction));
  };

  const weeklyTotals = weeklyData.reduce(
    (acc, day) => ({
      total: acc.total + day.total,
      completed: acc.completed + day.completed,
    }),
    { total: 0, completed: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
            {weeklyTotals.total > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>
                  {weeklyTotals.completed}/{weeklyTotals.total} completed this
                  week
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {formatDateRange(currentWeekStart)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-stretch -mx-2">
          {weeklyData.map((day, index) => (
            <Fragment key={formatDateToYYYYMMDD(day.date)}>
              <DayProgress
                date={day.date}
                total={day.total}
                completed={day.completed}
                goals={day.goals}
                isSelected={
                  formatDateToYYYYMMDD(day.date) ===
                  formatDateToYYYYMMDD(selectedDate)
                }
                onClick={() => setSelectedDate(day.date)}
                isCurrentWeek={isCurrentWeek(currentWeekStart)}
              />
              {index < weeklyData.length - 1 && (
                <DaySeparator
                  key={`separator-${formatDateToYYYYMMDD(day.date)}`}
                  total={day.total}
                  completed={day.completed}
                />
              )}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
