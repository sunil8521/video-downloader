"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getVideoInfo, storeVideoInfo, ApiError } from "@/lib/api";

export function HeroInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    try {
      setLoading(true);

      const info = await getVideoInfo(trimmed);

      // Store for the download page to consume
      storeVideoInfo(info);

      // Navigate to the download page
      router.push(`/download?url=${encodeURIComponent(trimmed)}`);
      
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please check your URL and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-background rounded-2xl shadow-xl p-2 flex items-center gap-2">
        <div className="flex items-center flex-1 gap-2 sm:gap-3 px-2 sm:px-4 h-14">
          <Link2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video link here..."
            className="flex-1 w-full bg-transparent text-sm sm:text-base outline-none min-w-0 placeholder:text-muted-foreground/70"
          />
        </div>

        <Button
          type="submit"
          variant="destructive"
          size="lg"
          className="h-14 px-4 sm:px-8 shrink-0"
          disabled={loading || !url.trim()}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin sm:mr-2" />
          ) : (
            <Download className="h-5 w-5 sm:mr-2" />
          )}
          <span className="hidden sm:inline">
            {loading ? "Processing..." : "Download Now"}
          </span>
        </Button>
      </div>
    </form>
  );
}