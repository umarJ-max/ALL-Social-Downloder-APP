import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { resolveMedia, MediaInfo, Quality, detectPlatformName } from "../utils/downloader";
import { downloadAndSave, DownloadProgress } from "../utils/saveMedia";
import { getPlatformMeta } from "../utils/platforms";

const { width: SCREEN_W } = Dimensions.get("window");

const SUPPORTED = [
  { key: "youtube", icon: "logo-youtube", color: "#FF0000" },
  { key: "tiktok", icon: "musical-notes", color: "#69C9D0" },
  { key: "instagram", icon: "logo-instagram", color: "#C13584" },
  { key: "facebook", icon: "logo-facebook", color: "#1877F2" },
  { key: "twitter", icon: "logo-twitter", color: "#1DA1F2" },
  { key: "pinterest", icon: "logo-pinterest", color: "#E60023" },
  { key: "reddit", icon: "logo-reddit", color: "#FF4500" },
  { key: "vimeo", icon: "play-circle", color: "#1AB7EA" },
];

type DownloadState = "idle" | "fetching" | "ready" | "downloading" | "done" | "error";

export default function HomeScreen() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<DownloadState>("idle");
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [activeQuality, setActiveQuality] = useState<Quality | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const platform = url.trim() ? detectPlatformName(url.trim()) : "unknown";
  const meta = getPlatformMeta(platform);

  async function handlePaste() {
    const text = await Clipboard.getStringAsync();
    if (text) setUrl(text.trim());
  }

  async function handleFetch() {
    if (!url.trim()) return;
    setState("fetching");
    setMediaInfo(null);
    setError("");
    setSavedPath(null);
    setActiveQuality(null);

    const result = await resolveMedia(url.trim());
    if (result.success && result.mediaInfo) {
      setMediaInfo(result.mediaInfo);
      // default to first quality or videoUrl
      if (result.mediaInfo.qualities?.length > 0) {
        setActiveQuality(result.mediaInfo.qualities[0]);
      }
      setState("ready");
      pulseGlow();
    } else {
      setError(result.error || "Could not fetch media. Check the URL.");
      setState("error");
    }
  }

  function pulseGlow() {
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }

  async function handleDownload(downloadUrl: string, isAudio = false) {
    setState("downloading");
    setProgress(0);

    const filename = `${mediaInfo?.platform || "media"}_${Date.now()}${isAudio ? "_audio" : ""}`;
    const result = await downloadAndSave(downloadUrl, filename, (p: DownloadProgress) => {
      setProgress(p.percent);
    });

    if (result.success) {
      setState("done");
      setSavedPath(result.path || null);
    } else {
      setError(result.error || "Download failed");
      setState("error");
    }
  }

  function handleReset() {
    setUrl("");
    setState("idle");
    setMediaInfo(null);
    setError("");
    setProgress(0);
    setSavedPath(null);
    setActiveQuality(null);
  }

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="arrow-down-circle" size={28} color="#7C5CFC" />
            </View>
            <Text style={styles.appTitle}>Universal Downloader</Text>
          </View>
          <Text style={styles.tagline}>Download from any platform, instantly.</Text>
        </View>

        {/* Supported Platforms Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.platformScroll}
          contentContainerStyle={styles.platformRow}
        >
          {SUPPORTED.map((p) => (
            <View key={p.key} style={[styles.platformBadge, { borderColor: p.color + "44" }]}>
              <Ionicons name={p.icon as any} size={18} color={p.color} />
            </View>
          ))}
        </ScrollView>

        {/* URL Input */}
        <View style={styles.inputCard}>
          <View style={[styles.inputRow, url.trim() && { borderColor: meta.color + "88" }]}>
            {url.trim() ? (
              <Ionicons name={meta.icon as any} size={20} color={meta.color} style={styles.inputIcon} />
            ) : (
              <Ionicons name="link-outline" size={20} color="#555" style={styles.inputIcon} />
            )}
            <TextInput
              style={styles.input}
              placeholder="Paste video URL here…"
              placeholderTextColor="#444"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={handleFetch}
            />
            {url.length > 0 ? (
              <TouchableOpacity onPress={() => setUrl("")} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={20} color="#444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
                <Ionicons name="clipboard-outline" size={16} color="#7C5CFC" />
                <Text style={styles.pasteBtnText}>Paste</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.fetchBtn, (!url.trim() || state === "fetching") && styles.fetchBtnDisabled]}
            onPress={handleFetch}
            disabled={!url.trim() || state === "fetching"}
            activeOpacity={0.8}
          >
            {state === "fetching" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.fetchBtnText}>Fetch Media</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {state === "error" && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color="#FF4D4D" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleReset} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Result */}
        {state === "ready" && mediaInfo && (
          <Animated.View style={[styles.resultCard, { opacity: Animated.add(1, Animated.multiply(glowOpacity, -0.3)) }]}>
            {/* Thumbnail */}
            {mediaInfo.thumbnail ? (
              <View style={styles.thumbContainer}>
                <Image
                  source={{ uri: mediaInfo.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={[styles.platformTag, { backgroundColor: meta.color }]}>
                  <Ionicons name={meta.icon as any} size={12} color="#fff" />
                  <Text style={styles.platformTagText}>{meta.label}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.mediaTitle} numberOfLines={2}>
              {mediaInfo.title}
            </Text>

            {/* Quality Selector */}
            {mediaInfo.qualities?.length > 1 && (
              <View style={styles.qualitySection}>
                <Text style={styles.sectionLabel}>Quality</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.qualityRow}>
                    {mediaInfo.qualities.map((q, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.qualityChip,
                          activeQuality?.quality === q.quality && styles.qualityChipActive,
                        ]}
                        onPress={() => setActiveQuality(q)}
                      >
                        <Text
                          style={[
                            styles.qualityChipText,
                            activeQuality?.quality === q.quality && styles.qualityChipTextActive,
                          ]}
                        >
                          {q.quality}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Download Buttons */}
            <View style={styles.downloadBtns}>
              {(activeQuality?.url || mediaInfo.videoUrl) && (
                <TouchableOpacity
                  style={[styles.dlBtn, styles.dlBtnPrimary]}
                  onPress={() =>
                    handleDownload(activeQuality?.url || mediaInfo.videoUrl!, false)
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="videocam" size={18} color="#fff" />
                  <Text style={styles.dlBtnText}>
                    Download Video{activeQuality ? ` (${activeQuality.quality})` : ""}
                  </Text>
                </TouchableOpacity>
              )}

              {mediaInfo.audioUrl && (
                <TouchableOpacity
                  style={[styles.dlBtn, styles.dlBtnAudio]}
                  onPress={() => handleDownload(mediaInfo.audioUrl!, true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="musical-note" size={18} color="#7C5CFC" />
                  <Text style={[styles.dlBtnText, { color: "#7C5CFC" }]}>
                    Download Audio (MP3)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={handleReset} style={styles.newDlLink}>
              <Text style={styles.newDlLinkText}>↩ Download another</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Downloading Progress */}
        {state === "downloading" && (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Downloading… {progress}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Done */}
        {state === "done" && (
          <View style={styles.doneCard}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.doneTitle}>Saved to Gallery!</Text>
            <Text style={styles.doneSubtitle}>
              Check your "Universal Downloader" album in your gallery app.
            </Text>
            <TouchableOpacity onPress={handleReset} style={styles.fetchBtn}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.fetchBtnText}>Download Another</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>by Umar J</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0f" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  header: { marginTop: 24, marginBottom: 20 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#7C5CFC18",
    alignItems: "center", justifyContent: "center",
  },
  appTitle: { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: "#555", marginLeft: 2 },

  // Platform badges
  platformScroll: { marginBottom: 24 },
  platformRow: { flexDirection: "row", gap: 10, paddingRight: 4 },
  platformBadge: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1, borderColor: "#222",
    backgroundColor: "#111",
    alignItems: "center", justifyContent: "center",
  },

  // Input
  inputCard: {
    backgroundColor: "#111318",
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#1e1e2e",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0d0d14",
    borderRadius: 12, borderWidth: 1, borderColor: "#222",
    paddingHorizontal: 12, marginBottom: 14, minHeight: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 12 },
  clearBtn: { padding: 4 },
  pasteBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: "#7C5CFC18", borderRadius: 8,
  },
  pasteBtnText: { color: "#7C5CFC", fontSize: 12, fontWeight: "600" },

  fetchBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#7C5CFC",
    borderRadius: 12, paddingVertical: 14,
  },
  fetchBtnDisabled: { backgroundColor: "#7C5CFC55" },
  fetchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Error
  errorCard: {
    backgroundColor: "#FF4D4D12", borderRadius: 14,
    borderWidth: 1, borderColor: "#FF4D4D33",
    padding: 16, alignItems: "center", gap: 8, marginBottom: 20,
  },
  errorText: { color: "#FF6B6B", fontSize: 14, textAlign: "center" },
  retryBtn: { marginTop: 4 },
  retryText: { color: "#7C5CFC", fontWeight: "600" },

  // Result
  resultCard: {
    backgroundColor: "#111318", borderRadius: 16,
    borderWidth: 1, borderColor: "#1e1e2e",
    overflow: "hidden", marginBottom: 20,
  },
  thumbContainer: { position: "relative" },
  thumbnail: { width: "100%", height: 200 },
  platformTag: {
    position: "absolute", top: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  platformTagText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  mediaTitle: {
    fontSize: 15, fontWeight: "600", color: "#e0e0e0",
    padding: 16, paddingBottom: 8,
  },

  // Quality
  qualitySection: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: { color: "#555", fontSize: 11, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  qualityRow: { flexDirection: "row", gap: 8 },
  qualityChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#2a2a3a",
    backgroundColor: "#0d0d14",
  },
  qualityChipActive: { borderColor: "#7C5CFC", backgroundColor: "#7C5CFC18" },
  qualityChipText: { color: "#666", fontSize: 13, fontWeight: "600" },
  qualityChipTextActive: { color: "#7C5CFC" },

  // Download btns
  downloadBtns: { padding: 16, gap: 10 },
  dlBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 12, paddingVertical: 14,
  },
  dlBtnPrimary: { backgroundColor: "#7C5CFC" },
  dlBtnAudio: { backgroundColor: "#7C5CFC14", borderWidth: 1, borderColor: "#7C5CFC44" },
  dlBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  newDlLink: { alignItems: "center", paddingBottom: 16 },
  newDlLinkText: { color: "#444", fontSize: 13 },

  // Progress
  progressCard: {
    backgroundColor: "#111318", borderRadius: 14,
    borderWidth: 1, borderColor: "#1e1e2e",
    padding: 20, marginBottom: 20, gap: 12,
  },
  progressLabel: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  progressTrack: { height: 6, backgroundColor: "#1e1e2e", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#7C5CFC", borderRadius: 3 },

  // Done
  doneCard: {
    backgroundColor: "#111318", borderRadius: 16,
    borderWidth: 1, borderColor: "#4CAF5033",
    padding: 32, alignItems: "center", gap: 10, marginBottom: 20,
  },
  doneTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  doneSubtitle: { color: "#555", fontSize: 13, textAlign: "center" },

  footer: { color: "#2a2a3a", textAlign: "center", fontSize: 12, marginTop: 10 },
});
