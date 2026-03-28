import { PlatformPage } from "@/components/PlatformPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Video Downloader — Download YouTube Videos in HD & 4K",
  description:
    "Download YouTube videos, Shorts, and playlists in HD, Full HD, or 4K. Free, fast, and no registration required. Save any YouTube video as MP4 or MP3.",
  keywords: [
    "youtube downloader",
    "download youtube video",
    "youtube to mp4",
    "youtube to mp3",
    "youtube shorts downloader",
    "4k youtube downloader",
  ],
};

export default function YouTubeDownloader() {
  return <PlatformPage platformKey="youtube" />;
}
