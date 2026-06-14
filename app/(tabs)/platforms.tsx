import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PLATFORMS = [
  {
    icon: "logo-youtube",
    color: "#FF0000",
    label: "YouTube",
    what: "Videos & Shorts",
    details: "Download any YouTube video or Short. Audio-only (MP3) download also available.",
  },
  {
    icon: "musical-notes",
    color: "#69C9D0",
    label: "TikTok",
    what: "Videos",
    details: "Downloads TikTok videos without watermark.",
  },
  {
    icon: "logo-instagram",
    color: "#E1306C",
    label: "Instagram",
    what: "Reels & Videos",
    details: "Download Reels and video posts. Public accounts only — private accounts won't work.",
  },
  {
    icon: "logo-facebook",
    color: "#1877F2",
    label: "Facebook",
    what: "Videos & Reels",
    details: "Download public Facebook videos and Reels.",
  },
  {
    icon: "logo-twitter",
    color: "#1DA1F2",
    label: "Twitter / X",
    what: "Videos & GIFs",
    details: "Download videos and GIFs from tweets. GIFs are saved as MP4.",
  },
  {
    icon: "logo-pinterest",
    color: "#E60023",
    label: "Pinterest",
    what: "Videos & Images",
    details: "Download Pinterest video pins as MP4 and image pins as JPG. Public pins only.",
  },
  {
    icon: "logo-reddit",
    color: "#FF4500",
    label: "Reddit",
    what: "Videos & GIFs",
    details: "Download videos from public Reddit posts.",
  },
  {
    icon: "play-circle",
    color: "#1AB7EA",
    label: "Vimeo",
    what: "Videos",
    details: "Download public Vimeo videos. Password-protected videos are not supported.",
  },
  {
    icon: "play",
    color: "#0066DC",
    label: "Dailymotion",
    what: "Videos",
    details: "Download public videos from Dailymotion.",
  },
  {
    icon: "chatbubble-ellipses",
    color: "#FFFC00",
    label: "Snapchat",
    what: "Spotlight Videos",
    details: "Only public Spotlight content can be downloaded.",
  },
  {
    icon: "logo-linkedin",
    color: "#0A66C2",
    label: "LinkedIn",
    what: "Videos",
    details: "Download videos from public LinkedIn posts.",
  },
];

export default function PlatformsScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.title}>Supported Platforms</Text>
          <Text style={s.subtitle}>{PLATFORMS.length} platforms — paste any link in the Download tab.</Text>
        </View>

        {PLATFORMS.map((p, i) => (
          <View key={i} style={[s.card, { borderLeftColor: p.color }]}>
            <View style={s.cardTop}>
              <View style={[s.iconBox, { backgroundColor: p.color + "18" }]}>
                <Ionicons name={p.icon as any} size={22} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.platformName}>{p.label}</Text>
                <View style={[s.whatBadge, { backgroundColor: p.color + "18" }]}>
                  <Text style={[s.whatTxt, { color: p.color }]}>{p.what}</Text>
                </View>
              </View>
            </View>
            <Text style={s.details}>{p.details}</Text>
          </View>
        ))}

        <View style={s.notice}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#333" />
          <Text style={s.noticeTxt}>
            Only public content can be downloaded. Always respect copyright and the rules of the platform you're downloading from.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0f" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { marginTop: 22, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 6 },
  subtitle: { color: "#444", fontSize: 13 },
  card: {
    backgroundColor: "#111218", borderRadius: 14,
    borderWidth: 1, borderColor: "#1c1c2e",
    borderLeftWidth: 3, padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  iconBox: {
    width: 42, height: 42, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  platformName: { color: "#e0e0e0", fontWeight: "700", fontSize: 15, marginBottom: 5 },
  whatBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  whatTxt: { fontSize: 11, fontWeight: "700" },
  details: { color: "#555", fontSize: 13, lineHeight: 19 },
  notice: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    marginTop: 8, padding: 14,
    backgroundColor: "#111218", borderRadius: 12,
    borderWidth: 1, borderColor: "#1c1c2e",
  },
  noticeTxt: { color: "#333", fontSize: 12, flex: 1, lineHeight: 17 },
});
