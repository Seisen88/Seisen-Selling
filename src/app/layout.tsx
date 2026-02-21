import type { Metadata } from "next";
import localFont from "next/font/local";
import BackgroundEffect from "@/components/BackgroundEffect";
import "./globals.css";

const japanRamen = localFont({
  src: "../../public/fonts/JapanRamen.otf",
  variable: "--font-japan-ramen",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reiya 零夜 - Download Software & Games",
  description: "Browse and download software, games, and utilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={japanRamen.variable}>
      <body className="antialiased min-h-screen">
        <BackgroundEffect />
        <main>{children}</main>
      </body>
    </html>
  );
}
