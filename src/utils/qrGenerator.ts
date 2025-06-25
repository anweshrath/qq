
import QRCode from 'qrcode';

export interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  width: number;
  logo?: string;
  logoSize?: number;
  cornerRadius?: number;
  shape?: 'square' | 'circle' | 'rounded-square' | 'heart' | 'star' | 'diamond' | 'hexagon' | 'octagon' | 'triangle' | 'cross' | 'arrow' | 'shield' | 'leaf' | 'flower' | 'spiral';
  gradientColors?: string[];
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  cornerStyle?: 'square' | 'rounded' | 'circle';
  patternStyle?: 'square' | 'circle' | 'rounded';
  backgroundColor?: string;
  foregroundColor?: string;
}

export const generateQRCode = async (
  text: string,
  options: QROptions
): Promise<string> => {
  try {
    console.log('Generating QR code with options:', options);
    
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel,
      margin: options.margin,
      color: {
        dark: options.foregroundColor || options.color.dark,
        light: options.backgroundColor || options.color.light,
      },
      width: options.width,
      rendererOpts: {
        quality: 1
      }
    };

    // Generate base QR code
    let qrCodeDataUrl = await QRCode.toDataURL(text, qrOptions);
    
    // Apply gradient if specified
    if (options.gradientColors && options.gradientColors.length > 1) {
      qrCodeDataUrl = await applyGradient(qrCodeDataUrl, options.gradientColors, options.gradientDirection || 'diagonal');
    }
    
    // Apply pattern and corner styles
    if (options.patternStyle && options.patternStyle !== 'square' || 
        options.cornerStyle && options.cornerStyle !== 'square') {
      qrCodeDataUrl = await applyPatternAndCornerStyles(qrCodeDataUrl, options.patternStyle, options.cornerStyle);
    }
    
    // Apply shape transformation if specified
    if (options.shape && options.shape !== 'square') {
      qrCodeDataUrl = await applyQRShape(qrCodeDataUrl, options.shape);
    }
    
    // If logo is provided, embed it
    if (options.logo) {
      qrCodeDataUrl = await embedLogoInQR(qrCodeDataUrl, options.logo);
    }
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

const applyGradient = async (qrCodeDataUrl: string, colors: string[], direction: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrCodeDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
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
        
        colors.forEach((color, index) => {
          gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        // Draw original QR code
        ctx.drawImage(img, 0, 0);
        
        // Apply gradient only to dark pixels
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Restore original light pixels
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas.toDataURL());
      };
      
      img.onerror = () => {
        console.warn('Failed to apply gradient, using original QR code');
        resolve(qrCodeDataUrl);
      };
      
      img.src = qrCodeDataUrl;
    } catch (error) {
      console.warn('Failed to apply gradient:', error);
      resolve(qrCodeDataUrl);
    }
  });
};

const applyPatternAndCornerStyles = async (qrCodeDataUrl: string, patternStyle?: string, cornerStyle?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrCodeDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original QR code first
        ctx.drawImage(img, 0, 0);
        
        // Apply pattern/corner modifications
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple pattern modification (this is a basic implementation)
        if (patternStyle === 'circle' || cornerStyle === 'circle') {
          // Apply circular modifications to dark pixels
          for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
              const index = (y * canvas.width + x) * 4;
              if (data[index] < 128) { // Dark pixel
                // Draw small circles instead of squares
                ctx.fillStyle = `rgb(${data[index]}, ${data[index + 1]}, ${data[index + 2]})`;
                ctx.beginPath();
                ctx.arc(x + 2, y + 2, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                
                // Clear original pixel
                ctx.clearRect(x, y, 4, 4);
              }
            }
          }
        }
        
        resolve(canvas.toDataURL());
      };
      
      img.onerror = () => {
        console.warn('Failed to apply pattern styles, using original QR code');
        resolve(qrCodeDataUrl);
      };
      
      img.src = qrCodeDataUrl;
    } catch (error) {
      console.warn('Failed to apply pattern styles:', error);
      resolve(qrCodeDataUrl);
    }
  });
};

