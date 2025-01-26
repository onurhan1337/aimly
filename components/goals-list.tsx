"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalItem } from "@/components/goal-item";
import { Flag, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useGoals } from "@/lib/hooks/use-goals";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GoalCategoriesChart } from "@/components/goal-categories-chart";

export function GoalsList() {
  const [date, setDate] = useState<Date>(new Date());
  const { goals, mutateGoals } = useGoals(date.toISOString().split("T")[0]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Goals
          </CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-auto justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!goals || goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-lg font-medium">No goals for this day</p>
            <p className="text-sm text-muted-foreground">
              Click the "New Goal" button to create one
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4">
              {goals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  id={goal.id}
                  title={goal.title}
                  description={goal.description || undefined}
                  completed={goal.completed}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
