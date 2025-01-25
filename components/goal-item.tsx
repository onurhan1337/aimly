"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  editGoalAction,
  removeGoalAction,
  toggleGoalAction,
} from "@/app/actions";
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

interface GoalItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export function GoalItem({ id, title, description, completed }: GoalItemProps) {
  const [isPending, startTransition] = useTransition();

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
        toast.success("Goal removed successfully");
      } catch (error) {
        toast.error("Failed to remove goal");
      }
    });
  };

  const handleToggle = async (checked: boolean) => {
    const formData = new FormData();
    formData.append("goalId", id);
    formData.append("completed", checked ? "true" : "false");
    await toggleGoalAction(formData);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-2">
          <form action={toggleGoalAction}>
            <input type="hidden" name="goalId" value={id} />
            <Checkbox checked={completed} onCheckedChange={handleToggle} />
          </form>
          <div className="flex-1">
            <CardTitle
              className={`text-lg ${
                completed ? "line-through opacity-50" : ""
              }`}
            >
              {title.length > 20 ? title.slice(0, 20) + "..." : title}
            </CardTitle>
            {description && (
              <p
                className={`mt-1 text-sm text-muted-foreground ${
                  completed ? "line-through opacity-50" : ""
                }`}
              >
                {description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </CardHeader>
    </Card>
  );
}
