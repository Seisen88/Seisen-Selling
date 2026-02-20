import type { Metadata } from "next";
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
        <main>{children}</main>
      </body>
    </html>
  );
}
