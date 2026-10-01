import { createBrowserRouter, Navigate } from "react-router";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { LoginPage } from "../features/auth/page/LoginPage";
import { HomePage } from "../pages/HomePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [{ path: "/", element: <HomePage /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
