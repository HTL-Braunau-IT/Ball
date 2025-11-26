import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "~/components/providers";
import Footer from "~/components/Footer";

export const metadata: Metadata = {
  title: "HTL Braunau - Ball der Auserwählten 2026",
  description: "Der elegante Ball der HTL Braunau - DUNE Theme. Karten, Informationen und Details zum Ball der Auserwählten 2026.",
  icons: [{ rel: "icon", url: "/icons/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
