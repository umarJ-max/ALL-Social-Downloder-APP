// ─── SET YOUR VERCEL URL HERE ─────────────────────────────────────────────────
const PINTEREST_PROXY_URL = "https://YOUR-VERCEL-PROJECT.vercel.app/api/pinterest";
// ─────────────────────────────────────────────────────────────────────────────

const UNIVERSAL_API = "https://ahm7xmakki.com/api/alldl";

export interface Quality {
  quality: string;
  url: string;
}

export interface MediaInfo {
  title: string;
  platform: string;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnail: string | null;
  qualities: Quality[];   // may be empty — UI shows single download btn in that case
  isImage?: boolean;
}

export interface DownloadResult {
  success: boolean;
  mediaInfo?: MediaInfo;
  error?: string;
}

export function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("pinterest.com") || lower.includes("pin.it")) return "pinterest";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "facebook";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("reddit.com")) return "reddit";
  if (lower.includes("vimeo.com")) return "vimeo";
  if (lower.includes("dailymotion.com")) return "dailymotion";
  if (lower.includes("snapchat.com")) return "snapchat";
  if (lower.includes("linkedin.com")) return "linkedin";
  return "unknown";
}

async function fetchPinterest(url: string): Promise<DownloadResult> {
  try {
    const res = await fetch(`${PINTEREST_PROXY_URL}?url=${encodeURIComponent(url)}`);
    const text = await res.text(); // get raw text first to debug JSON issues
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // Server returned non-JSON (HTML error page etc.)
      const preview = text.slice(0, 120).replace(/\n/g, " ");
      return { success: false, error: `Pinterest proxy error: unexpected response — ${preview}` };
    }
    if (!data.success) return { success: false, error: data.error || "Pinterest fetch failed" };
    return data as DownloadResult;
  } catch (e: any) {
    return { success: false, error: "Network error reaching Pinterest proxy: " + e.message };
  }
}

async function fetchUniversal(url: string): Promise<DownloadResult> {
  try {
    const res = await fetch(`${UNIVERSAL_API}?url=${encodeURIComponent(url)}`);
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: "API returned an invalid response. Try again." };
    }
    if (!data.success) {
      return { success: false, error: "Could not extract media from this URL." };
    }

    // Build qualities array — API sometimes returns it, sometimes just videoUrl
    let qualities: Quality[] = data.mediaInfo?.qualities ?? [];

    // If no qualities array but we have videoUrl, make a single entry
    if (qualities.length === 0 && data.mediaInfo?.videoUrl) {
      qualities = [{ quality: "Default", url: data.mediaInfo.videoUrl }];
    }

    return {
      success: true,
      mediaInfo: {
        title: data.mediaInfo?.title || "Untitled",
        platform: data.mediaInfo?.platform || "Unknown",
        videoUrl: data.mediaInfo?.videoUrl || null,
        audioUrl: data.mediaInfo?.audioUrl || null,
        thumbnail: data.mediaInfo?.thumbnail || null,
        qualities,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to fetch media" };
  }
}

export async function resolveMedia(url: string): Promise<DownloadResult> {
  const platform = detectPlatform(url.trim());
  if (platform === "pinterest") return fetchPinterest(url.trim());
  return fetchUniversal(url.trim());
}
