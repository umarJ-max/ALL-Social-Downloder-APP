export const PLATFORM_META: Record<
  string,
  { color: string; icon: string; label: string }
> = {
  youtube: { color: "#FF0000", icon: "logo-youtube", label: "YouTube" },
  tiktok: { color: "#69C9D0", icon: "musical-notes", label: "TikTok" },
  instagram: { color: "#C13584", icon: "logo-instagram", label: "Instagram" },
  facebook: { color: "#1877F2", icon: "logo-facebook", label: "Facebook" },
  twitter: { color: "#1DA1F2", icon: "logo-twitter", label: "Twitter / X" },
  pinterest: { color: "#E60023", icon: "logo-pinterest", label: "Pinterest" },
  reddit: { color: "#FF4500", icon: "logo-reddit", label: "Reddit" },
  vimeo: { color: "#1AB7EA", icon: "play-circle", label: "Vimeo" },
  dailymotion: { color: "#0066DC", icon: "play", label: "Dailymotion" },
  unknown: { color: "#888", icon: "globe-outline", label: "Unknown" },
};

export function getPlatformMeta(platform: string) {
  return PLATFORM_META[platform.toLowerCase()] ?? PLATFORM_META.unknown;
}
