import { Goal, Target } from "lucide-react";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center gap-2">
          <Goal className="h-6 w-6" />
          <span className="font-semibold">Aimly</span>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <Button variant="secondary" size="sm" className="ml-auto flex gap-2">
            <Target className="h-4 w-4" />
            New Goal
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
