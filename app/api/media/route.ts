import { env } from "cloudflare:workers";

const ADMIN_KEY = "paatram-studio-7m4x";

export async function POST(request: Request) {
  if (request.headers.get("x-paatram-admin") !== ADMIN_KEY) return Response.json({ error: "Not found" }, { status: 404 });
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "Choose a valid image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Image must be under 8 MB." }, { status: 400 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const key = `${crypto.randomUUID()}.${extension}`;
  await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return Response.json({ url: `/api/media/${key}` }, { status: 201 });
}
