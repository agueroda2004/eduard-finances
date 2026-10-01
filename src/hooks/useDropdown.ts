import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export interface DropdownPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

export interface UseDropdownResult {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  position: DropdownPosition | null;
}

const GAP = 4;
const MAX_MENU_HEIGHT = 240;

export function useDropdown(): UseDropdownResult {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MAX_MENU_HEIGHT && rect.top > spaceBelow;

    setPosition({
      left: rect.left,
      width: rect.width,
      top: openUp ? undefined : rect.bottom + GAP,
      bottom: openUp ? window.innerHeight - rect.top + GAP : undefined,
    });
  }, []);

  const openMenu = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      openMenu();
    }
  }, [open, close, openMenu]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  return { open, toggle, close, triggerRef, menuRef, position };
}
