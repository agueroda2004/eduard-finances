export type DataSource = "local" | "server";

function resolveDataSource(): DataSource {
  const value = import.meta.env.VITE_DATA_SOURCE;
  if (value === "local" || value === "server") {
    return value;
  }
  return import.meta.env.DEV ? "local" : "server";
}

export const env = {
  dataSource: resolveDataSource(),
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
} as const;
