import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export type DownloadProgress = {
  bytesWritten: number;
  totalBytesExpectedToWrite: number;
  percent: number;
};

export async function downloadAndSave(
  url: string,
  filename: string,
  isAudio: boolean,
  onProgress?: (p: DownloadProgress) => void
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Request permission once — if already granted this resolves instantly
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return { success: false, error: "Storage permission denied. Please allow it in Settings." };
    }

    const ext = isAudio ? ".mp3" : ".mp4";
    const safeBase = filename.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 60);
    const safeFilename = safeBase + "_" + Date.now() + ext; // unique per download → no conflict
    const fileUri = FileSystem.cacheDirectory + safeFilename;

    // Clean up if somehow the exact file already exists (shouldn't happen with timestamp)
    const existing = await FileSystem.getInfoAsync(fileUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const total = downloadProgress.totalBytesExpectedToWrite;
        const written = downloadProgress.bytesWritten;
        const percent = total > 0 ? Math.round((written / total) * 100) : 0;
        onProgress?.({ bytesWritten: written, totalBytesExpectedToWrite: total, percent });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) throw new Error("Download returned no file");

    // Save to media library — copyAsset: true keeps the cache copy too (avoids "modify" dialog)
    const asset = await MediaLibrary.createAssetAsync(result.uri);

    // Create or add to album without moving the original asset
    const albums = await MediaLibrary.getAlbumsAsync();
    const existing_album = albums.find((a) => a.title === "Universal Downloader");
    if (existing_album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], existing_album, false);
    } else {
      await MediaLibrary.createAlbumAsync("Universal Downloader", asset, false);
    }

    return { success: true, path: result.uri };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Unknown download error" };
  }
}
