"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("relative flex flex-col gap-3", className)}
      style={
        {
          "--chart-1": "var(--primary)",
          "--color-desktop": "hsl(var(--primary))",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      month?: string;
      name?: string;
    };
  }>;
}

export function ChartTooltipContent({
  active,
  payload,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {payload[0]?.payload.name || payload[0]?.payload.month}
          </span>
          <span className="font-bold">
            {payload[0]?.value}
            {payload[0]?.name === "Goals" && " goals"}
          </span>
        </div>
      </div>
    </div>
  );
}

export const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}
    {...props}
  />
));
