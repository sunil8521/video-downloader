"use client";

import { useEffect, useState, useRef } from "react";
import { Check, Download, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeProgress, triggerNativeDownload, type DownloadProgress } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  downloadId: string | null;
  onReset: () => void;
}

export function DownloadProgressUI({ downloadId, onReset }: Props) {
  const [downloadState, setDownloadState] = useState<"downloading" | "merging" | "ready" | "error">("downloading");
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!downloadId) return;

    setDownloadState("downloading");
    setProgress(null);

    const cleanup = subscribeProgress(
      downloadId,
      (data) => {
        setProgress(data);
        if (data.status === "merging") {
          setDownloadState("merging");
        }
      },
      () => {
        triggerNativeDownload(downloadId);
        setDownloadState("ready");
      },
      (error) => {
        setDownloadState("error");
        toast.error(error);
      }
    );

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [downloadId]);

  if (!downloadId) return null;

  return (
    <div className="w-full">
      {(downloadState === "downloading" || downloadState === "merging") && (
        <div className="max-w-sm mx-auto space-y-4">
          {/* Progress bar */}
          <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress?.progress || 0}%` }}
            />
            {downloadState === "merging" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>

          {/* Progress info */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {downloadState === "merging"
                ? "Merging video + audio..."
                : `${Math.round(progress?.progress || 0)}%`}
            </span>
            <div className="flex items-center gap-3 text-muted-foreground">
              {progress?.speed && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {progress.speed}
                </span>
              )}
              {progress?.eta && (
                <span>ETA {progress.eta}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {downloadState === "merging"
              ? "Almost done! Combining video and audio tracks..."
              : "Preparing your file. Your browser will handle the final save."}
          </p>
        </div>
      )}

      {downloadState === "ready" && (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <p className="font-semibold text-lg">
            Download started!
          </p>
          <p className="text-sm text-muted-foreground">
            Check your browser&apos;s download bar. Want another format?
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
          >
            <Download className="h-4 w-4" />
            Download Another Format
          </Button>
        </div>
      )}

      {downloadState === "error" && (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <p className="font-semibold text-lg text-destructive">
            Download Failed
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
          >
            <Download className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
