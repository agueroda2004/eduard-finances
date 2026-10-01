import { useId } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { useDropdown } from "../hooks/useDropdown";
import { cn } from "../utils/cn";
import { getContrastColor } from "../utils/color";

export interface IconDropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface IconDropdownProps<T extends string = string> {
  value: T | null;
  options: IconDropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

function OptionBadge({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: color }}
    >
      <Icon className="size-4" style={{ color: getContrastColor(color) }} />
    </span>
  );
}

export function IconDropdown<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = "Selecciona...",
  id,
  invalid,
  disabled,
  className,
}: IconDropdownProps<T>) {
  const { open, toggle, close, triggerRef, menuRef, position } = useDropdown();
  const menuId = useId();
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-danger" : "border-border",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <OptionBadge icon={selected.icon} color={selected.color} />
          ) : null}
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="listbox"
              style={{
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
              }}
              className="animate-dropdown-in fixed z-[70] max-h-60 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg"
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <OptionBadge icon={option.icon} color={option.color} />
                      <span className="truncate">{option.label}</span>
                    </span>
                    {isSelected ? <Check className="size-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
