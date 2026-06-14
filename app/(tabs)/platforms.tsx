import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PLATFORMS = [
  {
    key: "youtube",
    label: "YouTube",
    icon: "logo-youtube",
    color: "#FF0000",
    supports: ["Videos", "Shorts", "Audio (MP3)"],
    example: "youtube.com/watch?v=... or youtu.be/...",
    note: "Quality selection available when provided by API",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: "musical-notes",
    color: "#69C9D0",
    supports: ["Videos", "Audio"],
    example: "tiktok.com/@user/video/...",
    note: "Downloads without watermark (API-dependent)",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "logo-instagram",
    color: "#E1306C",
    supports: ["Reels", "Videos", "Posts"],
    example: "instagram.com/reel/... or /p/...",
    note: "Public posts only. Stories not supported.",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "logo-facebook",
    color: "#1877F2",
    supports: ["Videos", "Reels"],
    example: "facebook.com/watch?v=... or fb.watch/...",
    note: "Public videos only",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: "logo-twitter",
    color: "#1DA1F2",
    supports: ["Videos", "GIFs"],
    example: "twitter.com/.../status/... or x.com/...",
    note: "GIFs saved as MP4",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: "logo-pinterest",
    color: "#E60023",
    supports: ["Videos", "Images"],
    example: "pinterest.com/pin/... or pin.it/...",
    note: "Uses a separate proxy. Image pins download as JPG.",
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: "logo-reddit",
    color: "#FF4500",
    supports: ["Videos", "GIFs"],
    example: "reddit.com/r/.../comments/...",
    note: "Public posts only",
  },
  {
    key: "vimeo",
    label: "Vimeo",
    icon: "play-circle",
    color: "#1AB7EA",
    supports: ["Videos"],
    example: "vimeo.com/...",
    note: "Password-protected videos not supported",
  },
  {
    key: "dailymotion",
    label: "Dailymotion",
    icon: "play",
    color: "#0066DC",
    supports: ["Videos"],
    example: "dailymotion.com/video/...",
    note: null,
  },
  {
    key: "snapchat",
    label: "Snapchat",
    icon: "chatbubble-ellipses",
    color: "#FFFC00",
    supports: ["Spotlight videos"],
    example: "snapchat.com/spotlight/...",
    note: "Only public Spotlight content",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "logo-linkedin",
    color: "#0A66C2",
    supports: ["Videos"],
    example: "linkedin.com/posts/...",
    note: "Public posts only",
  },
];

export default function PlatformsScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Supported Platforms</Text>
          <Text style={s.subtitle}>
            {PLATFORMS.length} platforms supported. Paste the URL in the Download tab.
          </Text>
        </View>

        {PLATFORMS.map((p) => (
          <View key={p.key} style={[s.card, { borderLeftColor: p.color }]}>
            <View style={s.cardHeader}>
              <View style={[s.iconBox, { backgroundColor: p.color + "18" }]}>
                <Ionicons name={p.icon as any} size={22} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.platformName}>{p.label}</Text>
                <View style={s.tags}>
                  {p.supports.map((tag, i) => (
                    <View key={i} style={[s.tag, { backgroundColor: p.color + "18" }]}>
                      <Text style={[s.tagTxt, { color: p.color }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Text style={s.exampleLabel}>URL format</Text>
            <View style={s.exampleBox}>
              <Ionicons name="link-outline" size={13} color="#444" style={{ marginTop: 1 }} />
              <Text style={s.exampleTxt}>{p.example}</Text>
            </View>

            {p.note && (
              <View style={s.noteRow}>
                <Ionicons name="information-circle-outline" size={13} color="#555" />
                <Text style={s.noteTxt}>{p.note}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={s.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#333" />
          <Text style={s.footerTxt}>
            Only public content can be downloaded. Always respect copyright and platform terms of service.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0f" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  header: { marginTop: 22, marginBottom: 22 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 6 },
  subtitle: { color: "#444", fontSize: 13, lineHeight: 19 },

  card: {
    backgroundColor: "#111218", borderRadius: 14,
    borderWidth: 1, borderColor: "#1c1c2e",
    borderLeftWidth: 3, padding: 14, marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  iconBox: {
    width: 42, height: 42, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  platformName: { color: "#e0e0e0", fontWeight: "700", fontSize: 15, marginBottom: 6 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagTxt: { fontSize: 11, fontWeight: "700" },

  exampleLabel: { color: "#333", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 },
  exampleBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "#0c0c14", borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: "#1a1a28",
  },
  exampleTxt: { color: "#555", fontSize: 12, flex: 1, fontFamily: "monospace" },

  noteRow: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 8 },
  noteTxt: { color: "#444", fontSize: 12, flex: 1, lineHeight: 17 },

  footer: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    marginTop: 8, padding: 14,
    backgroundColor: "#111218", borderRadius: 12,
    borderWidth: 1, borderColor: "#1c1c2e",
  },
  footerTxt: { color: "#333", fontSize: 12, flex: 1, lineHeight: 17 },
});
