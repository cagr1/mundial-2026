import type { Metadata, Viewport } from "next";
import { Alumni_Sans_Pinstripe, Albert_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const alumniPinstripe = Alumni_Sans_Pinstripe({
  variable: "--font-alumni-pinstripe",
  subsets: ["latin"],
  weight: "400",
});

const albertSans = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mundial 2026",
  description: "Partidos, grupos y horarios del FIFA World Cup 2026",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Mundial 2026" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${alumniPinstripe.variable} ${albertSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
