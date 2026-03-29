"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  Youtube,
  Instagram,
  Check,
  Download,
  Loader2,
  ChevronRight,
  Music,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getVideoInfo,
  startDownload,
  getStoredVideoInfo,
  formatDuration,
  formatFileSize,
  ApiError,
  API_BASE,
  type VideoInfo,
  type VideoFormat,
  type AudioFormat,
} from "@/lib/api";
import { DownloadProgressUI } from "@/components/download/DownloadProgressUI";

type PageState = "loading" | "ready" | "error";
type DownloadState = "idle" | "downloading" | "ready" | "error";

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "instagram") return <Instagram className="h-3.5 w-3.5" />;
  return <Youtube className="h-3.5 w-3.5" />;
};

function DownloadPageContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") || "";

  // Page state
  const [pageState, setPageState] = useState<PageState>("loading");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Download state
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [selectedFormatId, setSelectedFormatId] = useState<string>("");
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  // Progress state
  const [downloadId, setDownloadId] = useState<string | null>(null);

  // Load video info on mount
  useEffect(() => {
    async function loadInfo() {
      if (!urlParam) {
        setErrorMessage("No video URL provided.");
        setPageState("error");
        return;
      }

      // Try sessionStorage first (set by HeroInput)
      const stored = getStoredVideoInfo();
      if (stored && stored.webpage_url) {
        setVideoInfo(stored);
        setPageState("ready");
        // Pre-select first video format
        if (stored.formats?.length) {
          setSelectedFormatId(stored.formats[0].format_id);
        }
        return;
      }

      // Fallback: fetch from API
      try {
        const info = await getVideoInfo(urlParam);
        setVideoInfo(info);
        setPageState("ready");
        if (info.formats?.length) {
          setSelectedFormatId(info.formats[0].format_id);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Failed to fetch video info. Please go back and try again."
        );
        setPageState("error");
      }
    }

    loadInfo();
  }, [urlParam]);

  // Handle download — trigger start on backend and let DownloadProgressUI handle SSE
  const handleDownload = async () => {
    if (!videoInfo || !selectedFormatId) return;

    setDownloadState("downloading");

    try {
      // Find the quality of the selected format (e.g. "1080p", "720p")
      const selectedFormat = currentFormats.find(f => f.format_id === selectedFormatId);
      const quality = selectedFormat?.quality || "best";
      
      // Step 1: Start download on server → get downloadId
      const isAudio = activeTab === "audio";
      const result = await startDownload(urlParam, quality, isAudio, selectedFormatId);
      
      // Step 2: Pass down the downloadId to the UI component which will handle the SSE progress internally
      setDownloadId(result.downloadId);
    } catch (err) {
      setDownloadState("error");
      setDownloadId(null);
      toast.error(
        err instanceof ApiError ? err.message : "Download failed. Please try again."
      );
    }
  };

  // Separate formats into video and audio
  const videoFormats = videoInfo?.formats || [];
  const audioFormats = videoInfo?.audio_formats || [];

  const currentFormats =
    activeTab === "video" ? videoFormats : audioFormats;

  // When switching tabs, pre-select first format of that tab
  const handleTabSwitch = (tab: "video" | "audio") => {
    setActiveTab(tab);
    const fmts = tab === "video" ? videoFormats : audioFormats;
    if (fmts.length) {
      setSelectedFormatId(fmts[0].format_id);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-[72px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Download</span>
          </div>
        </div>

        {/* Loading State */}
        {pageState === "loading" && (
          <div className="container mx-auto px-6 pb-24">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Skeleton: Video preview */}
              <div className="bg-card rounded-2xl shadow-lg p-6 border border-border/50 animate-pulse">
                <div className="aspect-video bg-muted rounded-xl mb-5" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
              {/* Skeleton: Format selection */}
              <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/50 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/4 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {pageState === "error" && (
          <div className="container mx-auto px-6 pb-24">
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-3">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Link href="/">
                <Button variant="destructive" size="lg">
                  <RefreshCw className="h-4 w-4" />
                  Try Another Video
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Ready State */}
        {pageState === "ready" && videoInfo && (
          <div className="container mx-auto px-6 pb-24">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main content */}
              <div className="flex-1 space-y-6">
                {/* Video preview */}
                <div className="bg-card rounded-2xl shadow-lg p-6 border border-border/50">
                  <div className="relative aspect-video bg-primary rounded-xl overflow-hidden mb-5">
                    {videoInfo.thumbnail ? (
                      <img
                        src={`${API_BASE}/api/proxy-image?url=${encodeURIComponent(videoInfo.thumbnail)}`}
                        alt={videoInfo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                        <div className="w-16 h-16 bg-background/20 backdrop-blur rounded-full flex items-center justify-center">
                          <Play className="h-8 w-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    )}
                  </div>

                  <h1 className="text-xl font-bold mb-3 line-clamp-2">
                    {videoInfo.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary px-3 py-1 rounded-full">
                      <PlatformIcon platform={videoInfo.platform} />
                      {videoInfo.platform === "instagram"
                        ? "Instagram"
                        : "YouTube"}
                    </span>
                    {videoInfo.uploader && (
                      <span className="text-xs text-muted-foreground">
                        {videoInfo.uploader}
                      </span>
                    )}
                    {videoInfo.duration > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(videoInfo.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ad slot */}
                <AdSlot type="native" className="!min-h-[100px]" />

                {/* Format selection */}
                <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/50">
                  <h2 className="text-lg font-semibold mb-4">Select Format</h2>

                  {/* Tabs */}
                  <div className="inline-flex bg-secondary rounded-xl p-1 mb-6">
                    {(["video", "audio"] as const).map((tab) => {
                      const count =
                        tab === "video"
                          ? videoFormats.length
                          : audioFormats.length;
                      return (
                        <button
                          key={tab}
                          onClick={() => handleTabSwitch(tab)}
                          disabled={count === 0}
                          className={`px-6 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                            activeTab === tab
                              ? "bg-accent text-accent-foreground shadow-sm"
                              : count === 0
                              ? "text-muted-foreground/40 cursor-not-allowed"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab === "audio" && (
                            <Music className="h-3.5 w-3.5 inline mr-1.5" />
                          )}
                          {tab} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Format grid */}
                  {currentFormats.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentFormats.map((fmt) => {
                        const selected =
                          selectedFormatId === fmt.format_id;
                        const isVideo = activeTab === "video";
                        const vFmt = fmt as VideoFormat;
                        const aFmt = fmt as AudioFormat;
                        return (
                          <button
                            key={fmt.format_id}
                            onClick={() =>
                              setSelectedFormatId(fmt.format_id)
                            }
                            className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                              selected
                                ? "border-accent bg-accent/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            {selected && (
                              <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-accent-foreground" />
                              </div>
                            )}
                            <div className="font-semibold text-base">
                              {fmt.quality}{" "}
                              <span className="font-normal text-muted-foreground text-sm">
                                {fmt.label}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
                              <span>MP4</span>
                              <span>•</span>
                              <span>{formatFileSize(fmt.filesize)}</span>
                              {isVideo && vFmt.codec_label && (
                                <>
                                  <span>•</span>
                                  <span className="text-xs px-1.5 py-0.5 bg-secondary rounded">
                                    {vFmt.codec_label}
                                  </span>
                                </>
                              )}
                              {isVideo && !vFmt.has_audio && (
                                <span className="text-xs ml-1 text-muted-foreground flex items-center">
                                  (M)
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm py-4">
                      No {activeTab} formats available for this video.
                    </p>
                  )}
                </div>

                {/* Download action */}
                <div className="download-action-area rounded-2xl p-8 text-center">
                  {downloadState === "idle" && (
                    <>
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleDownload}
                        disabled={!selectedFormatId}
                        className="w-full max-w-sm mx-auto text-base py-6"
                      >
                        <Download className="h-5 w-5" />
                        Start Download
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Free download • No registration • Direct to your
                        device
                      </p>
                    </>
                  )}

                  {downloadState !== "idle" && (
                    <DownloadProgressUI 
                      downloadId={downloadId}
                      onReset={() => {
                        setDownloadState("idle");
                        setDownloadId(null);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Sidebar ad (desktop) */}
              <div className="hidden lg:block">
                <div className="sticky top-[100px]">
                  <AdSlot type="sidebar" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    }>
      <DownloadPageContent />
    </Suspense>
  );
}
