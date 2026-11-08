import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

const GeistSans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const GeistMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
import { Analytics } from "@vercel/analytics/next";
// @ts-ignore CSS global import is handled by Next.js at build time.
import "./globals.css";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { UserMenu } from "@/components/userMenu";
import ChatBotCliente from "@/components/ChatBotCliente";

export const metadata: Metadata = {
  title: "Pastelerías Córdova - Deliciosos Postres Artesanales",
  description:
    "Pastelerías Córdova ofrece los mejores postres artesanales. Tortas, muffins, cheesecakes y más.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} flex flex-col min-h-screen`}
      >
        <CartProvider>
          {/* 🧑 Menú de usuario */}
          <UserMenu />

          {/* ⚠️ CAMBIO: Envolvemos children en un <main> que ocupa el espacio disponible */}
          <main className="flex-grow w-full">
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </main>

          <Footer />
          <Analytics />
          <Toaster />
          <ChatBotCliente />
        </CartProvider>
      </body>
    </html>
  );
}
