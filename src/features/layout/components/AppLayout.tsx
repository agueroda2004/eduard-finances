import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [openedPath, setOpenedPath] = useState(location.pathname);

  const isOpen = open && openedPath === location.pathname;

  function openSidebar() {
    setOpenedPath(location.pathname);
    setOpen(true);
  }

  function closeSidebar() {
    setOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar open={isOpen} onClose={closeSidebar} />

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={closeSidebar}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={openSidebar} menuOpen={isOpen} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
