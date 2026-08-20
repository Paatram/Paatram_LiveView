import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pāatram Studio",
  description: "Manage the Pāatram product catalogue from your phone.",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pāatram Studio",
  },
  icons: {
    icon: [
      { url: "/admin-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/admin-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#220a15",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
