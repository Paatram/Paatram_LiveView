export async function DELETE() {
  return Response.json({ error: "Admin storage is temporarily read-only while the Vercel database is connected." }, { status: 503 });
}
