interface DaySeparatorProps {
  total: number;
  completed: number;
}

export function DaySeparator({ total, completed }: DaySeparatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center justify-center h-full py-2 px-4">
      <div className="h-full w-[2px] bg-border/30 rounded-full relative">
        <div
          className="absolute bottom-0 left-0 w-full bg-primary/40 rounded-full transition-all duration-300"
          style={{ height: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
