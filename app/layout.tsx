import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinay Saini — Developer Portfolio",
  description:
    "Full-stack products, AI-assisted tools, Shopify systems and automation infrastructure.",
  metadataBase: new URL("https://vinaysaini.dev"),
  openGraph: {
    title: "Vinay Saini — Developer Portfolio",
    description:
      "Full-stack products, AI-assisted tools, Shopify systems and automation infrastructure.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
