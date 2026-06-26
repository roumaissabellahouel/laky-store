import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laky Accessoires — Bijoux en acier inoxydable",
  description:
    "Découvrez notre collection de bijoux en acier inoxydable. Livraison partout en Algérie. Paiement à la livraison.",
  keywords: ["bijoux", "acier inoxydable", "Algérie", "bagues", "colliers", "bracelets"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF6F1] text-[#1A1714]">
        {children}
      </body>
    </html>
  );
}
