import useSWR from "swr";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  target_date: string;
  created_at: string;
  date: string;
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

export function useWeeklyGoals() {
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyGoals = async () => {
      const supabase = createClient();
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const { data: goals, error } = await supabase
        .from("goals")
        .select("*")
        .gte("target_date", format(weekStart, "yyyy-MM-dd"))
        .lte("target_date", format(weekEnd, "yyyy-MM-dd"))
        .order("target_date", { ascending: true });

      if (error) {
        console.error("Error fetching weekly goals:", error);
        return;
      }

      setWeeklyGoals(goals || []);
      setIsLoading(false);
    };

    fetchWeeklyGoals();
  }, []);

  const total = weeklyGoals.length;
  const completed = weeklyGoals.filter((goal) => goal.completed).length;

  return {
    goals: weeklyGoals,
    total,
    completed,
    isLoading,
  };
}
