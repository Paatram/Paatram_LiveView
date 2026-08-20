import { findAdminByEmail, registrationIsOpen } from "../../../../db/admins";
import { clearSessionCookie, createSessionCookie, isAdmin, verifyPassword } from "../../../../lib/admin-auth";

export async function GET(request: Request) {
  const authenticated = await isAdmin(request);
  try {
    return Response.json({ authenticated, registrationOpen: authenticated ? false : await registrationIsOpen() });
  } catch {
    return Response.json({ authenticated, registrationOpen: false, error: "Admin database is unavailable." }, { status: authenticated ? 200 : 503 });
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as { email?: string; password?: string };
    const admin = input.email ? await findAdminByEmail(input.email.trim().toLowerCase()) : null;
    if (!admin || !input.password || !(await verifyPassword(input.password, admin.passwordHash, admin.passwordSalt))) {
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    return Response.json({ authenticated: true }, { headers: { "Set-Cookie": await createSessionCookie(admin.id) } });
  } catch {
    return Response.json({ error: "Admin sign-in is temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE() {
  return Response.json({ authenticated: false }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
