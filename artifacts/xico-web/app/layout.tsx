import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://xico.app"),
  title: "XICO · México en Madrid, semana a semana",
  description:
    "Una publicación editorial sobre la presencia mexicana en Madrid. Cada domingo, una Ruta nueva escrita por una editora mexicana. No es turismo. Es continuidad.",
  openGraph: {
    title: "XICO · México en Madrid, semana a semana",
    description:
      "Una publicación editorial sobre la presencia mexicana en Madrid. Cada domingo, una Ruta nueva escrita por una editora mexicana.",
    siteName: "XICO",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XICO · México en Madrid, semana a semana",
    description:
      "Una publicación editorial sobre la presencia mexicana en Madrid. Cada domingo, una Ruta nueva.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080508",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
