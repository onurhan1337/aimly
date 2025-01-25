"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { editGoalAction, removeGoalAction } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { EditGoalDialog } from "./edit-goal-dialog";
import { toast } from "sonner";
import { useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useGoals } from "@/lib/hooks/use-goals";

interface GoalItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export function GoalItem({ id, title, description, completed }: GoalItemProps) {
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const { mutateGoals } = useGoals();

  const handleEdit = async (
    goalId: string,
    newTitle: string,
    newDescription: string
  ) => {
    const formData = new FormData();
    formData.append("goalId", goalId);
    formData.append("title", newTitle);
    formData.append("description", newDescription);

    startTransition(async () => {
      try {
        await editGoalAction(formData);
        await Promise.all([mutateGoals()]);
      } catch (error) {
        throw error;
      }
    });
  };

  const handleRemove = async () => {
    const formData = new FormData();
    formData.append("goalId", id);

    startTransition(async () => {
      try {
        await removeGoalAction(formData);
        await Promise.all([mutateGoals()]);
        toast.success("Goal removed successfully");
      } catch (error) {
        toast.error("Failed to remove goal");
      }
    });
  };

  const toggleComplete = async () => {
    if (completed) return;

    try {
      await supabase.from("goals").update({ completed: true }).eq("id", id);
      await Promise.all([mutateGoals()]);
      toast.success("Goal completed! 🎉");
    } catch (error) {
      toast.error("Failed to update goal status");
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border p-4">
      <Checkbox
        checked={completed}
        onCheckedChange={toggleComplete}
        className={cn("cursor-pointer", completed && "cursor-not-allowed")}
        disabled={completed}
      />
      <div className="flex-1">
        <h3
          className={cn("font-medium", completed && "line-through opacity-50")}
        >
          {title.length > 20 ? title.slice(0, 20) + "..." : title}
        </h3>
        {description && (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              completed && "line-through opacity-50"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!completed && (
            <EditGoalDialog
              id={id}
              title={title}
              description={description}
              onEdit={handleEdit}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
            />
          )}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={handleRemove}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
