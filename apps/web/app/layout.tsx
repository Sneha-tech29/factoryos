import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#061116",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://factoryos.in"),
  title: {
    default: "FactoryOS — The Deterministic Manufacturing Operating System",
    template: "%s | FactoryOS",
  },
  description:
    "Deterministic factory operations, line balancing, inventory governance, and plant floor intelligence for commercial printing, packaging monocartons, and publishing enterprises.",
  keywords: [
    "factory operating system",
    "manufacturing execution system",
    "printing factory ERP",
    "packaging MES",
    "deterministic operations",
    "plant floor telemetry",
    "industrial intelligence",
  ],
  authors: [{ name: "FactoryOS Inc." }],
  creator: "FactoryOS Inc.",
  publisher: "FactoryOS Inc.",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "FactoryOS",
    title: "FactoryOS — The Deterministic Manufacturing Operating System",
    description:
      "Deterministic factory operations, line balancing, inventory governance, and plant floor intelligence for modern manufacturing.",
    images: [
      {
        url: "/images/factory_exterior.jpg",
        width: 1200,
        height: 630,
        alt: "FactoryOS Industrial Manufacturing Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FactoryOS — The Deterministic Manufacturing Operating System",
    description:
      "Deterministic factory operations, line balancing, inventory governance, and plant floor intelligence.",
    images: ["/images/factory_exterior.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-primary antialiased min-h-screen selection:bg-cyan/30 selection:text-white">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
