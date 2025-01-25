import { Goal } from "lucide-react";
import { UserMenu } from "./user-menu";
import { NewGoalDialog } from "./new-goal-dialog";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center gap-2">
          <Goal className="h-6 w-6" />
          <span className="font-semibold">Aimly</span>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <NewGoalDialog />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
