import { put } from "@vercel/blob";
import { isAdmin, unauthorized } from "../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "Choose a valid image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Image must be under 8 MB." }, { status: 400 });
  try {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "") || "product.jpg";
    const blob = await put(`products/${crypto.randomUUID()}-${safeName}`, file, { access: "public", addRandomSuffix: false });
    return Response.json({ url: blob.url }, { status: 201 });
  } catch {
    return Response.json({ error: "Image storage is unavailable." }, { status: 503 });
  }
}
