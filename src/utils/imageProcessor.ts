
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', quality));
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const embedLogoInQR = (
  qrDataUrl: string,
  logoDataUrl: string,
  logoSize: number = 0.2
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const qrImg = new Image();
    const logoImg = new Image();
    
    let imagesLoaded = 0;
    const checkLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        drawComposite();
      }
    };

    const drawComposite = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      
      // Draw QR code
      ctx.drawImage(qrImg, 0, 0);
      
      // Calculate logo position and size
      const logoWidth = qrImg.width * logoSize;
      const logoHeight = logoImg.height * (logoWidth / logoImg.width);
      const logoX = (qrImg.width - logoWidth) / 2;
      const logoY = (qrImg.height - logoHeight) / 2;
      
      // Draw white background for logo
      ctx.fillStyle = 'white';
      ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);
      
      // Draw logo
      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
      
      resolve(canvas.toDataURL('image/png'));
    };

    qrImg.onload = checkLoaded;
    qrImg.onerror = () => reject(new Error('Failed to load QR code'));
    
    logoImg.onload = checkLoaded;
    logoImg.onerror = () => reject(new Error('Failed to load logo'));
    
    qrImg.src = qrDataUrl;
    logoImg.src = logoDataUrl;
  });
};

export const applyImageStyle = (
  qrDataUrl: string,
  styleImage: string,
  blendMode: string = 'multiply',
  opacity: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const qrImg = new Image();
    const styleImg = new Image();
    
    let imagesLoaded = 0;
    const checkLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        drawStyled();
      }
    };

    const drawStyled = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      
      // Draw QR code
      ctx.drawImage(qrImg, 0, 0);
      
      // Apply blend mode and opacity
      ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
      ctx.globalAlpha = opacity;
      
      // Draw style image
      ctx.drawImage(styleImg, 0, 0, canvas.width, canvas.height);
      
      // Reset blend mode
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      
      resolve(canvas.toDataURL('image/png'));
    };

    qrImg.onload = checkLoaded;
    qrImg.onerror = () => reject(new Error('Failed to load QR code'));
    
    styleImg.onload = checkLoaded;
    styleImg.onerror = () => reject(new Error('Failed to load style image'));
    
    qrImg.src = qrDataUrl;
    styleImg.src = styleImage;
  });
};

export const addGradientOverlay = (
  qrDataUrl: string,
  gradientColors: string[],
  direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const qrImg = new Image();
    
    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      
      // Draw QR code
      ctx.drawImage(qrImg, 0, 0);
      
      // Create gradient
      let gradient;
      switch (direction) {
        case 'horizontal':
          gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          break;
        case 'vertical':
          gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          break;
        case 'diagonal':
        default:
          gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          break;
      }
      
      gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (gradientColors.length - 1), color);
      });
      
      // Apply gradient with blend mode
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL('image/png'));
    };
    
    qrImg.onerror = () => reject(new Error('Failed to load QR code'));
    qrImg.src = qrDataUrl;
  });
};
