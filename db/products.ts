import { getSql } from "./index";

export type ProductRecord = {
  id: string;
  name: string;
  pricePaise: number;
  material: string;
  size: string;
  care: string;
  imageUrl: string;
  available: boolean;
  sortOrder: number;
};

type ProductRow = {
  id: string;
  name: string;
  price_paise: number;
  material: string;
  size: string;
  care: string;
  image_url: string;
  available: boolean;
  sort_order: number;
};

const seeds: ProductRecord[] = [
  { id: "kansa-serving-bowl", name: "Kansa Serving Bowl", pricePaise: 245000, material: "Hand-finished bell metal", size: "22 cm × 8 cm", care: "Hand wash with mild soap. Dry immediately.", imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 1 },
  { id: "terracotta-carafe", name: "Terracotta Carafe", pricePaise: 128000, material: "Naturally cooled, unglazed clay", size: "1.2 L", care: "Rinse and air dry after use.", imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 2 },
  { id: "stoneware-dinner-plate", name: "Stoneware Dinner Plate", pricePaise: 89000, material: "Speckled glaze, wheel-thrown", size: "27 cm", care: "Dishwasher safe on a gentle cycle.", imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 3 },
  { id: "hammered-brass-katori", name: "Hammered Brass Katori", pricePaise: 75000, material: "Food-safe, hand-hammered brass", size: "11 cm × 5 cm", care: "Hand wash and dry immediately.", imageUrl: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 4 },
];

export async function ensureProducts() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_paise INTEGER NOT NULL,
    material TEXT NOT NULL,
    size TEXT NOT NULL,
    care TEXT NOT NULL,
    image_url TEXT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_available_sort ON products (available, sort_order)`;

  const counts = await sql`SELECT COUNT(*)::int AS total FROM products` as unknown as Array<{ total: number }>;
  if (Number(counts[0]?.total ?? 0) === 0) {
    for (const product of seeds) {
      await sql`INSERT INTO products (id, name, price_paise, material, size, care, image_url, available, sort_order)
        VALUES (${product.id}, ${product.name}, ${product.pricePaise}, ${product.material}, ${product.size}, ${product.care}, ${product.imageUrl}, ${product.available}, ${product.sortOrder})
        ON CONFLICT (id) DO NOTHING`;
    }
  }
}

function mapRow(row: ProductRow): ProductRecord {
  return { id: row.id, name: row.name, pricePaise: row.price_paise, material: row.material, size: row.size, care: row.care, imageUrl: row.image_url, available: row.available, sortOrder: row.sort_order };
}

export async function listProducts(includeUnavailable = false) {
  await ensureProducts();
  const sql = getSql();
  const rows = includeUnavailable
    ? await sql`SELECT id, name, price_paise, material, size, care, image_url, available, sort_order FROM products ORDER BY sort_order, created_at DESC`
    : await sql`SELECT id, name, price_paise, material, size, care, image_url, available, sort_order FROM products WHERE available = TRUE ORDER BY sort_order, created_at DESC`;
  return (rows as unknown as ProductRow[]).map(mapRow);
}

export async function createProduct(product: ProductRecord) {
  await ensureProducts();
  const sql = getSql();
  await sql`INSERT INTO products (id, name, price_paise, material, size, care, image_url, available, sort_order)
    VALUES (${product.id}, ${product.name}, ${product.pricePaise}, ${product.material}, ${product.size}, ${product.care}, ${product.imageUrl}, ${product.available}, ${product.sortOrder})`;
  return product;
}

export async function deleteProduct(id: string) {
  await ensureProducts();
  const sql = getSql();
  const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING image_url` as unknown as Array<{ image_url: string }>;
  return rows[0]?.image_url ?? null;
}
