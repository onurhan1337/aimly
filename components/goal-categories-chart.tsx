"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { categorizeGoalsAction } from "@/app/actions";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface Category {
  name: string;
  value: number;
}

const chartConfig = {
  goals: {
    label: "Goals",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function GoalCategoriesChart() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<{
    direction: "up" | "down" | null;
    percentage: number;
    dominantCategory: string;
  }>({
    direction: null,
    percentage: 0,
    dominantCategory: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categorizeGoalsAction();
        setCategories(result.categories);

        // Calculate dominant category and trend
        const total = result.categories.reduce(
          (sum: number, cat: Category) => sum + cat.value,
          0
        );
        const dominant = result.categories.reduce(
          (max: Category, cat: Category) => (cat.value > max.value ? cat : max)
        );

        const percentage = total > 0 ? (dominant.value / total) * 100 : 0;
        setTrend({
          direction: percentage > 30 ? "up" : "down",
          percentage: Math.round(percentage),
          dominantCategory: dominant.name,
        });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>Goal Categories</CardTitle>
          <CardDescription>Loading your goal distribution...</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Goal Categories</CardTitle>
        <CardDescription>
          Distribution of your goals across different areas
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={categories}
              margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number) => [`${value} goals`, "Goals"]}
              />
              <PolarAngleAxis
                dataKey="name"
                tick={{
                  fill: "hsl(var(--foreground))",
                  fontSize: 12,
                  dy: 3,
                }}
                tickLine={false}
              />
              <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Radar
                name="Goals"
                dataKey="value"
                stroke="var(--color-desktop)"
                fill="var(--color-desktop)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {trend.direction && (
          <div className="flex items-center gap-2 font-medium leading-none">
            {trend.dominantCategory} is your focus area
            {trend.direction === "up" ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {categories.reduce(
            (sum: number, cat: Category) => sum + cat.value,
            0
          )}{" "}
          total goals tracked
        </div>
      </CardFooter>
    </Card>
  );
}
