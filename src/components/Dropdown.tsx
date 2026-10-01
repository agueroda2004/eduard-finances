import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useDropdown } from "../hooks/useDropdown";
import { cn } from "../utils/cn";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Dropdown<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = "Selecciona...",
  id,
  invalid,
  disabled,
  className,
}: DropdownProps<T>) {
  const { open, toggle, close, triggerRef, menuRef, position } = useDropdown();
  const menuId = useId();
  const selected = options.find((option) => option.value === value);

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
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
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
                    <span className="truncate">{option.label}</span>
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
