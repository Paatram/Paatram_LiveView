import { createProduct, listProducts } from "../../../db/products";

const ADMIN_KEY = "paatram-studio-7m4x";

export async function GET(request: Request) {
  const includeUnavailable = new URL(request.url).searchParams.get("all") === "1" && request.headers.get("x-paatram-admin") === ADMIN_KEY;
  return Response.json(await listProducts(includeUnavailable), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("x-paatram-admin") !== ADMIN_KEY) return Response.json({ error: "Not found" }, { status: 404 });
  const input = await request.json() as Record<string, unknown>;
  const required = ["name", "material", "size", "care", "imageUrl"];
  if (required.some((key) => typeof input[key] !== "string" || !String(input[key]).trim()) || !Number.isFinite(Number(input.pricePaise))) {
    return Response.json({ error: "Please complete every product field." }, { status: 400 });
  }
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
}
