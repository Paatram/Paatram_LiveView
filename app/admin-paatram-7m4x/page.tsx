"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

const ADMIN_KEY = "paatram-studio-7m4x";

type Product = {
  id: string;
  name: string;
  pricePaise: number;
  material: string;
  size: string;
  care: string;
  imageUrl: string;
  available: boolean;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = useCallback(async () => {
    const response = await fetch("/api/products?all=1", { headers: { "x-paatram-admin": ADMIN_KEY } });
    if (response.ok) setProducts(await response.json());
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      const image = data.get("image") as File;
      const upload = new FormData();
      upload.append("image", image);
      const uploadResponse = await fetch("/api/media", { method: "POST", headers: { "x-paatram-admin": ADMIN_KEY }, body: upload });
      const uploadResult = await uploadResponse.json() as { url?: string; error?: string };
      if (!uploadResponse.ok || !uploadResult.url) throw new Error(uploadResult.error || "Image upload failed.");

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paatram-admin": ADMIN_KEY },
        body: JSON.stringify({
          name: data.get("name"),
          pricePaise: Number(data.get("price")) * 100,
          material: data.get("material"),
          size: data.get("size"),
          care: data.get("care"),
          imageUrl: uploadResult.url,
          available: true,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not add product.");
      form.reset();
      setMessage("Product added to the catalogue.");
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Remove ${product.name} from the catalogue?`)) return;
    const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, { method: "DELETE", headers: { "x-paatram-admin": ADMIN_KEY } });
    if (response.ok) setProducts((items) => items.filter((item) => item.id !== product.id));
  }

  return (
    <main className="admin-shell">
      <header className="admin-header"><span className="eyebrow">Pāatram studio</span><h1>Catalogue manager</h1><p>Add products here. This page is separate from the customer catalogue.</p></header>
      <form className="admin-form" onSubmit={submit}>
        <label><span>Product photo</span><input name="image" type="file" accept="image/*" required /></label>
        <label><span>Item name</span><input name="name" placeholder="e.g. Kansa Serving Bowl" required /></label>
        <label><span>Price in ₹</span><input name="price" type="number" min="0" step="1" placeholder="2450" required /></label>
        <label><span>Material / finish</span><input name="material" placeholder="Hand-finished bell metal" required /></label>
        <label><span>Size</span><input name="size" placeholder="22 cm × 8 cm" required /></label>
        <label><span>Care instructions</span><textarea name="care" placeholder="Hand wash with mild soap" rows={3} required /></label>
        <button className="admin-submit" disabled={busy}>{busy ? "Adding…" : "Add to catalogue"}</button>
        {message && <p className="form-message" role="status">{message}</p>}
      </form>
      <section className="admin-list">
        <div className="section-heading"><h2>Current products</h2><span>{products.length} items</span></div>
        {products.map((product) => (
          <article className="admin-product" key={product.id}>
            <img src={product.imageUrl} alt="" />
            <div><strong>{product.name}</strong><span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(product.pricePaise / 100)}</span></div>
            <button onClick={() => void remove(product)} aria-label={`Remove ${product.name}`}>Remove</button>
          </article>
        ))}
      </section>
    </main>
  );
}
