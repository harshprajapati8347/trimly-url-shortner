/**
 * Download an image (data URI or remote URL) to the user's device.
 * Client-only helper — only ever invoked from event handlers in the browser.
 */
export async function downloadImage(imageUrl?: string, fileName = "trimly-qr") {
  if (!imageUrl) return;

  if (imageUrl.startsWith("data:")) {
    triggerDownload(imageUrl, fileName);
    return;
  }

  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  triggerDownload(blobUrl, fileName);
  URL.revokeObjectURL(blobUrl);
}

function triggerDownload(href: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
