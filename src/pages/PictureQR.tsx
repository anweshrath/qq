import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Image, 
  Upload, 
  Camera, 
  Zap, 
  Eye, 
  Download,
  Sparkles,
  AlertCircle,
  StopCircle,
  QrCode,
  Settings,
  Share2,
  Copy,
  ArrowLeft,
  Wifi,
  Phone,
  Mail,
  User,
  CreditCard,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QROptions, generateQRCode, generateVCard, generateWiFi, generateUPI, generateSMS, generateEmail } from '@/utils/qrGenerator';
import { useToast } from '@/hooks/use-toast';

const qrTypes = [
  { id: 'url', label: 'Website URL', icon: QrCode, placeholder: 'https://example.com' },
  { id: 'text', label: 'Plain Text', icon: MessageSquare, placeholder: 'Enter your text here' },
  { id: 'wifi', label: 'WiFi Network', icon: Wifi, placeholder: 'Network Name' },
  { id: 'contact', label: 'Contact Card', icon: User, placeholder: 'John Doe' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'email@example.com' },
  { id: 'sms', label: 'SMS Message', icon: Phone, placeholder: '+1234567890' },
  { id: 'upi', label: 'UPI Payment', icon: CreditCard, placeholder: 'user@upi' }
];

export const PictureQR: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [qrType, setQrType] = useState('url');
  const [qrContent, setQrContent] = useState('');
  const [processedQR, setProcessedQR] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options with better defaults for scanning
  const [overlayOpacity, setOverlayOpacity] = useState([0.6]); // Reduced for better scanning
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H'); // High for better scanning
  const [qrSize, setQrSize] = useState([512]);
  const [margin, setMargin] = useState([6]); // Increased margin for better scanning
  const [enhanceContrast, setEnhanceContrast] = useState(true); // Default true for better scanning
  const [contrastLevel, setContrastLevel] = useState([1.5]); // Higher contrast
  const [brightness, setBrightness] = useState([0.8]); // Slightly darker for better QR visibility
  const [logoSize, setLogoSize] = useState([0.2]);
  const [cornerRadius, setCornerRadius] = useState([0]);
  
  // Contact form data
  const [contactData, setContactData] = useState({
    firstName: '', lastName: '', phone: '', email: '', organization: '', url: ''
  });
  
  // WiFi form data
  const [wifiData, setWifiData] = useState({
    ssid: '', password: '', security: 'WPA' as 'WPA' | 'WEP' | 'nopass', hidden: false
  });
  
  // UPI form data (no ugly link display)
  const [upiData, setUpiData] = useState({
    payeeId: '', payeeName: '', amount: 0, currency: 'INR', note: ''
  });
  
  // SMS form data
  const [smsData, setSmsData] = useState({
    phone: '', message: ''
  });
  
  // Email form data
  const [emailData, setEmailData] = useState({
    to: '', subject: '', body: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }

      toast({
        title: "📷 Camera Ready!",
        description: "Position yourself and tap capture",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/png');
      setSelectedImage(imageData);
      stopCamera();
      
      toast({
        title: "📸 Photo Captured!",
        description: "Photo captured successfully",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const getQRContent = () => {
    switch (qrType) {
      case 'contact':
        return generateVCard(contactData);
      case 'wifi':
        return generateWiFi(wifiData);
      case 'upi':
        // Clean UPI without ugly links
        const cleanUPI = generateUPI(upiData);
        return cleanUPI.replace(/https?:\/\/[^\s]+/g, '').trim();
      case 'sms':
        return generateSMS(smsData);
      case 'email':
        return generateEmail(emailData);
      default:
        return qrContent;
    }
  };

  const generatePictureQR = async () => {
    if (!selectedImage) {
      toast({
        title: "Missing Image",
        description: "Please select or capture an image",
        variant: "destructive",
      });
      return;
    }

    const content = getQRContent();
    if (!content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter QR content",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Optimized settings for better scanning
      const customization: QROptions = {
        errorCorrectionLevel: errorCorrection,
        margin: margin[0],
        color: {
          dark: '#000000', // Always black for best scanning
          light: '#FFFFFF', // Always white for best scanning
        },
        width: qrSize[0],
        logoSize: logoSize[0],
        cornerRadius: cornerRadius[0]
      };
      
      const baseQR = await generateQRCode(content, customization);
      const blendedQR = await blendImageWithQR(selectedImage, baseQR);
      
      // Add "Created by anwe.sh" watermark
      const finalQR = await addWatermark(blendedQR);
      
      setProcessedQR(finalQR);
      
      toast({
        title: "✨ Picture QR Generated!",
        description: "Your scannable picture QR code is ready",
      });
    } catch (error) {
      console.error('Error generating picture QR:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to create picture QR code",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addWatermark = (imageDataUrl: string): Promise<string> => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        // Draw the main image
        ctx.drawImage(img, 0, 0);

        // Add "Created by anwe.sh" watermark
        const fontSize = Math.max(10, img.width * 0.02);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.textAlign = 'right';
        ctx.fillText('Created by anwe.sh', img.width - 10, img.height - 10);

        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageDataUrl;
    });
  };

  const blendImageWithQR = (imageDataUrl: string, qrDataUrl: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = document.createElement('img');
      const qrImg = document.createElement('img');
      let imagesLoaded = 0;

      const checkLoaded = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
          processImages();
        }
      };

      const processImages = () => {
        try {
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;

          // Draw QR code first to preserve its structure
          ctx.drawImage(qrImg, 0, 0);
          const qrImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrPixels = qrImageData.data;

          // Clear and prepare for blending
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Apply image filters for better contrast
          if (enhanceContrast) {
            ctx.filter = `contrast(${contrastLevel[0]}) brightness(${brightness[0]})`;
          }
          
          // Scale and draw image
          const aspectRatio = img.width / img.height;
          const qrAspectRatio = qrImg.width / qrImg.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (aspectRatio > qrAspectRatio) {
            drawHeight = qrImg.height;
            drawWidth = drawHeight * aspectRatio;
            drawX = (qrImg.width - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = qrImg.width;
            drawHeight = drawWidth / aspectRatio;
            drawX = 0;
            drawY = (qrImg.height - drawHeight) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.filter = 'none';

          // Get blended image data
          const blendedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const blendedPixels = blendedImageData.data;

          // Apply QR pattern with optimized opacity for scanning
          for (let i = 0; i < qrPixels.length; i += 4) {
            const qrIsBlack = qrPixels[i] < 128;
            
            if (qrIsBlack) {
              // Make QR black areas much darker for better scanning
              const factor = 1 - overlayOpacity[0];
              blendedPixels[i] = Math.floor(blendedPixels[i] * factor * 0.3); // Much darker
              blendedPixels[i + 1] = Math.floor(blendedPixels[i + 1] * factor * 0.3);
              blendedPixels[i + 2] = Math.floor(blendedPixels[i + 2] * factor * 0.3);
            } else {
              // Keep white areas bright for contrast
              blendedPixels[i] = Math.min(255, blendedPixels[i] + 50);
              blendedPixels[i + 1] = Math.min(255, blendedPixels[i + 1] + 50);
              blendedPixels[i + 2] = Math.min(255, blendedPixels[i + 2] + 50);
            }
          }

          ctx.putImageData(blendedImageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      img.onload = checkLoaded;
      img.onerror = () => reject(new Error('Failed to load user image'));
      qrImg.onload = checkLoaded;
      qrImg.onerror = () => reject(new Error('Failed to load QR code'));

      img.src = imageDataUrl;
      qrImg.src = qrDataUrl;
    });
  };

  const downloadPictureQR = (format: 'png' | 'jpg' = 'png') => {
    if (!processedQR) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (format === 'jpg') {
        ctx!.fillStyle = 'white';
        ctx?.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
      link.download = `picture-qr-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Downloaded",
        description: `Picture QR code downloaded as ${format.toUpperCase()}`,
      });
    };
    
    img.src = processedQR;
  };

  const copyToClipboard = async () => {
    if (!processedQR) return;

    try {
      const response = await fetch(processedQR);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Copied",
        description: "Picture QR code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareQR = async () => {
    if (!processedQR || !navigator.share) {
      await copyToClipboard();
      return;
    }

    try {
      const response = await fetch(processedQR);
      const blob = await response.blob();
      const file = new File([blob], 'picture-qr.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'Picture QR Code',
        text: 'Check out this awesome picture QR code!',
        files: [file]
      });
    } catch (error) {
      await copyToClipboard();
    }
  };

  const renderQRForm = () => {
    switch (qrType) {
      case 'contact':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={contactData.firstName}
                  onChange={(e) => setContactData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={contactData.lastName}
                  onChange={(e) => setContactData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={contactData.phone}
                onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={contactData.email}
                onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Organization (Optional)</Label>
              <Input
                value={contactData.organization}
                onChange={(e) => setContactData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Company Name"
              />
            </div>
          </div>
        );
      
      case 'wifi':
        return (
          <div className="space-y-3">
            <div>
              <Label>Network Name (SSID)</Label>
              <Input
                value={wifiData.ssid}
                onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
                placeholder="MyWiFiNetwork"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={wifiData.password}
                onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
              />
            </div>
            <div>
              <Label>Security Type</Label>
              <Select value={wifiData.security} onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => setWifiData(prev => ({ ...prev, security: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Hidden Network</Label>
              <Switch
                checked={wifiData.hidden}
                onCheckedChange={(checked) => setWifiData(prev => ({ ...prev, hidden: checked }))}
              />
            </div>
          </div>
        );
      
      case 'upi':
        return (
          <div className="space-y-3">
            <div>
              <Label>UPI ID</Label>
              <Input
                value={upiData.payeeId}
                onChange={(e) => setUpiData(prev => ({ ...prev, payeeId: e.target.value }))}
                placeholder="user@upi"
              />
            </div>
            <div>
              <Label>Payee Name</Label>
              <Input
                value={upiData.payeeName}
                onChange={(e) => setUpiData(prev => ({ ...prev, payeeName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (Optional)</Label>
                <Input
                  type="number"
                  value={upiData.amount || ''}
                  onChange={(e) => setUpiData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={upiData.currency} onValueChange={(value) => setUpiData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Note (Optional)</Label>
              <Input
                value={upiData.note}
                onChange={(e) => setUpiData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Payment for..."
              />
            </div>
          </div>
        );
      
      case 'sms':
        return (
          <div className="space-y-3">
            <div>
              <Label>Phone Number</Label>
              <Input
                value={smsData.phone}
                onChange={(e) => setSmsData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={smsData.message}
                onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Your message here..."
                rows={3}
              />
            </div>
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <Label>Email Address</Label>
              <Input
                value={emailData.to}
                onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label>Subject (Optional)</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label>Body (Optional)</Label>
              <Textarea
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Email body..."
                rows={3}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <Label>Content</Label>
            <Textarea
              placeholder={qrTypes.find(t => t.id === qrType)?.placeholder || 'Enter content...'}
              value={qrContent}
              onChange={(e) => setQrContent(e.target.value)}
              rows={3}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Picture QR Studio
            </motion.h1>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
              Professional Scannable Picture QR Generator
            </Badge>
            <p className="text-lg text-muted-foreground">
              Transform your photos into scannable QR codes with guaranteed scan success
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Input Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-orange-500" />
                  Image Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload/Camera */}
                <div className="space-y-3">
                  <Label>Select or Capture Image</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      onClick={showCamera ? stopCamera : startCamera}
                      className="flex items-center gap-2"
                    >
                      {showCamera ? <StopCircle className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                      {showCamera ? 'Stop' : 'Camera'}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Camera View */}
                {showCamera && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg flex items-center justify-center pointer-events-none">
                        <div className="text-white text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                          <p className="text-sm">Position yourself here</p>
                        </div>
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <Button onClick={capturePhoto} className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                  </motion.div>
                )}

                {/* Selected Image Preview */}
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <Label>Selected Image</Label>
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        ✓ Ready
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* QR Content Section */}
            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-500" />
                  Content Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>QR Type</Label>
                  <Select value={qrType} onValueChange={setQrType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qrTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {renderQRForm()}
              </CardContent>
            </Card>

            {/* Advanced Customization Button */}
            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Advanced Customization
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Options Section (Collapsible) */}
          {showAdvanced && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    Scanning Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Overlay Opacity: {Math.round(overlayOpacity[0] * 100)}%</Label>
                    <p className="text-xs text-muted-foreground">Lower values improve scanability</p>
                    <Slider
                      value={overlayOpacity}
                      onValueChange={setOverlayOpacity}
                      min={0.1}
                      max={0.8}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label>Error Correction</Label>
                    <p className="text-xs text-muted-foreground mb-2">Higher levels improve scanability with image overlays</p>
                    <Select value={errorCorrection} onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setErrorCorrection(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%) - Not recommended</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%) - Recommended</SelectItem>
                        <SelectItem value="H">High (30%) - Best for images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enhance Contrast</Label>
                      <p className="text-xs text-muted-foreground">Improves QR pattern visibility</p>
                    </div>
                    <Switch
                      checked={enhanceContrast}
                      onCheckedChange={setEnhanceContrast}
                    />
                  </div>

                  {enhanceContrast && (
                    <>
                      <div className="space-y-2">
                        <Label>Contrast Level: {contrastLevel[0].toFixed(1)}</Label>
                        <Slider
                          value={contrastLevel}
                          onValueChange={setContrastLevel}
                          min={1.0}
                          max={2.5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Brightness: {brightness[0].toFixed(1)}</Label>
                        <Slider
                          value={brightness}
                          onValueChange={setBrightness}
                          min={0.5}
                          max={1.2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>QR Size: {qrSize[0]}px</Label>
                    <Slider
                      value={qrSize}
                      onValueChange={setQrSize}
                      min={256}
                      max={1024}
                      step={64}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Margin: {margin[0]} (Higher = Better scanning)</Label>
                    <Slider
                      value={margin}
                      onValueChange={setMargin}
                      min={2}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Preview Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Generate Button at the Top */}
            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
              <CardContent className="pt-6">
                <Button
                  onClick={generatePictureQR}
                  disabled={!selectedImage || !getQRContent().trim() || isProcessing}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Picture QR
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  Picture QR Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedQR ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <img
                        src={processedQR}
                        alt="Picture QR Code"
                        className="w-full max-w-sm mx-auto rounded-lg border shadow-lg"
                      />
                      <Badge className="mt-2 bg-green-500 text-white">
                        ✓ Optimized for Scanning
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => downloadPictureQR('png')}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        PNG
                      </Button>
                      
                      <Button
                        onClick={() => downloadPictureQR('jpg')}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        JPG
                      </Button>
                      
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      
                      <Button
                        onClick={shareQR}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Image className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Picture QR Preview</p>
                    <p className="text-sm">Upload an image and add content to generate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scanning Tips */}
            <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  Scanning Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">✅ For Best Results</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Use high error correction (Q or H)</li>
                    <li>• Keep opacity below 60%</li>
                    <li>• Use high contrast images</li>
                    <li>• Test scan before printing</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">📱 Scanning</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Hold camera 6-12 inches away</li>
                    <li>• Ensure good lighting</li>
                    <li>• Keep camera steady</li>
                    <li>• Try different QR scanner apps if needed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-border/50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-lg">Picture QR Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Part of <Link to="/" className="text-orange-500 hover:underline font-medium">Quantum QR</Link> Suite - Powered by <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-medium">anwe.sh</a>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Quantum QR. Professional QR solutions, free forever.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
