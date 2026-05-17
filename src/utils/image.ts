export const compressImage = (file: File, maxSizeMB: number = 0.2): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions to prevent massive canvases
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Ensure it's under maxSizeMB (roughly bytes = base64 length * 0.75)
        const maxBytes = maxSizeMB * 1024 * 1024;
        const targetType = 'image/webp'; // Webp supports transparency AND quality compression
        
        // Start with high quality, reduce if needed
        let quality = 0.9;
        let dataUrl = canvas.toDataURL(targetType, quality);
        
        while (dataUrl.length * 0.75 > maxBytes && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL(targetType, quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
