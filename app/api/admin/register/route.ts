import { createFirstAdmin, registrationIsOpen } from "../../../../db/admins";
import { createSessionCookie, hashPassword } from "../../../../lib/admin-auth";

export async function GET() {
  try {
    return Response.json({ registrationOpen: await registrationIsOpen() });
  } catch {
    return Response.json({ error: "Admin database is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await registrationIsOpen())) return Response.json({ error: "An admin account already exists. Please sign in." }, { status: 409 });
    const input = await request.json() as { name?: string; email?: string; password?: string };
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password ?? "";
    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid name and email address." }, { status: 400 });
    if (password.length < 10) return Response.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
    const credentials = await hashPassword(password);
    const admin = await createFirstAdmin({ id: crypto.randomUUID(), name, email, passwordHash: credentials.hash, passwordSalt: credentials.salt });
    return Response.json({ authenticated: true }, { status: 201, headers: { "Set-Cookie": await createSessionCookie(admin.id) } });
  } catch (error) {
    if (error instanceof Error && error.message === "REGISTRATION_CLOSED") return Response.json({ error: "An admin account already exists. Please sign in." }, { status: 409 });
    return Response.json({ error: "Could not create the admin account." }, { status: 503 });
  }
}
