import "~/styles/globals.css";
import "~/styles/noir.css";

import { type Metadata } from "next";
import { Cormorant_Garamond, Inter, Manrope, Oswald } from "next/font/google";

import { Providers } from "~/components/providers";
import Footer from "~/components/Footer";
import PublicTheme from "~/components/PublicTheme";

export const metadata: Metadata = {
  title: "Ball der HTL Braunau 2027 – Prison Break",
  description: "Ball der HTL Braunau 2027 – Prison Break – Raus in die Freiheit. Karten, Zeitplan, Lageplan und alle Informationen zum Ball am 15. Jänner 2027.",
  icons: [{ rel: "icon", url: "/icons/favicon.ico" }],
};

// Inter is still used by the backend
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["500"],
  style: ["normal", "italic"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["300", "400", "500"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${cormorant.variable} ${oswald.variable} ${manrope.variable}`}>
      <body>
        <Providers>
          <PublicTheme>
            {children}
            <Footer />
          </PublicTheme>
        </Providers>
      </body>
    </html>
  );
}
