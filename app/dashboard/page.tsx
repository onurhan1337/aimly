import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Progress } from "@/components/progress";
import { GoalsList } from "@/components/goals-list";
import { MotivationalMessage } from "@/components/motivational-message";
import { GoalSuggestions } from "@/components/goal-suggestions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get today's goals
  const { data: todayGoals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("target_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false });

  // Get this week's goals
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const { data: weeklyGoals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .gte("target_date", startOfWeek.toISOString().split("T")[0])
    .lte("target_date", endOfWeek.toISOString().split("T")[0]);

  // Calculate streak
  const { data: streakGoals } = await supabase
    .from("goals")
    .select("target_date, completed")
    .eq("user_id", user.id)
    .order("target_date", { ascending: false });

  let streak = 0;
  if (streakGoals) {
    const today = new Date().toISOString().split("T")[0];
    const groupedByDate = streakGoals.reduce(
      (acc, goal) => {
        if (!acc[goal.target_date]) {
          acc[goal.target_date] = [];
        }
        acc[goal.target_date].push(goal);
        return acc;
      },
      {} as Record<string, typeof streakGoals>
    );

    let currentDate = new Date(today);
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayGoals = groupedByDate[dateStr];

      if (!dayGoals || dayGoals.length === 0) break;
      if (!dayGoals.every((goal) => goal.completed)) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  const todayTotal = todayGoals?.length || 0;
  const todayCompleted =
    todayGoals?.filter((goal) => goal.completed).length || 0;
  const weeklyTotal = weeklyGoals?.length || 0;
  const weeklyCompleted =
    weeklyGoals?.filter((goal) => goal.completed).length || 0;

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <MotivationalMessage />
            <GoalsList goals={todayGoals || []} />
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
