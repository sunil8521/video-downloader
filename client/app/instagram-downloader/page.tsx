import { PlatformPage } from "@/components/PlatformPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Video Downloader — Save Reels, Stories & IGTV",
  description:
    "Download Instagram Reels, Stories, and IGTV videos for free. Save Instagram videos in high quality directly to your device. No login required.",
  keywords: [
    "instagram downloader",
    "download instagram video",
    "instagram reels downloader",
    "instagram story downloader",
    "save instagram video",
    "igtv downloader",
  ],
};

export default function InstagramDownloader() {
  return <PlatformPage platformKey="instagram" />;
}
