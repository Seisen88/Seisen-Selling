/**
 * Resolves a thumbnail URL.
 * - If it's already a full URL (starts with http), returns as-is.
 * - If it's a relative path (from Supabase storage), prepends the Supabase storage URL.
 * - Returns empty string if no URL given.
 */
export function resolveThumbnailUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Already a full URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Relative path — prepend Supabase storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    // Remove leading slash if present
    const cleanPath = url.startsWith("/") ? url.slice(1) : url;
    return `${supabaseUrl}/storage/v1/object/public/file-images/${cleanPath}`;
  }

  return url;
}

/**
 * Formats a byte count to human-readable (e.g., 2684354560 → "2.5 GB")
 */
export function formatFileSize(bytes: number | string | null | undefined): string {
  const n = Number(bytes);
  if (!n || n <= 0) return "";
  if (n >= 1024 ** 4) return `${(n / 1024 ** 4).toFixed(2).replace(/\.?0+$/, "")} TB`;
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2).replace(/\.?0+$/, "")} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(2).replace(/\.?0+$/, "")} MB`;
  return `${(n / 1024).toFixed(2).replace(/\.?0+$/, "")} KB`;
  return `${(n / 1024).toFixed(2).replace(/\.?0+$/, "")} KB`;
}

/**
 * Determines the status of a file based on its created_at and updated_at date.
 * Returns "NEW", "UPDATED", or null.
 * Disappears after 5 days.
 */
export function getFileStatus(createdAt: string | undefined, updatedAt: string | undefined): "NEW" | "UPDATED" | null {
  if (!updatedAt || !createdAt) return null;

  const now = new Date().getTime();
  const createdTime = new Date(createdAt).getTime();
  const updatedTime = new Date(updatedAt).getTime();
  
  const fiveDays = 5 * 24 * 60 * 60 * 1000;

  // We only show a badge if the latest action (create or update) happened within 5 days
  if (now - Math.max(createdTime, updatedTime) > fiveDays) {
    return null;
  }

  // If the file was updated after it was created (give a 1 minute buffer for initial creation times)
  if (updatedTime - createdTime > 60 * 1000) {
    return "UPDATED";
  }

  return "NEW";
}