const applyQRShape = async (qrCodeDataUrl: string, shape: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrCodeDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Create clipping path based on shape
        ctx.save();
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
        
        ctx.beginPath();
        
        switch (shape) {
          case 'circle':
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            break;
          case 'rounded-square':
            const cornerRadius = radius * 0.2;
            roundRect(ctx, centerX - radius, centerY - radius, radius * 2, radius * 2, cornerRadius);
            break;
          case 'heart':
            drawHeart(ctx, centerX, centerY, radius);
            break;
          case 'star':
            drawStar(ctx, centerX, centerY, radius, 5);
            break;
          case 'diamond':
            drawDiamond(ctx, centerX, centerY, radius);
            break;
          case 'hexagon':
            drawPolygon(ctx, centerX, centerY, radius, 6);
            break;
          case 'octagon':
            drawPolygon(ctx, centerX, centerY, radius, 8);
            break;
          case 'triangle':
            drawPolygon(ctx, centerX, centerY, radius, 3);
            break;
          case 'cross':
            drawCross(ctx, centerX, centerY, radius);
            break;
          case 'arrow':
            drawArrow(ctx, centerX, centerY, radius);
            break;
          case 'shield':
            drawShield(ctx, centerX, centerY, radius);
            break;
          case 'leaf':
            drawLeaf(ctx, centerX, centerY, radius);
            break;
          case 'flower':
            drawFlower(ctx, centerX, centerY, radius);
            break;
          case 'spiral':
            drawSpiral(ctx, centerX, centerY, radius);
            break;
          default:
            const defaultRadius = radius * 0.1;
            roundRect(ctx, centerX - radius, centerY - radius, radius * 2, radius * 2, defaultRadius);
        }
        
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        resolve(canvas.toDataURL());
      };
      
      img.onerror = () => {
        console.warn('Failed to apply shape, using original QR code');
        resolve(qrCodeDataUrl);
      };
      
      img.src = qrCodeDataUrl;
    } catch (error) {
      console.warn('Failed to apply shape:', error);
      resolve(qrCodeDataUrl);
    }
  });
};

// Helper function for rounded rectangles
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
};

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const heartSize = size * 0.8;
  ctx.moveTo(x, y + heartSize / 4);
  ctx.bezierCurveTo(x, y - heartSize / 4, x - heartSize / 2, y - heartSize / 4, x - heartSize / 2, y);
  ctx.bezierCurveTo(x - heartSize / 2, y + heartSize / 4, x, y + heartSize / 2, x, y + heartSize);
  ctx.bezierCurveTo(x, y + heartSize / 2, x + heartSize / 2, y + heartSize / 4, x + heartSize / 2, y);
  ctx.bezierCurveTo(x + heartSize / 2, y - heartSize / 4, x, y - heartSize / 4, x, y + heartSize / 4);
};

const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, points: number) => {
  const outerRadius = radius;
  const innerRadius = radius * 0.4;
  const angle = Math.PI / points;
  
  ctx.moveTo(x, y - outerRadius);
  
  for (let i = 0; i < points * 2; i++) {
    const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
    const currentAngle = i * angle - Math.PI / 2;
    ctx.lineTo(
      x + Math.cos(currentAngle) * currentRadius,
      y + Math.sin(currentAngle) * currentRadius
    );
  }
  
  ctx.closePath();
};

const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
};

const drawPolygon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, sides: number) => {
  const angle = (2 * Math.PI) / sides;
  ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
  
  for (let i = 1; i < sides; i++) {
    ctx.lineTo(
      x + radius * Math.cos(i * angle),
      y + radius * Math.sin(i * angle)
    );
  }
  
  ctx.closePath();
};

const drawCross = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const thickness = size * 0.3;
  ctx.rect(x - thickness / 2, y - size, thickness, size * 2);
  ctx.rect(x - size, y - thickness / 2, size * 2, thickness);
};

const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.moveTo(x - size, y - size * 0.3);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.lineTo(x + size * 0.3, y - size * 0.6);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.6);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.lineTo(x - size, y + size * 0.3);
  ctx.closePath();
};

const drawShield = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.7, y - size * 0.7);
  ctx.lineTo(x + size * 0.7, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.7, y + size, x, y + size);
  ctx.quadraticCurveTo(x - size * 0.7, y + size, x - size * 0.7, y + size * 0.3);
  ctx.lineTo(x - size * 0.7, y - size * 0.7);
  ctx.closePath();
};

const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.moveTo(x, y + size);
  ctx.quadraticCurveTo(x - size, y, x, y - size);
  ctx.quadraticCurveTo(x + size, y, x, y + size);
};

