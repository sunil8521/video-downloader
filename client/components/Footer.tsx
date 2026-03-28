import Link from "next/link";
import { Zap } from "lucide-react";
import Image from "next/image";
const footerLinks = {
    Platforms: [
        { label: "YouTube Downloader", to: "/youtube-downloader" },
        { label: "Instagram Downloader", to: "/instagram-downloader" },
    ],
    Legal: [
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Terms of Service", to: "/terms-of-service" },
        { label: "Contact", to: "/contact" },
    ],
    Resources: [
        { label: "FAQ", to: "/faq" },
    ],
};

export function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 font-bold text-xl mb-4">
                            <Image src="/icon.png" alt="SnapLoad Logo" width={28} height={28} className="rounded-md object-cover" />
                            <span>SnapLoad</span>
                        </div>
                        <p className="text-sm text-primary-foreground/60 leading-relaxed">
                            Free video downloader supporting YouTube and Instagram. No registration required.
                        </p>
                        <p className="text-muted-foreground mt-4 text-xs max-w-sm">
                            <strong>Disclaimer:</strong> Downloading copyrighted videos without explicit permission is illegal in many jurisdictions. By using this service, you assume full responsibility for your actions and confirm you hold the necessary rights to the content.
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
                                {title}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.to}>
                                        <Link
                                            href={link.to}
                                            className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/40">
                    © {new Date().getFullYear()} SnapLoad. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
