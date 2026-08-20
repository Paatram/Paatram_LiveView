import { del } from "@vercel/blob";
import { isAdmin, unauthorized } from "../../../../lib/admin-auth";
import { deleteProduct } from "../../../../db/products";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(request))) return unauthorized();
  try {
    const { id } = await context.params;
    const imageUrl = await deleteProduct(id);
    if (imageUrl?.includes(".public.blob.vercel-storage.com")) await del(imageUrl).catch(() => undefined);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Could not remove the product." }, { status: 503 });
  }
}