const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const petalCount = 6;
  const petalSize = size * 0.6;
  
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 2 * Math.PI) / petalCount;
    const petalX = x + Math.cos(angle) * petalSize * 0.5;
    const petalY = y + Math.sin(angle) * petalSize * 0.5;
    
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      petalX + Math.cos(angle + Math.PI / 2) * petalSize * 0.3,
      petalY + Math.sin(angle + Math.PI / 2) * petalSize * 0.3,
      petalX,
      petalY
    );
    ctx.quadraticCurveTo(
      petalX + Math.cos(angle - Math.PI / 2) * petalSize * 0.3,
      petalY + Math.sin(angle - Math.PI / 2) * petalSize * 0.3,
      x,
      y
    );
  }
  
  ctx.arc(x, y, size * 0.2, 0, 2 * Math.PI);
};

const drawSpiral = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const turns = 3;
  const steps = 100;
  
  ctx.moveTo(x, y);
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * turns * 2 * Math.PI;
    const radius = (i / steps) * size;
    const spiralX = x + Math.cos(angle) * radius;
    const spiralY = y + Math.sin(angle) * radius;
    ctx.lineTo(spiralX, spiralY);
  }
  
  // Create a thick spiral by drawing multiple paths
  ctx.lineWidth = size * 0.1;
  ctx.stroke();
  ctx.fill();
};

const embedLogoInQR = async (qrCodeDataUrl: string, logoDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrCodeDataUrl);
        return;
      }

      const qrImage = new Image();
      qrImage.onload = () => {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        
        ctx.drawImage(qrImage, 0, 0);
        
        const logoImage = new Image();
        logoImage.onload = () => {
          const logoSize = Math.min(qrImage.width, qrImage.height) * 0.2;
          const logoX = (qrImage.width - logoSize) / 2;
          const logoY = (qrImage.height - logoSize) / 2;
          
          ctx.fillStyle = 'white';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
          
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          
          resolve(canvas.toDataURL());
        };
        
        logoImage.onerror = () => {
          console.warn('Failed to load logo, using QR code without logo');
          resolve(qrCodeDataUrl);
        };
        
        logoImage.src = logoDataUrl;
      };
      
      qrImage.onerror = () => {
        reject(new Error('Failed to load QR code image'));
      };
      
      qrImage.src = qrCodeDataUrl;
    } catch (error) {
      console.warn('Failed to embed logo:', error);
      resolve(qrCodeDataUrl);
    }
  });
};

export const generateVCard = (contact: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization?: string;
  url?: string;
}): string => {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.firstName} ${contact.lastName}`,
    `N:${contact.lastName};${contact.firstName};;;`,
    contact.phone && `TEL:${contact.phone}`,
    contact.email && `EMAIL:${contact.email}`,
    contact.organization && `ORG:${contact.organization}`,
    contact.url && `URL:${contact.url}`,
    'END:VCARD'
  ].filter(Boolean).join('\n');
  
  return vcard;
};

export const generateWiFi = (wifi: {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}): string => {
  return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`;
};

export const generateUPI = (upi: {
  payeeId: string;
  payeeName: string;
  amount?: number;
  currency?: string;
  note?: string;
}): string => {
  let upiString = `upi://pay?pa=${upi.payeeId}&pn=${encodeURIComponent(upi.payeeName)}`;
  
  if (upi.amount) {
    upiString += `&am=${upi.amount}`;
  }
  
  if (upi.currency) {
    upiString += `&cu=${upi.currency}`;
  }
  
  if (upi.note) {
    upiString += `&tn=${encodeURIComponent(upi.note)}`;
  }
  
  return upiString;
};

export const generateSMS = (sms: {
  phone: string;
  message: string;
}): string => {
  return `sms:${sms.phone}?body=${encodeURIComponent(sms.message)}`;
};

export const generateEmail = (email: {
  to: string;
  subject?: string;
  body?: string;
}): string => {
  let emailString = `mailto:${email.to}`;
  const params = [];
  
  if (email.subject) {
    params.push(`subject=${encodeURIComponent(email.subject)}`);
  }
  
  if (email.body) {
    params.push(`body=${encodeURIComponent(email.body)}`);
  }
  
  if (params.length > 0) {
    emailString += `?${params.join('&')}`;
  }
  
  return emailString;
};
