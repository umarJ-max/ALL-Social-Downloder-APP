import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { resolveMedia, MediaInfo, Quality, detectPlatform } from "../../utils/downloader";
import { downloadAndSave, DownloadProgress } from "../../utils/saveMedia";
import { getPlatformMeta } from "../../utils/platforms";

type AppState = "idle" | "fetching" | "ready" | "downloading" | "done" | "error";

export default function DownloadScreen() {
  const [url, setUrl] = useState("");
  const [appState, setAppState] = useState<AppState>("idle");
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<Quality | null>(null);

  const platform = url.trim() ? detectPlatform(url.trim()) : "unknown";
  const meta = getPlatformMeta(platform);

  async function handlePaste() {
    const text = await Clipboard.getStringAsync();
    if (text?.trim()) setUrl(text.trim());
  }

  function reset() {
    setUrl("");
    setAppState("idle");
    setMediaInfo(null);
    setError("");
    setProgress(0);
    setIndeterminate(false);
    setSelectedQuality(null);
  }

  async function handleFetch() {
    if (!url.trim()) return;
    setAppState("fetching");
    setMediaInfo(null);
    setError("");
    setSelectedQuality(null);

    const result = await resolveMedia(url.trim());
    if (result.success && result.mediaInfo) {
      setMediaInfo(result.mediaInfo);
      if (result.mediaInfo.qualities.length > 0) {
        setSelectedQuality(result.mediaInfo.qualities[0]);
      }
      setAppState("ready");
    } else {
      setError(result.error || "Could not fetch media. Check the URL and try again.");
      setAppState("error");
    }
  }

  async function handleDownload(isAudio = false) {
    if (!mediaInfo) return;
    const downloadUrl = isAudio
      ? mediaInfo.audioUrl!
      : (selectedQuality?.url || mediaInfo.videoUrl!);

    setAppState("downloading");
    setProgress(0);
    setIndeterminate(false);

    const result = await downloadAndSave(
      downloadUrl,
      mediaInfo.platform || "media",
      isAudio,
      mediaInfo.isImage ?? false,
      (p: DownloadProgress) => {
        if (p.percent === -1) {
          // Server didn't send Content-Length — show indeterminate
          setIndeterminate(true);
        } else {
          setIndeterminate(false);
          setProgress(p.percent);
        }
      }
    );

    if (result.success) {
      setAppState("done");
    } else {
      setError(result.error || "Download failed");
      setAppState("error");
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Ionicons name="arrow-down-circle" size={26} color="#7C5CFC" />
            </View>
            <Text style={s.appName}>Universal Downloader</Text>
          </View>
          <Text style={s.tagline}>Paste any video link and download.</Text>
        </View>

        {/* URL Input Card */}
        <View style={s.card}>
          <View style={[s.inputRow, url.trim() ? { borderColor: meta.color + "66" } : {}]}>
            <Ionicons
              name={(url.trim() ? meta.icon : "link-outline") as any}
              size={19}
              color={url.trim() ? meta.color : "#444"}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={s.input}
              placeholder="Paste video URL here…"
              placeholderTextColor="#3a3a4a"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleFetch}
            />
            {url.length > 0 ? (
              <TouchableOpacity onPress={() => setUrl("")}>
                <Ionicons name="close-circle" size={19} color="#3a3a4a" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={s.pasteBtn} onPress={handlePaste}>
                <Ionicons name="clipboard-outline" size={14} color="#7C5CFC" />
                <Text style={s.pasteTxt}>Paste</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[s.fetchBtn, (!url.trim() || appState === "fetching") && s.fetchBtnDim]}
            onPress={handleFetch}
            disabled={!url.trim() || appState === "fetching"}
            activeOpacity={0.8}
          >
            {appState === "fetching" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="search-outline" size={17} color="#fff" />
                <Text style={s.fetchTxt}>Fetch Media</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {appState === "error" && (
          <View style={s.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#FF5252" />
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={s.linkTxt}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ready State */}
        {appState === "ready" && mediaInfo && (
          <View style={s.resultCard}>
            {mediaInfo.thumbnail ? (
              <View style={s.thumbWrap}>
                <Image source={{ uri: mediaInfo.thumbnail }} style={s.thumb} resizeMode="cover" />
                <View style={[s.platformBadge, { backgroundColor: meta.color }]}>
                  <Ionicons name={meta.icon as any} size={11} color="#fff" />
                  <Text style={s.platformBadgeTxt}>{meta.label}</Text>
                </View>
              </View>
            ) : (
              <View style={[s.thumbPlaceholder, { borderColor: meta.color + "44" }]}>
                <Ionicons name={meta.icon as any} size={36} color={meta.color} />
                <Text style={{ color: meta.color, marginTop: 6, fontWeight: "600" }}>{meta.label}</Text>
              </View>
            )}

            <Text style={s.mediaTitle} numberOfLines={2}>{mediaInfo.title}</Text>

            {mediaInfo.qualities.length > 1 && (
              <View style={s.qualitySection}>
                <Text style={s.sectionLabel}>Select Quality</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={s.chips}>
                    {mediaInfo.qualities.map((q, i) => {
                      const active = selectedQuality?.quality === q.quality;
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[s.chip, active && s.chipActive]}
                          onPress={() => setSelectedQuality(q)}
                        >
                          <Text style={[s.chipTxt, active && s.chipTxtActive]}>{q.quality}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {mediaInfo.qualities.length <= 1 && mediaInfo.videoUrl && (
              <View style={s.qualityNote}>
                <Ionicons name="information-circle-outline" size={14} color="#555" />
                <Text style={s.qualityNoteTxt}>
                  Best available quality will be downloaded.
                </Text>
              </View>
            )}

            <View style={s.dlBtns}>
              {(selectedQuality?.url || mediaInfo.videoUrl) && (
                <TouchableOpacity
                  style={s.dlBtnPrimary}
                  onPress={() => handleDownload(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={mediaInfo.isImage ? "image" : "videocam"} size={17} color="#fff" />
                  <Text style={s.dlBtnTxt}>
                    {mediaInfo.isImage
                      ? "Download Image"
                      : `Download Video${selectedQuality && mediaInfo.qualities.length > 1 ? ` (${selectedQuality.quality})` : ""}`}
                  </Text>
                </TouchableOpacity>
              )}

              {mediaInfo.audioUrl && (
                <TouchableOpacity
                  style={s.dlBtnSecondary}
                  onPress={() => handleDownload(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="musical-note" size={17} color="#7C5CFC" />
                  <Text style={[s.dlBtnTxt, { color: "#7C5CFC" }]}>Download Audio (MP3)</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={reset} style={s.anotherBtn}>
              <Text style={s.anotherTxt}>↩ Download another</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Downloading */}
        {appState === "downloading" && (
          <View style={s.progressCard}>
            <Text style={s.progressLabel}>
              {indeterminate ? "Downloading…" : `Downloading… ${progress}%`}
            </Text>
            <View style={s.progressTrack}>
              {indeterminate ? (
                <ActivityIndicator color="#7C5CFC" size="small" style={{ alignSelf: "center", marginTop: 4 }} />
              ) : (
                <View style={[s.progressFill, { width: `${progress}%` }]} />
              )}
            </View>
            <Text style={s.progressSub}>Do not close the app</Text>
          </View>
        )}

        {/* Done */}
        {appState === "done" && (
          <View style={s.doneCard}>
            <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
            <Text style={s.doneTitle}>Saved!</Text>
            <Text style={s.doneSub}>File saved to your gallery.</Text>
            <TouchableOpacity style={[s.fetchBtn, { marginTop: 16 }]} onPress={reset}>
              <Ionicons name="add" size={17} color="#fff" />
              <Text style={s.fetchTxt}>Download Another</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0f" },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  header: { marginTop: 22, marginBottom: 22 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  logoBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "#7C5CFC1A", alignItems: "center", justifyContent: "center",
  },
  appName: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.3 },
  tagline: { color: "#444", fontSize: 13, marginLeft: 2 },
  card: {
    backgroundColor: "#111218", borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "#1c1c2e", marginBottom: 18,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0c0c14", borderRadius: 11,
    borderWidth: 1, borderColor: "#1e1e30",
    paddingHorizontal: 12, minHeight: 48, marginBottom: 12,
  },
  input: { flex: 1, color: "#ddd", fontSize: 13, paddingVertical: 10 },
  pasteBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#7C5CFC18", paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 8,
  },
  pasteTxt: { color: "#7C5CFC", fontSize: 12, fontWeight: "700" },
  fetchBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, backgroundColor: "#7C5CFC", borderRadius: 12, paddingVertical: 13,
  },
  fetchBtnDim: { opacity: 0.4 },
  fetchTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  errorCard: {
    backgroundColor: "#1a0d0d", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#FF525230",
    alignItems: "center", gap: 8, marginBottom: 18,
  },
  errorTxt: { color: "#FF7070", fontSize: 13, textAlign: "center", lineHeight: 19 },
  linkTxt: { color: "#7C5CFC", fontWeight: "600", fontSize: 13, marginTop: 2 },
  resultCard: {
    backgroundColor: "#111218", borderRadius: 16,
    borderWidth: 1, borderColor: "#1c1c2e",
    overflow: "hidden", marginBottom: 18,
  },
  thumbWrap: { position: "relative" },
  thumb: { width: "100%", height: 196 },
  platformBadge: {
    position: "absolute", top: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  platformBadgeTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  thumbPlaceholder: {
    height: 110, alignItems: "center", justifyContent: "center",
    borderBottomWidth: 1,
  },
  mediaTitle: { fontSize: 14, fontWeight: "600", color: "#ccc", padding: 14, paddingBottom: 6 },
  qualitySection: { paddingHorizontal: 14, paddingBottom: 8 },
  sectionLabel: { color: "#444", fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  chips: { flexDirection: "row", gap: 7 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: "#232335", backgroundColor: "#0c0c14",
  },
  chipActive: { borderColor: "#7C5CFC", backgroundColor: "#7C5CFC1A" },
  chipTxt: { color: "#555", fontSize: 13, fontWeight: "600" },
  chipTxtActive: { color: "#7C5CFC" },
  qualityNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    paddingHorizontal: 14, paddingBottom: 8,
  },
  qualityNoteTxt: { color: "#444", fontSize: 12, flex: 1, lineHeight: 17 },
  dlBtns: { padding: 14, gap: 9 },
  dlBtnPrimary: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, backgroundColor: "#7C5CFC", borderRadius: 12, paddingVertical: 13,
  },
  dlBtnSecondary: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, backgroundColor: "#7C5CFC14",
    borderWidth: 1, borderColor: "#7C5CFC40",
    borderRadius: 12, paddingVertical: 13,
  },
  dlBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  anotherBtn: { alignItems: "center", paddingBottom: 14 },
  anotherTxt: { color: "#333", fontSize: 12 },
  progressCard: {
    backgroundColor: "#111218", borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: "#1c1c2e", marginBottom: 18, gap: 10,
  },
  progressLabel: { color: "#bbb", fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 5, backgroundColor: "#1c1c2e", borderRadius: 3, overflow: "hidden", justifyContent: "center" },
  progressFill: { height: "100%", backgroundColor: "#7C5CFC", borderRadius: 3 },
  progressSub: { color: "#333", fontSize: 11 },
  doneCard: {
    backgroundColor: "#0d1a0d", borderRadius: 16, padding: 28,
    borderWidth: 1, borderColor: "#4CAF5030",
    alignItems: "center", gap: 8, marginBottom: 18,
  },
  doneTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  doneSub: { color: "#555", fontSize: 13, textAlign: "center", lineHeight: 19 },
});
