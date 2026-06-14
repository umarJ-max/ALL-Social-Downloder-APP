# Universal Downloader — React Native (Expo)

Download videos from YouTube, TikTok, Instagram, Facebook, Twitter/X, Pinterest, Reddit, Vimeo, Dailymotion, and more.

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Install EAS CLI (if not already)
```bash
npm install -g eas-cli
eas login
```

### 3. Deploy the Pinterest API to Vercel

Copy `vercel-pinterest-api/pinterest.js` → `api/pinterest.js` in your existing Vercel project.

Then open `utils/downloader.ts` and update line 3:
```ts
const PINTEREST_PROXY_URL = "https://YOUR-VERCEL-PROJECT.vercel.app/api/pinterest";
```

### 4. Build APK (EAS Cloud)
```bash
eas build --platform android --profile preview
```

This triggers a cloud build. EAS will give you a download link for the `.apk` when done.
No local Android SDK needed.

---

## Assets needed

Place these in the `/assets` folder:
- `icon.png` (1024×1024)
- `splash.png` (1284×2778 recommended)
- `adaptive-icon.png` (1024×1024, no padding)

You can use a plain purple `#7C5CFC` background with a white download arrow icon.

---

## Project Structure

```
app/
  _layout.tsx        ← Expo Router root layout
  index.tsx          ← Main screen
utils/
  downloader.ts      ← API calls (Universal + Pinterest)
  saveMedia.ts       ← Download to gallery
  platforms.ts       ← Platform colors & icons
vercel-pinterest-api/
  pinterest.js       ← Deploy this to Vercel → api/pinterest.js
app.json             ← Expo config (package: com.umarj.universaldownloader)
eas.json             ← EAS build profiles
```

---

## Notes

- The universal API (`ahm7xmakki.com/api/alldl`) handles everything except Pinterest.
- Pinterest is handled by your own Vercel proxy since their site requires a real User-Agent.
- Downloaded files are saved to a "Universal Downloader" album in the device gallery.
- Audio-only download (MP3) is shown when the API provides `audioUrl`.
