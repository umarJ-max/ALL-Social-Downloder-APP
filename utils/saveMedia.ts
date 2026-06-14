import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export type DownloadProgress = {
  bytesWritten: number;
  totalBytesExpectedToWrite: number;
  percent: number;
};

function getExtension(url: string, isAudio: boolean, isImage: boolean): string {
  if (isAudio) return ".mp3";
  if (isImage) {
    // Force jpg for Pinterest images — they sometimes serve with no extension or wrong type
    if (url.includes("pinimg.com")) return ".jpg";
    if (url.match(/\.(png|gif|webp|jpeg|jpg)/i)) {
      const m = url.match(/\.(png|gif|webp|jpeg|jpg)/i);
      return "." + m![1].toLowerCase().replace("jpeg", "jpg");
    }
    return ".jpg";
  }
  return ".mp4";
}

export async function downloadAndSave(
  url: string,
  platformName: string,
  isAudio: boolean,
  isImage: boolean,
  onProgress?: (p: DownloadProgress) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return { success: false, error: "Storage permission denied. Please allow it in Settings." };
    }

    const ext = getExtension(url, isAudio, isImage);
    const safeBase = platformName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const filename = `${safeBase}_${Date.now()}${ext}`;
    const fileUri = FileSystem.cacheDirectory + filename;

    // Clean up if exists (shouldn't with timestamp but just in case)
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) await FileSystem.deleteAsync(fileUri, { idempotent: true });

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (dp) => {
        const total = dp.totalBytesExpectedToWrite;
        const written = dp.bytesWritten;
        // total can be -1 when server doesn't send Content-Length
        const percent = total > 0 ? Math.min(Math.round((written / total) * 100), 99) : -1;
        onProgress?.({
          bytesWritten: written,
          totalBytesExpectedToWrite: total,
          percent,
        });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) throw new Error("Download returned no file");

    // Save to gallery — createAssetAsync is enough, no album manipulation needed
    // Album operations trigger the "modify" dialog on Android 10+
    await MediaLibrary.createAssetAsync(result.uri);

    // Clean up cache file after saving to gallery
    await FileSystem.deleteAsync(result.uri, { idempotent: true });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Unknown download error" };
  }
}
