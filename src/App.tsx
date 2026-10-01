import { ClerkProvider } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { AuthTokenBridge } from "./config/AuthTokenBridge";
import { queryClient } from "./config/query-client";
import { NotificationsProvider } from "./features/notifications";
import { ThemeProvider } from "./features/theme";
import { router } from "./routes/router";

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <AuthTokenBridge />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
