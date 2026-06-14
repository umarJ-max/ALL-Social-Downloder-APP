import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

export type DownloadProgress = {
  bytesWritten: number;
  totalBytesExpectedToWrite: number;
  percent: number;
};

export async function downloadAndSave(
  url: string,
  filename: string,
  onProgress?: (p: DownloadProgress) => void
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return { success: false, error: "Storage permission denied" };
    }

    const ext = filename.endsWith(".mp3") ? ".mp3" : ".mp4";
    const safeFilename = filename.replace(/[^a-zA-Z0-9_\-]/g, "_") + ext;
    const fileUri = FileSystem.cacheDirectory + safeFilename;

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const percent =
          downloadProgress.totalBytesExpectedToWrite > 0
            ? (downloadProgress.bytesWritten /
                downloadProgress.totalBytesExpectedToWrite) *
              100
            : 0;
        onProgress?.({
          ...downloadProgress,
          percent: Math.round(percent),
        });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) throw new Error("Download failed");

    const asset = await MediaLibrary.createAssetAsync(result.uri);
    await MediaLibrary.createAlbumAsync("Universal Downloader", asset, false);

    return { success: true, path: result.uri };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function shareFile(uri: string) {
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri);
  }
}
