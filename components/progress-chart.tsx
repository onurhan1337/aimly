import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { startOfWeek, format } from "date-fns";
import { useGoals } from "@/lib/hooks/use-goals";
import {
  getWeekDates,
  normalizeDate,
  formatDateToYYYYMMDD,
} from "@/lib/utils/date";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ProgressChart() {
  const currentWeekStart = normalizeDate(
    startOfWeek(new Date(), { weekStartsOn: 1 })
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

  const chartData = weeklyData.map((day) => ({
    name: format(day.date, "EEE"),
    total: day.total,
    completed: day.completed,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="completedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--success))"
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--success))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                fill="url(#totalGradient)"
                strokeWidth={2}
                name="Total Goals"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--success))"
                fill="url(#completedGradient)"
                strokeWidth={2}
                name="Completed Goals"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
