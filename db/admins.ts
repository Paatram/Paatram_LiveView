import { getSql } from "./index";

export type AdminRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

type AdminRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
};

export async function ensureAdmins() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function registrationIsOpen() {
  await ensureAdmins();
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*)::int AS total FROM admins` as unknown as Array<{ total: number }>;
  return Number(rows[0]?.total ?? 0) === 0;
}

export async function findAdminByEmail(email: string) {
  await ensureAdmins();
  const sql = getSql();
  const rows = await sql`SELECT id, name, email, password_hash, password_salt FROM admins WHERE email = ${email.toLowerCase()} LIMIT 1` as unknown as AdminRow[];
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, passwordSalt: row.password_salt } satisfies AdminRecord;
}

export async function createFirstAdmin(admin: AdminRecord) {
  if (!(await registrationIsOpen())) throw new Error("REGISTRATION_CLOSED");
  const sql = getSql();
  await sql`INSERT INTO admins (id, name, email, password_hash, password_salt)
    VALUES (${admin.id}, ${admin.name}, ${admin.email.toLowerCase()}, ${admin.passwordHash}, ${admin.passwordSalt})`;
  return admin;
}
