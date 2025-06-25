
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Share2, 
  Copy, 
  Zap, 
  Eye, 
  Smartphone, 
  Monitor,
  Camera,
  Scan,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { EnhancedQRData } from './EnhancedQRGenerator';
import { downloadQRCode } from '@/utils/fileHandler';
import { useToast } from '@/hooks/use-toast';

interface AIQRPreviewProps {
  qrData: EnhancedQRData | null;
  isGenerating: boolean;
}

export const AIQRPreview: React.FC<AIQRPreviewProps> = ({ qrData, isGenerating }) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [scanQuality, setScanQuality] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (qrData) {
      analyzeScanQuality();
    }
  }, [qrData]);

  const analyzeScanQuality = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate quality based on various factors
    let quality = 70;
    if (qrData?.customization.errorCorrectionLevel === 'H') quality += 20;
    if (qrData?.customization.errorCorrectionLevel === 'Q') quality += 10;
    if (qrData?.customization.margin >= 4) quality += 10;
    
    setScanQuality(Math.min(quality, 100));
    setIsAnalyzing(false);
  };

  const handleDownload = (format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (!qrData?.qrCode) return;

    const filename = `qrcode-${Date.now()}.${format}`;
    downloadQRCode(qrData.qrCode, filename);
    
    toast({
      title: "✨ Downloaded!",
      description: `QR code saved as ${filename}`,
    });
  };

  const handleCopy = async () => {
    if (!qrData?.qrCode) return;

    try {
      const response = await fetch(qrData.qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Copied!",
        description: "QR code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!qrData?.qrCode) return;

    if (navigator.share) {
      try {
        const response = await fetch(qrData.qrCode);
        const blob = await response.blob();
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code!',
          files: [file]
        });
      } catch (error) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-500';
    if (quality >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return 'Excellent';
    if (quality >= 70) return 'Good';
    return 'Needs Improvement';
  };

  if (isGenerating) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <motion.div 
            className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-purple-500" />
            </motion.div>
          </motion.div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Generating Your QR Code</h3>
            <p className="text-muted-foreground">Creating your custom QR code...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!qrData) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Eye className="w-16 h-16 mx-auto opacity-20" />
          </motion.div>
          <div>
            <h3 className="text-xl font-medium mb-2">Preview Ready</h3>
            <p className="text-sm">Generate a QR code to see preview and testing options</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Mode Toggle */}
      <div className="flex justify-center">
        <Tabs value={previewMode} onValueChange={(value: 'desktop' | 'mobile') => setPreviewMode(value)}>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="desktop" className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* QR Code Display */}
      <motion.div
        layout
        className={`${previewMode === 'mobile' ? 'max-w-xs mx-auto' : ''}`}
      >
        <Card className="p-6 backdrop-blur-sm bg-card/80">
          <div className="text-center space-y-4">
            <motion.div 
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.img 
                src={qrData.qrCode} 
                alt="QR Code"
                className="w-48 h-48 mx-auto rounded-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {qrData.type.toUpperCase()}
              </Badge>
            </motion.div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {qrData.content.length > 50 
                  ? `${qrData.content.substring(0, 50)}...` 
                  : qrData.content
                }
              </p>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>Size: {qrData.customization.width}px</span>
                <span>•</span>
                <span>EC: {qrData.customization.errorCorrectionLevel}</span>
                <span>•</span>
                <span>{new Date(qrData.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quality Analysis */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Scan Quality Analysis
            </h4>
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </motion.div>
                <span className="text-sm text-muted-foreground">Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {scanQuality >= 90 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className={`text-sm font-medium ${getQualityColor(scanQuality)}`}>
                  {getQualityLabel(scanQuality)}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scan Quality Score</span>
              <span className="font-medium">{scanQuality}%</span>
            </div>
            <Progress value={scanQuality} className="h-2" />
          </div>

          {scanQuality < 90 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 Tip: Increase error correction level or add more margin for better scanning
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={() => handleDownload('png')} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleShare} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleCopy} variant="outline" className="w-full">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => handleDownload('jpg')} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            JPG
          </Button>
        </motion.div>
      </div>

      {/* Camera Testing Feature */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-300">Live Camera Test</span>
          </div>
          <Button size="sm" variant="outline" className="border-green-300">
            Test Scan
          </Button>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
          Test how well your QR code scans with different devices and lighting conditions
        </p>
      </Card>
    </div>
  );
};
