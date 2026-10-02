import { createBrowserRouter, Navigate } from "react-router";
import { RequireAuth } from "../features/auth";
import { LoginPage } from "../features/auth/page/LoginPage";
import { AccountsPage } from "../features/account/page/AccountsPage";
import { CategoriesPage } from "../features/category";
import { AppLayout } from "../features/layout";
import { DashboardPage } from "../features/dashboard";
import { TransactionsPage } from "../features/transaction";
import { TransfersPage } from "../features/transfer";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/accounts", element: <AccountsPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/transfers", element: <TransfersPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
