import { Jost, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";

// Fonts close to RockOn's: a bold geometric font for headings and text,
// and an italic serif for the tagline. Next.js downloads them for us.
const sans = Jost({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-sans" });
const serif = Libre_Caslon_Text({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif" });

export const metadata = {
  title: "Product Data Checker",
  description: "Upload a product CSV and see what's missing in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
