import { FileVideo, Sparkles, Zap, Gift } from "lucide-react";

const features = [
  { icon: FileVideo, title: "Multiple Formats", desc: "MP4, MP3, WEBM, M4A. Choose what works for you." },
  { icon: Sparkles, title: "High Quality", desc: "Up to 4K resolution. Crystal clear every time." },
  { icon: Zap, title: "Fast Downloads", desc: "Optimized servers. No throttling, no waiting." },
  { icon: Gift, title: "100% Free", desc: "No hidden fees. No credit card required." },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-4">Why SnapLoad?</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
          Built for speed, quality, and simplicity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card rounded-2xl p-8 shadow-sm card-hover border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
