import { isAdmin, unauthorized } from "../../../lib/admin-auth";
import { createProduct, listProducts } from "../../../db/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const wantsAll = new URL(request.url).searchParams.get("all") === "1";
    if (wantsAll && !(await isAdmin(request))) return unauthorized();
    return Response.json(await listProducts(wantsAll), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Product database is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const input = await request.json() as Record<string, unknown>;
  const required = ["name", "material", "size", "care", "imageUrl"];
  if (required.some((key) => typeof input[key] !== "string" || !String(input[key]).trim()) || !Number.isFinite(Number(input.pricePaise))) {
    return Response.json({ error: "Please complete every product field." }, { status: 400 });
  }
  try {
    const product = await createProduct({
      id: crypto.randomUUID(),
      name: String(input.name).trim(),
      pricePaise: Math.max(0, Math.round(Number(input.pricePaise))),
      material: String(input.material).trim(),
      size: String(input.size).trim(),
      care: String(input.care).trim(),
      imageUrl: String(input.imageUrl).trim(),
      available: input.available !== false,
      sortOrder: Number(input.sortOrder) || Date.now(),
    });
    return Response.json(product, { status: 201 });
  } catch {
    return Response.json({ error: "Could not save the product." }, { status: 503 });
  }
}
