import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pāatram — Objects for everyday rituals",
  description: "Thoughtfully made tableware, shaped by Indian craft.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
