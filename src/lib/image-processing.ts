export async function removeWhiteBackground(dataUrl: string, threshold: number = 230): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is light/white/grey
          // It must be bright (all > 180) and relatively desaturated/colorless (max - min < 35)
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);

          if (r > 180 && g > 180 && b > 180 && (max - min) < 35) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Canvas cross-origin error during processing", err);
        resolve(dataUrl); // fallback
      }
    };
    
    img.onerror = () => reject(new Error("Failed to load image for processing"));
    img.src = dataUrl;
  });
}
