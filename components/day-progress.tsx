import { CheckCircle2, Clock, Target, Trophy } from "lucide-react";
import { format, isDateToday } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Goal {
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
}

interface DayProgressProps {
  date: Date;
  total: number;
  completed: number;
  goals: Goal[];
  isSelected: boolean;
  onClick: () => void;
  isCurrentWeek: boolean;
}

export function DayProgress({
  date,
  total,
  completed,
  goals,
  isSelected,
  onClick,
  isCurrentWeek,
}: DayProgressProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isToday = isDateToday(date);
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

  const groupedGoals = {
    completed: goals
      .filter((g) => g.completed)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    pending: goals
      .filter((g) => !g.completed)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex-1 flex flex-col items-center p-4 rounded-lg transition-all min-w-[120px] mx-2",
            "border border-transparent hover:border-primary/20",
            isToday && "bg-primary/5 border-primary/30",
            isSelected && "bg-primary/10 border-primary/40",
            "hover:bg-primary/5",
            !isCurrentWeek && "opacity-70",
            isPast && total === 0 && "opacity-50"
          )}
          onClick={onClick}
        >
          <span
            className={cn("text-sm font-medium", isToday && "text-primary")}
          >
            {format(date, "EEE")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, "d")}
          </span>
          {total > 0 ? (
            <div className="mt-2 relative">
              <div className="w-12 h-12 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: `hsl(var(--primary))`,
                    opacity: 0.2,
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary transition-all duration-300"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${progress >= 25 ? "100% 0%" : `${progress * 4}% 0%`}, ${progress >= 50 ? "100% 100%" : "100% 0%"}, ${progress >= 75 ? "0% 100%" : "100% 100%"}, ${progress >= 100 ? "0% 0%" : "0% 100%"}, 50% 0%)`,
                  }}
                />
                <span className="text-xs font-medium z-10">
                  {completed}/{total}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 w-12 h-12 rounded-full border-2 border-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">0</span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="center">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{format(date, "EEEE")}</div>
              <div className="text-sm text-muted-foreground">
                {format(date, "MMMM d, yyyy")}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-primary" />
              <span>
                {completed}/{total} completed
              </span>
            </div>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3">
              {groupedGoals.pending.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
                  </div>
                  {groupedGoals.pending.map((goal, idx) => (
                    <div key={idx} className="text-sm p-2 rounded-lg bg-muted">
                      <div className="flex items-start justify-between gap-2">
                        <span>{goal.title}</span>
                      </div>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {groupedGoals.completed.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                  {groupedGoals.completed.map((goal, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-2 rounded-lg bg-primary/5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-through opacity-70">
                          {goal.title}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      </div>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-through opacity-70">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-6 space-y-2">
              <Target className="h-8 w-8 mx-auto opacity-50" />
              <p>No goals for this day</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
