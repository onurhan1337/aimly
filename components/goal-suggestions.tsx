import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, RefreshCw, Star } from "lucide-react";
import {
  addSuggestionAsGoalAction,
  getSuggestionsAction,
  toggleFavoriteSuggestionAction,
  getFavoriteSuggestionsAction,
} from "@/app/actions";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Suggestion {
  id: string;
  title: string;
  description: string;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export function GoalSuggestions() {
  const { data, error, isLoading, mutate } = useSWR<SuggestionsResponse>(
    "suggestions",
    async () => getSuggestionsAction(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { data: favorites = [], mutate: mutateFavorites } = useSWR(
    "favorite-suggestions",
    getFavoriteSuggestionsAction
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

  const toggleFavorite = async (suggestionId: string) => {
    try {
      await toggleFavoriteSuggestionAction(suggestionId);
      await mutateFavorites();
      toast.success("Favorites updated");
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const refreshSuggestions = async () => {
    try {
      await mutate();
      toast.success("Suggestions refreshed");
    } catch (error) {
      toast.error("Failed to refresh suggestions");
    }
  };

  const isFavorite = (suggestionId: string) => {
    return favorites.some((fav: any) => fav.id === suggestionId);
  };

  const renderSuggestionList = (suggestions: Suggestion[]) => {
    if (!suggestions.length) {
      return (
        <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
          No suggestions available
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group relative rounded-lg border bg-card transition-all hover:bg-accent/5"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium leading-none truncate">
                      {suggestion.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${
                        isFavorite(suggestion.id)
                          ? ""
                          : "opacity-0 group-hover:opacity-100"
                      } transition-opacity`}
                      onClick={() => toggleFavorite(suggestion.id)}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          isFavorite(suggestion.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 self-start -mt-0.5"
                  onClick={() => addGoal(suggestion)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
            onClick={refreshSuggestions}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions">
          <TabsList className="mb-4">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <TabsContent value="suggestions">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on your interests and past goals, here are some
                suggestions for today:
              </p>
              {error ? (
                <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
                  {error instanceof Error
                    ? error.message
                    : "Failed to load suggestions"}
                </div>
              ) : isLoading ? (
                <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                  Loading suggestions...
                </div>
              ) : (
                renderSuggestionList(data?.suggestions || [])
              )}
            </div>
          </TabsContent>
          <TabsContent value="favorites">
            {renderSuggestionList(favorites)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
