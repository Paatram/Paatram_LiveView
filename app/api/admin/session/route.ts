import { clearSessionCookie, createSessionCookie, isAdmin, passwordIsValid } from "../../../../lib/admin-auth";

export async function GET(request: Request) {
  return Response.json({ authenticated: await isAdmin(request) }, { status: await isAdmin(request) ? 200 : 401 });
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as { password?: string };
    if (!input.password || !(await passwordIsValid(input.password))) return Response.json({ error: "Incorrect password." }, { status: 401 });
    return Response.json({ authenticated: true }, { headers: { "Set-Cookie": await createSessionCookie() } });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("configured") ? "Admin access is not configured yet." : "Could not sign in.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE() {
  return Response.json({ authenticated: false }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
