// ─── API Client for SnapLoad Backend ─────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VideoFormat {
  format_id: string;
  quality: string;       // e.g. "1080p", "720p"
  label: string;         // e.g. "Full HD", "HD"
  ext: string;           // e.g. "mp4"
  resolution?: string;   // e.g. "1920x1080"
  filesize?: number;     // bytes
  vcodec?: string;
  acodec?: string;
  has_audio: boolean;
  codec_label?: string;  // e.g. "H.264", "AV1", "VP9"
}

export interface AudioFormat {
  format_id: string;
  quality: string;       // e.g. "128kbps"
  label: string;
  ext: string;           // e.g. "m4a", "webm"
  filesize?: number;
  acodec?: string;
  abr?: number;          // audio bitrate
}

export interface VideoInfo {
  platform: "youtube" | "instagram";
  id: string;
  title: string;
  thumbnail: string;
  duration: number;       // seconds
  uploader: string;
  webpage_url: string;
  formats: VideoFormat[];
  audio_formats?: AudioFormat[];
  best_format?: string;
  // Instagram-specific
  is_reel?: boolean;
  is_story?: boolean;
  is_post?: boolean;
}

export interface DownloadProgress {
  status: "downloading" | "merging" | "done" | "error";
  progress: number;  // 0-100
  speed: string;     // e.g. "2.50MiB/s"
  eta: string;       // e.g. "00:15"
  error?: string;
}

export class ApiError extends Error {
  status: number;
  platform?: string;

  constructor(message: string, status: number, platform?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.platform = platform;
  }
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const res = await fetch(`${API_BASE}/api/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      data.message || data.error || "Failed to extract video info",
      res.status,
      data.platform,
    );
  }

  return data as VideoInfo;
}

// ─── NEW: Start a download (returns downloadId immediately) ──────────────────

export async function startDownload(
  url: string,
  quality: string,
  isAudio: boolean = false,
  formatId?: string
): Promise<{ downloadId: string }> {
  const res = await fetch(`${API_BASE}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, quality, isAudio, formatId }),
  });

  if (!res.ok) {
    let message = "Download failed";
    try {
      const err = await res.json();
      message = err.message || err.error || message;
    } catch {
      // Response wasn't JSON
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

// ─── NEW: Subscribe to download progress via SSE ─────────────────────────────

export function subscribeProgress(
  downloadId: string,
  onProgress: (data: DownloadProgress) => void,
  onDone: () => void,
  onError: (error: string) => void,
): () => void {
  const eventSource = new EventSource(
    `${API_BASE}/api/progress/${downloadId}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data: DownloadProgress = JSON.parse(event.data);
      onProgress(data);

      if (data.status === "done") {
        eventSource.close();
        onDone();
      } else if (data.status === "error") {
        eventSource.close();
        onError(data.error || "Download failed");
      }
    } catch {
      // Ignore parse errors
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
    onError("Connection lost. The download may still be processing.");
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// ─── NEW: Trigger native browser download ────────────────────────────────────

export function triggerNativeDownload(downloadId: string): void {
  // This opens the file URL in the browser, which triggers the native
  // download manager — the file goes directly to disk, not into RAM as a blob.
  const url = `${API_BASE}/api/file/${downloadId}`;
  
  // Use a hidden link element to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format seconds into mm:ss or hh:mm:ss */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/** Format file size bytes into human-readable string */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Store video info in sessionStorage for the download page */
export function storeVideoInfo(info: VideoInfo): void {
  sessionStorage.setItem("snapload_video_info", JSON.stringify(info));
  sessionStorage.setItem("snapload_video_url", info.webpage_url);
}

/** Retrieve video info from sessionStorage */
export function getStoredVideoInfo(): VideoInfo | null {
  const raw = sessionStorage.getItem("snapload_video_info");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VideoInfo;
  } catch {
    return null;
  }
}

/** Get the stored URL */
export function getStoredVideoUrl(): string | null {
  return sessionStorage.getItem("snapload_video_url");
}
