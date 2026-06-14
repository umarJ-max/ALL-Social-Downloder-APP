// ─── CONFIGURE THIS ───────────────────────────────────────────────────────────
// Deploy the /api/pinterest.js file to your Vercel project and paste the URL below
const PINTEREST_PROXY_URL = "https://pintrest-proxy.vercel.app/";
// ──────────────────────────────────────────────────────────────────────────────

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
  qualities: Quality[];
}

export interface DownloadResult {
  success: boolean;
  mediaInfo?: MediaInfo;
  error?: string;
}

function detectPlatform(url: string): string {
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
  return "unknown";
}

async function fetchPinterest(url: string): Promise<DownloadResult> {
  try {
    const res = await fetch(`${PINTEREST_PROXY_URL}?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Pinterest fetch failed");
    return data;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function fetchUniversal(url: string): Promise<DownloadResult> {
  try {
    const res = await fetch(`${UNIVERSAL_API}?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!data.success) throw new Error("API returned failure");
    return {
      success: true,
      mediaInfo: {
        title: data.mediaInfo?.title || "Untitled",
        platform: data.mediaInfo?.platform || "Unknown",
        videoUrl: data.mediaInfo?.videoUrl || null,
        audioUrl: data.mediaInfo?.audioUrl || null,
        thumbnail: data.mediaInfo?.thumbnail || null,
        qualities: data.mediaInfo?.qualities || [],
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to fetch media" };
  }
}

export async function resolveMedia(url: string): Promise<DownloadResult> {
  const platform = detectPlatform(url.trim());
  if (platform === "pinterest") {
    return fetchPinterest(url.trim());
  }
  return fetchUniversal(url.trim());
}

export function detectPlatformName(url: string): string {
  return detectPlatform(url);
}
