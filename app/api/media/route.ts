export async function POST() {
  return Response.json({ error: "Image uploads will be enabled when Vercel storage is connected." }, { status: 503 });
}
