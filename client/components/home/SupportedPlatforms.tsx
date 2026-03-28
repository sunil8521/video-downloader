import { Youtube, Instagram, Facebook, Twitter, Twitch, Music } from "lucide-react";

const platforms = [
  { icon: Youtube, name: "YouTube" },
  { icon: Instagram, name: "Instagram" },
  { icon: Facebook, name: "Facebook" },
  { icon: Twitter, name: "Twitter/X" },
  { icon: Twitch, name: "Twitch" },
  { icon: Music, name: "SoundCloud" },
  { icon: Youtube, name: "Vimeo" },
];

export function SupportedPlatforms() {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-4">Supported Platforms</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
          Download videos from all your favorite platforms.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {platforms.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background card-hover cursor-default"
            >
              <Icon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
