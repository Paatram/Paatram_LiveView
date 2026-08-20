import { deleteProduct } from "../../../../db/products";

const ADMIN_KEY = "paatram-studio-7m4x";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (request.headers.get("x-paatram-admin") !== ADMIN_KEY) return Response.json({ error: "Not found" }, { status: 404 });
  const { id } = await context.params;
  await deleteProduct(id);
  return new Response(null, { status: 204 });
}
