import { createBrowserRouter, Navigate } from "react-router";
import { RequireAuth } from "../features/auth";
import { LoginPage } from "../features/auth/page/LoginPage";
import { AccountsPage } from "../features/account/page/AccountsPage";
import { AppLayout } from "../features/layout";
import { HomePage } from "../pages/HomePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/accounts", element: <AccountsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
