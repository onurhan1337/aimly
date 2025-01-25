"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { Progress } from "@/components/progress";
import { GoalsList } from "@/components/goals-list";
import { MotivationalMessage } from "@/components/motivational-message";
import { GoalSuggestions } from "@/components/goal-suggestions";
import { useEffect } from "react";
import { useGoals } from "@/lib/hooks/use-goals";

export default function DashboardPage() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const {
    goals: todayGoals,
    total: todayTotal,
    completed: todayCompleted,
    streak,
  } = useGoals();
  const {
    goals: weeklyGoals,
    total: weeklyTotal,
    completed: weeklyCompleted,
  } = useGoals();

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
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <MotivationalMessage />
            <GoalsList />
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
