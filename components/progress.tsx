"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals } from "@/lib/hooks/use-goals";
import { startOfWeek, addDays } from "date-fns";

interface ProgressProps {
  todayTotal: number;
  todayCompleted: number;
  weeklyTotal: number;
  weeklyCompleted: number;
  streak: number;
}

function CircularProgress({
  value,
  max,
  label,
  icon: Icon,
}: {
  value: number;
  max: number;
  label: string;
  icon: React.ElementType;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg className="h-24 w-24 -rotate-90">
          {/* Background circle */}
          <circle
            className="text-muted-foreground/20"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          {/* Progress circle */}
          <circle
            className={cn(
              "transition-all duration-300 ease-in-out",
              percentage >= 100 ? "text-green-500" : "text-primary"
            )}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <Icon
            className={cn(
              "h-6 w-6",
              percentage >= 100 ? "text-green-500" : "text-primary"
            )}
          />
          <span className="mt-1 text-xl font-bold">
            {value}/{max}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="mt-1 h-1 w-16 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              percentage >= 100 ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Progress({
  todayTotal,
  todayCompleted,
  weeklyTotal,
  weeklyCompleted,
  streak,
}: ProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8 py-4">
          <CircularProgress
            value={todayCompleted}
            max={todayTotal}
            label="Today's Goals"
            icon={Target}
          />
          <CircularProgress
            value={weeklyCompleted}
            max={weeklyTotal}
            label="Weekly Goals"
            icon={Trophy}
          />
        </div>
        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-full p-2",
                streak > 0 ? "bg-primary/20" : "bg-muted"
              )}
            >
              <Flame
                className={cn(
                  "h-5 w-5",
                  streak > 0 ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <div className="text-2xl font-bold">{streak} Days</div>
              <div className="text-sm text-muted-foreground">
                {streak > 0
                  ? "Keep the streak going! You're building great habits."
                  : "Start your streak today by completing your goals!"}
              </div>
            </div>
          </div>
          {streak > 0 && (
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
