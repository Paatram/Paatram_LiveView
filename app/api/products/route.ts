import { seedProducts } from "../../../db/products";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(seedProducts, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } });
}

export async function POST() {
  return Response.json({ error: "Admin storage is temporarily read-only while the Vercel database is connected." }, { status: 503 });
}
