

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroInput } from "@/components/HeroInput";
import { AdSlot } from "@/components/AdSlot";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { HomeFaq } from "@/components/home/HomeFaq";
import { Youtube, Instagram, Facebook } from "lucide-react";

const platformIcons = [
  { icon: Youtube, label: "YouTube" },
  { icon: Instagram, label: "Instagram" },
  ];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient min-h-[90vh] flex items-center justify-center pt-[72px]">
        <div className="container mx-auto px-6 py-24 text-center animate-fade-in">
          <span className="inline-block bg-accent/20 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Free • No Registration • HD Quality
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 text-balance">
            Download Videos in Seconds
          </h1>
          <p className="text-lg text-primary-foreground/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Paste your link below. We'll handle the rest. Full support for downloading high-quality YouTube and Instagram videos.
          </p>

          <HeroInput />

          {/* Platform icons */}
          <div className="flex items-center justify-center gap-8 mt-10">
            {platformIcons.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-primary-foreground/40 hover:text-primary-foreground/80 transition-colors cursor-default"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-xs text-primary-foreground/30 max-w-2xl mx-auto">
            <p><strong>Disclaimer:</strong> Downloading copyrighted material without the creator's explicit permission is illegal in many jurisdictions. By using SnapLoad, you agree that you possess the necessary rights or permissions for any content you download and assume full legal responsibility for your actions.</p>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeaturesGrid />

      <section className="py-12">
        <AdSlot type="banner" />
      </section>

      <HomeFaq />
      <Footer />
    </div>
  );
}
