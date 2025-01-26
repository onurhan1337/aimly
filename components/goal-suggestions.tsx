import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { createGoalAction } from "@/app/actions";
import { toast } from "sonner";

interface Suggestion {
  title: string;
  description: string;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
  error?: string;
  details?: string;
}

export function GoalSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
      });

      const data: SuggestionsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to fetch suggestions"
        );
      }

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load suggestions";
      console.error("Error fetching suggestions:", error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async (suggestion: Suggestion) => {
    const formData = new FormData();
    formData.append("title", suggestion.title);
    formData.append("description", suggestion.description);

    try {
      await createGoalAction(formData);
      toast.success("Goal added successfully");
    } catch (error) {
      toast.error("Failed to add goal");
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

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
            onClick={fetchSuggestions}
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
            {error}
          </div>
        ) : suggestions.length === 0 && !isLoading ? (
          <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
            No suggestions available. Try refreshing.
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
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
