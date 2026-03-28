import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"


const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" duration={5000} />
      </body>
    </html>
  );
}
