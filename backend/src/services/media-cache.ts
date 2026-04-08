import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, "..", "..", "data", "media");

// Ensure media directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

/**
 * Generate a deterministic filename from a URL (hash + extension).
 */
function urlToFilename(url: string): string {
  // Strip query params for hashing to get stable filenames across token refreshes
  const urlObj = new URL(url);
  const stablePart = urlObj.origin + urlObj.pathname;
  const hash = crypto.createHash("sha256").update(stablePart).digest("hex").substring(0, 16);

  // Guess extension from URL path
  const ext = path.extname(urlObj.pathname).split("?")[0] || ".jpg";
  return `${hash}${ext}`;
}

/**
 * Download an image and cache it locally. Returns the local filename if successful.
 * If the file already exists, skips the download.
 */
export async function cacheImage(
  imageUrl: string,
  liAt?: string,
  jsessionId?: string
): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    const filename = urlToFilename(imageUrl);
    const filepath = path.join(MEDIA_DIR, filename);

    // Skip if already cached
    if (fs.existsSync(filepath)) {
      return filename;
    }

    // Build headers — include LinkedIn cookies if available (needed for LinkedIn CDN)
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    };

    if (liAt && jsessionId) {
      const csrfToken = jsessionId.replace(/"/g, "");
      headers.Cookie = `li_at=${liAt}; JSESSIONID="${csrfToken}"`;
    }

    const res = await axios.get(imageUrl, {
      headers,
      responseType: "arraybuffer",
      timeout: 15000,
      maxRedirects: 5,
    });

    fs.writeFileSync(filepath, res.data);
    return filename;
  } catch (error) {
    console.error(
      `Failed to cache image: ${imageUrl.substring(0, 80)}...`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Get the absolute path to a cached media file.
 */
export function getCachedMediaPath(filename: string): string | null {
  const filepath = path.join(MEDIA_DIR, filename);
  if (fs.existsSync(filepath)) return filepath;
  return null;
}

/**
 * Delete cached media files older than the given number of days.
 */
export function cleanupOldMedia(maxAgeDays = 30): number {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let deleted = 0;

  try {
    for (const file of fs.readdirSync(MEDIA_DIR)) {
      const filepath = path.join(MEDIA_DIR, file);
      const stat = fs.statSync(filepath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filepath);
        deleted++;
      }
    }
  } catch (error) {
    console.error("Media cleanup error:", error instanceof Error ? error.message : error);
  }

  if (deleted > 0) console.log(`Media cleanup: deleted ${deleted} files older than ${maxAgeDays} days`);
  return deleted;
}
