import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function MotivationalMessage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Quote className="h-6 w-6 text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              "Small steps lead to big changes. You're doing great!"
            </p>
            <p className="text-sm text-muted-foreground">
              Keep going! You've completed 3 goals this week.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
