import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const APP_VERSION = "1.0.0";
const DEVELOPER = "Umar J";
const GITHUB = "https://github.com/umarj-max";

const SECTIONS = [
  {
    icon: "shield-checkmark-outline" as const,
    color: "#7C5CFC",
    title: "Copyright & Fair Use",
    body:
      "This app is a personal tool for downloading publicly available media for offline, personal use only. Downloading copyrighted content without the rights holder's permission may violate copyright law. Do not use this app to download and redistribute content you do not own.",
  },
  {
    icon: "ban-outline" as const,
    color: "#FF5252",
    title: "Platform Terms of Service",
    body:
      "Downloading content may violate the Terms of Service of the source platform (YouTube, Instagram, TikTok, etc.). Use this app responsibly and at your own risk. The developer is not liable for any misuse.",
  },
  {
    icon: "cloud-outline" as const,
    color: "#1AB7EA",
    title: "How It Works",
    body:
      "For most platforms, this app uses the ahm7xmakki.com free API to resolve direct download links. Pinterest uses a dedicated proxy deployed by the developer. No login credentials are stored or transmitted.",
  },
  {
    icon: "lock-closed-outline" as const,
    color: "#4CAF50",
    title: "Privacy",
    body:
      "No personal data is collected or stored. URLs are sent only to the download API to resolve media links. The app does not track usage or share any information with third parties.",
  },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* App Identity */}
        <View style={s.heroCard}>
          <View style={s.appIconBox}>
            <Ionicons name="arrow-down-circle" size={38} color="#7C5CFC" />
          </View>
          <Text style={s.appName}>Universal Downloader</Text>
          <Text style={s.versionBadge}>Version {APP_VERSION}</Text>
          <Text style={s.appDesc}>
            Download videos and images from any supported platform, saved directly to your gallery.
          </Text>
        </View>

        {/* Developer */}
        <View style={s.devCard}>
          <View style={s.devRow}>
            <View style={s.devAvatar}>
              <Ionicons name="person" size={20} color="#7C5CFC" />
            </View>
            <View>
              <Text style={s.devLabel}>Developed by</Text>
              <Text style={s.devName}>{DEVELOPER}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.githubBtn}
            onPress={() => Linking.openURL(GITHUB)}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-github" size={16} color="#ccc" />
            <Text style={s.githubTxt}>umarj-max on GitHub</Text>
            <Ionicons name="open-outline" size={13} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Info Sections */}
        {SECTIONS.map((sec, i) => (
          <View key={i} style={[s.infoCard, { borderLeftColor: sec.color }]}>
            <View style={s.infoHeader}>
              <Ionicons name={sec.icon} size={17} color={sec.color} />
              <Text style={s.infoTitle}>{sec.title}</Text>
            </View>
            <Text style={s.infoBody}>{sec.body}</Text>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>
            This app is provided as-is for personal use. The developer makes no warranties about the
            availability or reliability of third-party download APIs. Content availability depends
            on external services outside the developer's control.
          </Text>
        </View>

        <Text style={s.footer}>by Umar J · v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0f" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: "#111218", borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: "#1c1c2e",
    alignItems: "center", marginTop: 22, marginBottom: 14,
  },
  appIconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: "#7C5CFC18", alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  appName: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 6 },
  versionBadge: {
    backgroundColor: "#7C5CFC18", color: "#7C5CFC",
    fontSize: 11, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, marginBottom: 12,
    overflow: "hidden",
  },
  appDesc: { color: "#555", fontSize: 13, textAlign: "center", lineHeight: 20 },

  devCard: {
    backgroundColor: "#111218", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#1c1c2e", marginBottom: 14,
  },
  devRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  devAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#7C5CFC18", alignItems: "center", justifyContent: "center",
  },
  devLabel: { color: "#444", fontSize: 11, fontWeight: "600", marginBottom: 2 },
  devName: { color: "#e0e0e0", fontSize: 16, fontWeight: "800" },
  githubBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0c0c14", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "#1e1e30",
  },
  githubTxt: { color: "#bbb", fontSize: 13, fontWeight: "600", flex: 1 },

  infoCard: {
    backgroundColor: "#111218", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#1c1c2e",
    borderLeftWidth: 3, marginBottom: 10,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  infoTitle: { color: "#ccc", fontWeight: "700", fontSize: 14 },
  infoBody: { color: "#555", fontSize: 13, lineHeight: 20 },

  disclaimer: {
    backgroundColor: "#0f0f0f", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#181818", marginTop: 6, marginBottom: 14,
  },
  disclaimerTxt: { color: "#333", fontSize: 12, lineHeight: 18 },

  footer: { color: "#222", textAlign: "center", fontSize: 12, marginTop: 4 },
});
