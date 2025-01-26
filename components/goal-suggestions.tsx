import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, RefreshCw } from "lucide-react";
import { addSuggestionAsGoalAction, getSuggestionsAction } from "@/app/actions";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";

interface Suggestion {
  title: string;
  description: string;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export function GoalSuggestions() {
  const { data, error, isLoading, mutate } = useSWR<SuggestionsResponse>(
    "suggestions",
    async () => getSuggestionsAction()
  );

  const addGoal = async (suggestion: Suggestion) => {
    try {
      await addSuggestionAsGoalAction(suggestion);
      const today = new Date().toISOString().split("T")[0];
      await Promise.all([mutate(), globalMutate(["goals", today])]);
      toast.success("Goal added successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add goal";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Suggestions
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => mutate()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Based on your interests and past goals, here are some suggestions for
          today:
        </p>
        {error ? (
          <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load suggestions"}
          </div>
        ) : !data?.suggestions && !isLoading ? (
          <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
            No suggestions available. Try refreshing.
          </div>
        ) : (
          <div className="space-y-2">
            {data?.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <span className="text-sm font-medium">
                    {suggestion.title}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => addGoal(suggestion)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
