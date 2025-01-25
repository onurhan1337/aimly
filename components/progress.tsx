"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { BarChart as ChartBar } from "lucide-react";

interface ProgressProps {
  todayTotal: number;
  todayCompleted: number;
  weeklyTotal: number;
  weeklyCompleted: number;
  streak: number;
}

export function Progress({
  todayTotal,
  todayCompleted,
  weeklyTotal,
  weeklyCompleted,
  streak,
}: ProgressProps) {
  const todayProgress = (todayCompleted / todayTotal) * 100;
  const weeklyProgress = (weeklyCompleted / weeklyTotal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBar className="h-5 w-5" />
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today's Goals</span>
            <span className="text-muted-foreground">
              {todayCompleted}/{todayTotal} completed
            </span>
          </div>
          <ProgressBar value={todayProgress} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Weekly Goals</span>
            <span className="text-muted-foreground">
              {weeklyCompleted}/{weeklyTotal} completed
            </span>
          </div>
          <ProgressBar value={weeklyProgress} />
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Current Streak</div>
          <div className="mt-1 text-2xl font-bold">{streak} Days</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Keep it up! You're building great habits.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
