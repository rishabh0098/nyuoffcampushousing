/**
 * Allowlisted HTTPS hosts for listing media links (cloud folders/files).
 * Keep this list short and explicit — prefer adding hosts deliberately.
 */
const EXACT_HOSTS = new Set([
  "drive.google.com",
  "docs.google.com",
  "www.dropbox.com",
  "dropbox.com",
  "dl.dropboxusercontent.com",
  "app.box.com",
  "onedrive.live.com",
  "1drv.ms",
  "www.icloud.com",
  "icloud.com",
]);

const HOST_SUFFIXES = [
  ".app.box.com",
  ".sharepoint.com",
  ".onedrive.live.com",
  ".officeapps.live.com",
] as const;

/** True when `url` is HTTPS on an allowlisted cloud-storage host. */
export function isAllowedListingMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (EXACT_HOSTS.has(host)) return true;
    return HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

export type MediaEmbedInfo = {
  /** Original validated URL (open externally). */
  openUrl: string;
  /** iframe src when embeddable; null means link-out only. */
  embedUrl: string | null;
  providerLabel: string;
};

/**
 * Derive an embeddable preview URL when possible (Drive file/folder).
 * Org-restricted Drive still requires the viewer's Google session with access —
 * this only rewrites the URL shape; it does not bypass ACLs.
 */
export function resolveMediaEmbed(url: string): MediaEmbedInfo | null {
  if (!isAllowedListingMediaUrl(url)) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const openUrl = parsed.toString();

  if (host === "drive.google.com" || host === "docs.google.com") {
    return resolveGoogleDriveEmbed(parsed, openUrl);
  }

  if (host === "www.dropbox.com" || host === "dropbox.com") {
    return { openUrl, embedUrl: null, providerLabel: "Dropbox" };
  }

  if (host === "app.box.com" || host.endsWith(".app.box.com")) {
    return { openUrl, embedUrl: null, providerLabel: "Box" };
  }

  if (
    host === "onedrive.live.com" ||
    host.endsWith(".onedrive.live.com") ||
    host === "1drv.ms" ||
    host.endsWith(".sharepoint.com")
  ) {
    return { openUrl, embedUrl: null, providerLabel: "OneDrive" };
  }

  if (host === "www.icloud.com" || host === "icloud.com") {
    return { openUrl, embedUrl: null, providerLabel: "iCloud" };
  }

  return { openUrl, embedUrl: null, providerLabel: "Cloud storage" };
}

function resolveGoogleDriveEmbed(parsed: URL, openUrl: string): MediaEmbedInfo {
  const resourceKey = parsed.searchParams.get("resourcekey");
  const path = parsed.pathname;

  const fileMatch = path.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    const id = fileMatch[1];
    const embed = new URL(`https://drive.google.com/file/d/${id}/preview`);
    if (resourceKey) embed.searchParams.set("resourcekey", resourceKey);
    return { openUrl, embedUrl: embed.toString(), providerLabel: "Google Drive" };
  }

  const folderMatch = path.match(/\/folders\/([^/]+)/);
  const idParam = parsed.searchParams.get("id");

  if (folderMatch) {
    const folderId = folderMatch[1];
    const embed = new URL("https://drive.google.com/a/nyu.edu/embeddedfolderview");
    embed.searchParams.set("id", folderId);
    if (resourceKey) embed.searchParams.set("resourcekey", resourceKey);
    return {
      openUrl,
      embedUrl: `${embed.toString()}#grid`,
      providerLabel: "Google Drive",
    };
  }

  if (path.includes("embeddedfolderview") && idParam) {
    const embed = new URL("https://drive.google.com/a/nyu.edu/embeddedfolderview");
    embed.searchParams.set("id", idParam);
    if (resourceKey) embed.searchParams.set("resourcekey", resourceKey);
    return {
      openUrl,
      embedUrl: `${embed.toString()}#grid`,
      providerLabel: "Google Drive",
    };
  }

  // Docs / Sheets / Slides — open externally; iframe often blocked for Workspace.
  if (hostIsDocs(parsed.hostname) && path.match(/\/(document|spreadsheets|presentation)\//)) {
    return { openUrl, embedUrl: null, providerLabel: "Google Docs" };
  }

  // Ambiguous open?id= / share links — open externally rather than guessing file vs folder.
  return { openUrl, embedUrl: null, providerLabel: "Google Drive" };
}

function hostIsDocs(hostname: string): boolean {
  return hostname.toLowerCase() === "docs.google.com";
}
