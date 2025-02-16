"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { Progress } from "@/components/progress";
import { GoalsList } from "@/components/goals-list";
import { MotivationalMessage } from "@/components/motivational-message";
import { GoalSuggestions } from "@/components/goal-suggestions";
import { WeeklyProgress } from "@/components/weekly-progress";
import { useEffect } from "react";
import { useGoals, useWeeklyGoals } from "@/lib/hooks/use-goals";
import { GoalCategoriesChart } from "@/components/goal-categories-chart";
import { format } from "date-fns";

export default function DashboardPage() {
  const today = new Date();

  const {
    goals: todayGoals,
    total: todayTotal,
    completed: todayCompleted,
    streak,
  } = useGoals(format(today, "yyyy-MM-dd"));

  const { total: weeklyTotal, completed: weeklyCompleted } = useWeeklyGoals();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        redirect("/sign-in");
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <WeeklyProgress />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <MotivationalMessage />
            <GoalsList />
            <GoalCategoriesChart />
          </div>
          <div className="flex flex-col gap-4">
            <GoalSuggestions />
            <Progress
              todayTotal={todayTotal}
              todayCompleted={todayCompleted}
              weeklyTotal={weeklyTotal}
              weeklyCompleted={weeklyCompleted}
              streak={streak}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
