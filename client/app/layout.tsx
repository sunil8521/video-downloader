import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "SnapLoad — Free Video Downloader | YouTube, Instagram & More",
    template: "%s | SnapLoad",
  },
  description:
    "Download videos from YouTube and Instagram for free. HD, Full HD, 4K quality. No registration, no limits.",
  keywords: [
    "video downloader",
    "youtube downloader",
    "instagram downloader",
    "download video",
    "free video downloader",
    "mp4 downloader",
    "hd video download",
  ],
  verification: {
    google: "KuOf0msuQVWBaOJD0x8UBIm-urQU6UaCjGdVVkASQSA",
  },
  openGraph: {
    title: "SnapLoad — Free Video Downloader",
    description:
      "Download videos from YouTube and Instagram. HD quality, completely free.",
    type: "website",
    siteName: "SnapLoad",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapLoad — Free Video Downloader",
    description:
      "Download videos from YouTube and Instagram. HD quality, completely free.",
  },
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" duration={5000} />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8W75KC9R2F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8W75KC9R2F');
          `}
        </Script>
      </body>
    </html>
  );
}
