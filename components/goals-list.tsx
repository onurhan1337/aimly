import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalItem } from "@/components/goal-item";
import { Flag } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
}

interface GoalsListProps {
  goals: Goal[];
}

export function GoalsList({ goals }: GoalsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Daily Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-lg font-medium">No goals for today</p>
            <p className="text-sm text-muted-foreground">
              Click the "New Goal" button to create one
            </p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
