import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./landing.css";
import "./premium-listing.css";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { DebugInfo } from "@/components/DebugInfo";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASSERO – Multi‑Asset Plattform",
  description: "Inserieren, Vergleichen, Bewerten und Handeln von Real‑Assets.",
  keywords: ["Real Estate", "Luxusuhren", "Fahrzeuge", "Asset Management", "Investment"],
  authors: [{ name: "ASSERO Team" }],
  creator: "ASSERO",
  publisher: "ASSERO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://assero.io"),
  openGraph: {
    title: "ASSERO – Multi‑Asset Plattform",
    description: "Inserieren, Vergleichen, Bewerten und Handeln von Real‑Assets.",
    url: "https://assero.io",
    siteName: "ASSERO",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASSERO – Multi‑Asset Plattform",
    description: "Inserieren, Vergleichen, Bewerten und Handeln von Real‑Assets.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${montserrat.variable} ${playfair.variable} antialiased`}>
        <ErrorBoundary fallback={ErrorFallback}>
          {children}
          <DebugInfo />
        </ErrorBoundary>
      </body>
    </html>
  );
}
