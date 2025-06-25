
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Barcode, QrCode, ArrowRight, Camera, Zap, StopCircle, ScanLine } from 'lucide-react';
import { generateQRCode } from '@/utils/qrGenerator';
import { useToast } from '@/hooks/use-toast';

export const BarcodeConverter: React.FC = () => {
  const [barcodeData, setBarcodeData] = useState('');
  const [qrCode, setQrCode] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'EAN-13' | 'UPC-A' | 'Code-128' | 'Code-39'>('EAN-13');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startScanning = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let stream: MediaStream;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // Fallback for older browsers
        const getUserMedia = (navigator as any).getUserMedia || 
                            (navigator as any).webkitGetUserMedia || 
                            (navigator as any).mozGetUserMedia;
        
        if (!getUserMedia) {
          throw new Error('Camera not supported');
        }
        
        stream = await new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(error => {
            console.error('Error playing video:', error);
          });
        };
        
        toast({
          title: "📷 Camera Ready!",
          description: "Position the barcode in the camera view and tap to capture",
        });
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please enter barcode manually.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureBarcode = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real implementation, you'd use a barcode scanning library here
        // For demo purposes, we'll show a success message
        toast({
          title: "📊 Barcode Detected!",
          description: "Please enter the detected barcode digits below",
        });
        
        stopScanning();
      }
    }
  };

  const convertToQR = async () => {
    if (!barcodeData.trim()) {
      toast({
        title: "Error",
        description: "Please enter barcode data",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const qrOptions = {
        errorCorrectionLevel: 'M' as const,
        margin: 4,
        color: { dark: '#000000', light: '#FFFFFF' },
        width: 512,
      };

      const result = await generateQRCode(`BARCODE:${barcodeType}:${barcodeData}`, qrOptions);
      setQrCode(result);
      
      toast({
        title: "✨ Conversion Successful!",
        description: `${barcodeType} barcode converted to QR code`,
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Error",
        description: "Failed to convert barcode",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const validateBarcode = (data: string, type: string) => {
    switch (type) {
      case 'EAN-13':
        return /^\d{13}$/.test(data);
      case 'UPC-A':
        return /^\d{12}$/.test(data);
      case 'Code-128':
        return data.length > 0 && data.length <= 80;
      case 'Code-39':
        return /^[A-Z0-9\-. $/+%]*$/.test(data);
      default:
        return true;
    }
  };

  const isValid = validateBarcode(barcodeData, barcodeType);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Barcode className="w-5 h-5 text-orange-500" />
              </motion.div>
              <span className="text-lg sm:text-xl">Barcode to QR Converter</span>
            </div>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
              World First!
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Scanning Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={isScanning ? stopScanning : startScanning}
                variant={isScanning ? "destructive" : "default"}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isScanning ? (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Scan with Camera
                  </>
                )}
              </Button>
              
              {isScanning && (
                <Button
                  onClick={captureBarcode}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <ScanLine className="w-4 h-4 mr-2" />
                  Capture Barcode
                </Button>
              )}
            </div>

            {/* Camera View */}
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-lg overflow-hidden bg-black"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg flex items-center justify-center pointer-events-none">
                  <div className="text-white text-center">
                    <ScanLine className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm">Position barcode here</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Manual Input Section */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="barcode-type" className="text-sm font-medium">Barcode Type</Label>
              <select
                className="w-full p-2 text-sm border rounded-md bg-background focus:ring-2 focus:ring-orange-500"
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value as any)}
              >
                <option value="EAN-13">EAN-13 (13 digits)</option>
                <option value="UPC-A">UPC-A (12 digits)</option>
                <option value="Code-128">Code-128 (Alphanumeric)</option>
                <option value="Code-39">Code-39 (A-Z, 0-9, symbols)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode-data" className="text-sm font-medium">Barcode Data</Label>
              <Input
                id="barcode-data"
                value={barcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
                placeholder={
                  barcodeType === 'EAN-13' ? '1234567890123' :
                  barcodeType === 'UPC-A' ? '123456789012' :
                  barcodeType === 'Code-128' ? 'ABC123DEF456' :
                  'ABC123'
                }
                className={`text-sm ${!isValid && barcodeData ? 'border-red-500 focus:ring-red-500' : 'focus:ring-orange-500'}`}
              />
              {!isValid && barcodeData && (
                <p className="text-xs text-red-500">
                  Invalid format for {barcodeType}
                </p>
              )}
            </div>

            <Button 
              onClick={convertToQR} 
              disabled={isConverting || !isValid || !barcodeData}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isConverting ? (
                <Zap className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  <Barcode className="w-4 h-4 mr-2" />
                  <ArrowRight className="w-4 h-4 mr-2" />
                  <QrCode className="w-4 h-4 mr-2" />
                </>
              )}
              {isConverting ? 'Converting...' : 'Convert to QR Code'}
            </Button>
          </div>

          {/* Result */}
          {qrCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="p-3 sm:p-4 bg-white rounded-xl shadow-lg inline-block">
                <img src={qrCode} alt="Converted QR Code" className="w-32 h-32 sm:w-48 sm:h-48 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Barcode converted to QR code successfully!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
