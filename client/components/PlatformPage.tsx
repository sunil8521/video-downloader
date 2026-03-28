import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroInput } from "@/components/HeroInput";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeFaq } from "@/components/home/HomeFaq";
import { Youtube, Instagram, Facebook } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlatformPageProps {
  platform: string;
  Icon: LucideIcon
  headline: string;
  subheadline: string;
  features: string[];
}

const platformData: Record<string, PlatformPageProps> = {
  youtube: {
    platform: "YouTube",
    Icon: Youtube,
    headline: "YouTube Video Downloader",
    subheadline: "Download YouTube videos, Shorts, and playlists in HD, Full HD, or 4K — completely free.",
    features: ["Download YouTube Shorts", "Save entire playlists", "Extract audio as MP3", "4K Ultra HD support"],
  },
  instagram: {
    platform: "Instagram",
    Icon: Instagram,
    headline: "Instagram Video Downloader",
    subheadline: "Save Instagram Reels, Stories, and IGTV videos directly to your device.",
    features: ["Download Instagram Reels", "Save Stories anonymously", "IGTV full video support", "High quality images"],
  },
};

export function PlatformPage({ platformKey }: { platformKey: string }) {
  const data = platformData[platformKey];
  if (!data) return null;
  const { Icon, headline, subheadline, features } = data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="hero-gradient min-h-[70vh] flex items-center justify-center pt-[72px]">
        <div className="container mx-auto px-6 py-24 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Icon className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground leading-tight mb-4 text-balance">
            {headline}
          </h1>
          <p className="text-lg text-primary-foreground/60 max-w-xl mx-auto mb-10">{subheadline}</p>
          <HeroInput />
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {features.map((f) => (
              <span key={f} className="bg-primary-foreground/10 text-primary-foreground/80 text-sm px-4 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <HomeFaq />
      <Footer />
    </div>
  );
}
