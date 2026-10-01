import { Wallet } from "lucide-react";
import { cn } from "../utils/cn";

type LogoSize = "sm" | "md";

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  className?: string;
}

const badgeClasses: Record<LogoSize, string> = {
  sm: "size-10 rounded-2xl",
  md: "size-12 rounded-2xl",
};

const iconClasses: Record<LogoSize, string> = {
  sm: "size-5",
  md: "size-6",
};

export function Logo({ size = "md", withText = false, className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex items-center justify-center bg-primary text-primary-foreground",
          badgeClasses[size],
        )}
      >
        <Wallet className={iconClasses[size]} />
      </span>
      {withText ? (
        <span className="text-lg font-semibold text-foreground">Eduard</span>
      ) : null}
    </span>
  );
}
