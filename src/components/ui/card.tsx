import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * shadcn/ui-compatible Card primitives (local copy for portfolio determinism).
 * No dark-mode-by-default: portfolio UI is light, ink-on-paper.
 */
export function Card({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 border border-[var(--line)] bg-[var(--surface)] py-6 text-[var(--ink)] shadow-[0_1px_0_rgba(28,36,32,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-[family-name:var(--font-display)] text-2xl tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-[var(--muted)]", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    />
  );
}
