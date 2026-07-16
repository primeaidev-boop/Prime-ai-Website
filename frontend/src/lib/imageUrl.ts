/**
 * Converts any Google Drive share URL to a thumbnail URL that browsers can
 * load as an <img> src. Drive share links (/file/d/ID/view, open?id=ID)
 * return an HTML viewer page - not image bytes - so <img> renders a broken
 * icon. The /thumbnail endpoint always returns a real JPEG.
 *
 * Handles:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?export=view&id=FILE_ID  (HTML interstitial for big files)
 *
 * Non-Drive URLs are returned unchanged. Idempotent - safe to call at both
 * save time and render time.
 */
export function convertImageUrl(raw: string): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return trimmed;

  const driveId = (() => {
    const m1 = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (m1) return m1[1];
    const m2 = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*[?&]?id=([^&#]+)/);
    if (m2) return m2[1];
    return null;
  })();

  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }
  return trimmed;
}
