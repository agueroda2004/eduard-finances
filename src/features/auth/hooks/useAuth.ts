import { useAuth as useClerkAuth, useUser } from "@clerk/react";

export function useAuth() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useClerkAuth();
  const { user } = useUser();

  return { isLoaded, isSignedIn, userId, sessionId, getToken, user };
}
