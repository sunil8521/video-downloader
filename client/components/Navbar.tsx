"use client"
import { usePathname } from "next/navigation";
import Link from "next/link"
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "YouTube", to: "/youtube-downloader" },
  { label: "Instagram", to: "/instagram-downloader" },
  { label: "FAQ", to: "/faq" },
];

export function Navbar() {
  const location = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border h-[72px] flex items-center">
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <Image src="/icon.png" alt="SnapLoad Logo" width={28} height={28} className="rounded-md object-cover" />
          <span>SnapLoad</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location === link.to ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-[72px] left-0 right-0 glass-nav border-b border-border md:hidden">
          <div className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location === link.to ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
