"use client";

import { useEffect, useState } from "react";

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

const formatPrice = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <main className="catalogue-shell">
      <header className="hero">
        <span className="eyebrow">Pāatram</span>
        <h1>Objects for everyday rituals.</h1>
        <p>Thoughtfully made tableware, shaped by Indian craft.</p>
      </header>

      <section className="collection" aria-labelledby="collection-title">
        <div className="section-heading">
          <h2 id="collection-title">The collection</h2>
          <span>{loading ? "Loading…" : `${products.length} pieces`}</span>
        </div>
        {loading ? (
          <div className="product-grid" aria-label="Loading products">
            {[0, 1, 2, 3].map((item) => <div className="product-placeholder" key={item}><span /><i /></div>)}
          </div>
        ) : products.length ? (
          <div className="product-grid">
            {products.map((product) => (
              <button className="product-card" key={product.id} onClick={() => setSelected(product)}>
                <span className="image-wrap"><img src={product.imageUrl} alt={product.name} /></span>
                <span className="product-copy"><strong>{product.name}</strong><span>{formatPrice(product.pricePaise)}</span></span>
              </button>
            ))}
          </div>
        ) : <p className="empty-state">The next collection is taking shape.</p>}
      </section>

      <footer>Made slowly. Kept for years.</footer>

      {selected && (
        <div className="detail-overlay" role="presentation" onClick={() => setSelected(null)}>
          <article className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="product-title" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelected(null)} aria-label="Close product details">×</button>
            <img src={selected.imageUrl} alt="" />
            <div className="detail-copy">
              <span className="eyebrow">Pāatram collection</span>
              <h2 id="product-title">{selected.name}</h2>
              <p className="detail-price">{formatPrice(selected.pricePaise)}</p>
              <dl>
                <div><dt>Material</dt><dd>{selected.material}</dd></div>
                <div><dt>Size</dt><dd>{selected.size}</dd></div>
                <div><dt>Care</dt><dd>{selected.care}</dd></div>
              </dl>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
