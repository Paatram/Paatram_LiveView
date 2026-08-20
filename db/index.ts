/**
 * Database adapter placeholder for the Vercel deployment.
 * The persistent provider will be connected in the backend setup step.
 */
export function getDb(): never {
  throw new Error("Vercel database is not configured yet.");
}
