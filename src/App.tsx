import { ClerkProvider } from "@clerk/react";
import { RouterProvider } from "react-router";
import { NotificationsProvider } from "./features/notifications";
import { router } from "./routes/router";

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <NotificationsProvider>
        <RouterProvider router={router} />
      </NotificationsProvider>
    </ClerkProvider>
  );
}
