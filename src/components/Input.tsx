import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

interface InputProps extends ComponentProps<"input"> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border bg-surface px-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-danger" : "border-border",
        className,
      )}
      {...props}
    />
  );
}
