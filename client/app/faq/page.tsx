"use client"
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeFaq } from "@/components/home/HomeFaq";
import { Search } from "lucide-react";
import { useState } from "react";

export default function FaqPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-[72px]">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <h1 className="text-4xl font-extrabold text-center mb-4">Help Center</h1>
          <p className="text-center text-muted-foreground mb-10">Find answers to commonly asked questions.</p>
          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-background border border-border rounded-xl pl-12 pr-4 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
        <HomeFaq />
      </div>
      <Footer />
    </div>
  );
}
