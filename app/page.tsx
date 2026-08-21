import CatalogueClient from "./catalogue-client";
import { listProducts } from "../db/products";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export default async function Home() {
  let products: Awaited<ReturnType<typeof listProducts>> | null = null;

  try {
    products = await listProducts();
  } catch {
    // The client keeps the existing API fallback for temporary database errors.
  }

  return <CatalogueClient initialProducts={products} />;
}
