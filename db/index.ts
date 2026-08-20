import { neon } from "@neondatabase/serverless";

let databaseClient: ReturnType<typeof neon> | null = null;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  databaseClient ??= neon(databaseUrl);
  return databaseClient;
}
