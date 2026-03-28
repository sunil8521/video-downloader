import { Link2, ListChecks, Download } from "lucide-react";

const steps = [
  { icon: Link2, title: "Paste Link", desc: "Copy the video URL from any supported platform and paste it into our input field." },
  { icon: ListChecks, title: "Choose Format", desc: "Select your preferred video quality and format — MP4, MP3, WEBM, and more." },
  { icon: Download, title: "Download", desc: "Hit download and save directly to your device. No waiting, no sign-ups." },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
          Three simple steps to download any video for free.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <step.icon className="h-7 w-7 text-accent" />
              </div>
              <div className="text-xs font-bold text-accent mb-2">STEP {i + 1}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
