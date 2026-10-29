/**
 * Mesure si une image possède un fond transparent (PNG/WebP).
 * Renvoie null en cas de doute (CORS, format illisible) : jamais bloquant.
 */
export async function hasTransparency(url: string): Promise<boolean | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    const w = (canvas.width = Math.min(128, img.naturalWidth || 128));
    const h = (canvas.height = Math.min(128, img.naturalHeight || 128));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) transparent++;
    }
    return transparent / (w * h) > 0.05;
  } catch {
    return null;
  }
}