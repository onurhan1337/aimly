import useSWR from "swr";
import { createClient } from "@/utils/supabase/client";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  target_date: string;
  created_at: string;
}

const supabase = createClient();

async function fetchGoals(date: string) {
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("target_date", date)
    .order("created_at", { ascending: false });

  return goals || [];
}

async function fetchWeeklyGoals(startDate: string, endDate: string) {
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .gte("target_date", startDate)
    .lte("target_date", endDate);

  return goals || [];
}

export function useGoals() {
  const today = new Date().toISOString().split("T")[0];

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const { data: todayGoals, mutate: mutateTodayGoals } = useSWR(
    ["goals", today],
    () => fetchGoals(today)
  );

  const { data: weeklyGoals, mutate: mutateWeeklyGoals } = useSWR(
    [
      "weeklyGoals",
      startOfWeek.toISOString().split("T")[0],
      endOfWeek.toISOString().split("T")[0],
    ],
    () =>
      fetchWeeklyGoals(
        startOfWeek.toISOString().split("T")[0],
        endOfWeek.toISOString().split("T")[0]
      )
  );

  const todayTotal = todayGoals?.length || 0;
  const todayCompleted =
    todayGoals?.filter((goal) => goal.completed).length || 0;
  const weeklyTotal = weeklyGoals?.length || 0;
  const weeklyCompleted =
    weeklyGoals?.filter((goal) => goal.completed).length || 0;

  // Calculate streak
  let streak = 0;
  if (weeklyGoals) {
    const groupedByDate = weeklyGoals.reduce(
      (acc, goal) => {
        if (!acc[goal.target_date]) {
          acc[goal.target_date] = [];
        }
        acc[goal.target_date].push(goal);
        return acc;
      },
      {} as Record<string, Goal[]>
    );

    let currentDate = new Date(today);
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayGoals = groupedByDate[dateStr];

      if (!dayGoals || dayGoals.length === 0) break;
      if (!dayGoals.every((goal: Goal) => goal.completed)) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  return {
    todayGoals,
    weeklyGoals,
    todayTotal,
    todayCompleted,
    weeklyTotal,
    weeklyCompleted,
    streak,
    mutateTodayGoals,
    mutateWeeklyGoals,
  };
}
