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

async function fetchStreak(today: string) {
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const { data: dayGoals } = await supabase
      .from("goals")
      .select("*")
      .eq("target_date", dateStr);

    if (!dayGoals || dayGoals.length === 0) break;
    if (!dayGoals.every((goal) => goal.completed)) break;

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function useGoals(date?: string) {
  const today = new Date().toISOString().split("T")[0];
  const targetDate = date || today;

  const { data: goals, mutate: mutateGoals } = useSWR(
    ["goals", targetDate],
    () => fetchGoals(targetDate)
  );

  const { data: streak } = useSWR(["streak", today], () => fetchStreak(today));

  const total = goals?.length || 0;
  const completed = goals?.filter((goal) => goal.completed).length || 0;

  return {
    goals,
    total,
    completed,
    streak: streak || 0,
    mutateGoals,
  };
}
