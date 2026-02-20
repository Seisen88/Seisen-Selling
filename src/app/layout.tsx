import type { Metadata } from "next";
import BackgroundEffect from "@/components/BackgroundEffect";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seisen Premium - Download Software & Games",
  description: "Browse and download software, games, and utilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <BackgroundEffect />
        <main>{children}</main>
      </body>
    </html>
  );
}
