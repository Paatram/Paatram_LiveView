"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

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

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<"signin" | "signup">("signin");
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(() => typeof window !== "undefined" && (
    window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  ));
  const [installMessage, setInstallMessage] = useState("");

  const loadProducts = useCallback(async () => {
    const response = await fetch("/api/products?all=1", { cache: "no-store" });
    if (response.ok) setProducts(await response.json());
    else if (response.status === 401) setAuthenticated(false);
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" }).then(async (response) => {
      const result = await response.json() as { authenticated?: boolean; registrationOpen?: boolean; error?: string };
      setAuthenticated(Boolean(result.authenticated));
      setRegistrationOpen(Boolean(result.registrationOpen));
      if (result.registrationOpen) setAccessMode("signup");
      if (result.error) setMessage(result.error);
      if (result.authenticated) void loadProducts();
    }).catch(() => setAuthenticated(false));
  }, [loadProducts]);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/admin-sw.js");
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      setStandalone(true);
      setInstallPrompt(null);
      setInstallMessage("");
    };
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setStandalone(true);
      setInstallPrompt(null);
      return;
    }
    setInstallMessage("On iPhone, tap Share, then choose Add to Home Screen.");
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      form.reset();
      setAuthenticated(true);
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), password: data.get("password") }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not create account.");
      form.reset();
      setRegistrationOpen(false);
      setAuthenticated(true);
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setProducts([]);
    setMessage("");
  }

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
      const uploadResponse = await fetch("/api/media", { method: "POST", body: upload });
      const uploadResult = await uploadResponse.json() as { url?: string; error?: string };
      if (!uploadResponse.ok || !uploadResult.url) throw new Error(uploadResult.error || "Image upload failed.");

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setMessage("Product added to the live catalogue.");
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Remove ${product.name} from the catalogue?`)) return;
    const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
    if (response.ok) setProducts((items) => items.filter((item) => item.id !== product.id));
    else setMessage("Could not remove this product.");
  }

  if (authenticated === null) return <main className="admin-shell admin-loading">Opening Pāatram Studio…</main>;

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login">
        <section>
          <span className="eyebrow">Pāatram studio</span>
          <h1>{accessMode === "signup" ? "Create admin account" : "Admin sign in"}</h1>
          <p>{accessMode === "signup" ? "Set up the first secure account for this catalogue." : "Sign in to manage products and images."}</p>
          <div className="auth-tabs" role="tablist" aria-label="Admin access options">
            <button role="tab" aria-selected={accessMode === "signin"} onClick={() => { setAccessMode("signin"); setMessage(""); }}>Sign in</button>
            <button role="tab" aria-selected={accessMode === "signup"} onClick={() => { setAccessMode("signup"); setMessage(""); }}>Sign up</button>
          </div>
          {accessMode === "signup" ? (
            <form className="admin-form" onSubmit={signUp}>
              <label><span>Name</span><input name="name" autoComplete="name" required /></label>
              <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
              <label><span>Password</span><input name="password" type="password" minLength={10} autoComplete="new-password" required /></label>
              <p className="password-hint">Use at least 10 characters.</p>
              {!registrationOpen && <p className="password-hint">Sign-up is only accepted when no admin account exists.</p>}
              <button className="admin-submit" disabled={busy}>{busy ? "Creating account…" : "Create admin account"}</button>
              {message && <p className="form-message" role="alert">{message}</p>}
            </form>
          ) : (
            <form className="admin-form" onSubmit={signIn}>
              <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
              <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
              <button className="admin-submit" disabled={busy}>{busy ? "Signing in…" : "Enter studio"}</button>
              {message && <p className="form-message" role="alert">{message}</p>}
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-topline">
          <span className="eyebrow">Pāatram studio</span>
          <div className="admin-actions">
            {!standalone && <button className="admin-install" type="button" onClick={() => void installApp()}>Install app</button>}
            <button className="admin-logout" onClick={() => void signOut()}>Sign out</button>
          </div>
        </div>
        <h1>Catalogue manager</h1><p>Add products here. Changes appear immediately in the customer catalogue.</p>
        {installMessage && <p className="install-message" role="status">{installMessage}</p>}
      </header>
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
