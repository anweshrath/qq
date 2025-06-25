
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Eye, 
  Palette, 
  Camera,
  Download,
  Share2,
  Scan,
  Globe,
  Barcode,
  Info,
  Settings,
  Zap,
  Layers,
  Image,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QROptions, generateQRCode } from '@/utils/qrGenerator';
import { QRInput } from './QRInput';
import { AdvancedCustomization } from './AdvancedCustomization';
import { QRPreview } from './QRPreview';
import { SmartQRHistory } from './SmartQRHistory';
import { QRAnalytics } from './QRAnalytics';
import { CustomizableCard } from './CustomizableCard';
import { BarcodeConverter } from './BarcodeConverter';
import { DonationCard } from './DonationCard';
import { BatchGenerator } from './BatchGenerator';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface EnhancedQRData {
  id: string;
  type: string;
  content: string;
  customization: QROptions & {
    logo?: string;
    gradientColors?: string[];
    gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
    cornerStyle?: 'square' | 'rounded' | 'circle';
    patternStyle?: 'square' | 'circle' | 'rounded';
    backgroundColor?: string;
    foregroundColor?: string;
    shape?: 'square' | 'circle' | 'rounded-square' | 'heart' | 'star' | 'diamond' | 'hexagon' | 'octagon' | 'triangle' | 'cross' | 'arrow' | 'shield' | 'leaf' | 'flower' | 'spiral';
    texture?: string;
    animation?: 'none' | 'pulse' | 'glow' | 'breathe';
  };
  qrCode: string;
  timestamp: number;
  analytics?: {
    scans: number;
    uniqueUsers: number;
    locations: string[];
    devices: string[];
  };
}

const workingFeatures = [
  {
    id: 'high-quality',
    title: 'High Quality Output',
    description: 'Generate crisp, high-resolution QR codes perfect for print and digital use',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    working: true
  },
  {
    id: 'custom-branding',
    title: 'Custom Branding',
    description: 'Add your logo, custom colors, and brand elements to QR codes',
    icon: Palette,
    gradient: 'from-blue-500 to-cyan-500',
    working: true
  },
  {
    id: 'multiple-formats',
    title: 'Multiple Formats',
    description: 'Export in PNG, JPG, SVG and various sizes for different use cases',
    icon: Download,
    gradient: 'from-green-500 to-emerald-500',
    working: true
  },
  {
    id: 'batch-processing',
    title: 'Batch Generation',
    description: 'Generate multiple QR codes at once for campaigns and bulk use',
    icon: Layers,
    gradient: 'from-indigo-500 to-purple-500',
    working: true
  },
  {
    id: 'picture-to-qr',
    title: 'Picture to QR',
    description: 'Convert your face or any image into a scannable QR code',
    icon: Image,
    gradient: 'from-orange-500 to-red-500',
    working: true
  },
  {
    id: 'qr-shapes',
    title: 'QR Shapes',
    description: 'Choose from 15 different QR code shapes and styles',
    icon: Settings,
    gradient: 'from-pink-500 to-rose-500',
    working: true
  }
];

export const EnhancedQRGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<EnhancedQRData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<EnhancedQRData[]>([]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('generator');
  const [showCustomization, setShowCustomization] = useState(false);
  const [qrContent, setQrContent] = useState<{content: string, type: string} | null>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Fixed: Remove problematic external logo that causes CORS issues
  const defaultOptions: QROptions = {
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: 512,
  };

  const [customization, setCustomization] = useState(defaultOptions);

  useEffect(() => {
    const savedHistory = localStorage.getItem('enhanced-qr-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

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

        // Draw the main QR code
        ctx.drawImage(img, 0, 0);

        // Add "Powered by anwe.sh Quantum QR" watermark
        const fontSize = Math.max(10, img.width * 0.02);
        ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.textAlign = 'right';
        ctx.fillText('Powered by anwe.sh Quantum QR', img.width - 10, img.height - 10);

        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageDataUrl;
    });
  };

  const handleQRContentSet = (content: string, type: string) => {
    console.log('QR Content Set:', { content, type });
    setQrContent({ content, type });
  };

  const generateEnhancedQR = async () => {
    if (!qrContent?.content?.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to generate QR code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating QR with content:', qrContent.content);
      console.log('Using customization:', customization);
      
      // Generate QR code without external logo to avoid CORS issues
      const qrCode = await generateQRCode(qrContent.content, customization);
      
      // Always add watermark with branding
      const finalQRCode = await addWatermark(qrCode);
      
      const newQRData: EnhancedQRData = {
        id: Date.now().toString(),
        type: qrContent.type,
        content: qrContent.content,
        customization: { ...customization },
        qrCode: finalQRCode,
        timestamp: Date.now(),
        analytics: {
          scans: 0,
          uniqueUsers: 0,
          locations: [],
          devices: []
        }
      };

      setQrData(newQRData);
      
      const newHistory = [newQRData, ...history.slice(0, 19)];
      setHistory(newHistory);
      localStorage.setItem('enhanced-qr-history', JSON.stringify(newHistory));

      toast({
        title: "✨ QR Code Generated!",
        description: "Your QR code is ready for download",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    const feature = workingFeatures.find(f => f.id === featureId);
    if (!feature?.working) {
      toast({
        title: "Feature Coming Soon",
        description: "This feature is currently being developed",
        variant: "destructive",
      });
      return;
    }

    if (featureId === 'custom-branding') {
      const isActivating = !activeFeatures.includes(featureId);
      
      setActiveFeatures(prev => 
        isActivating 
          ? [...prev, featureId]
          : prev.filter(id => id !== featureId)
      );

      toast({
        title: isActivating ? "Custom Branding Enabled" : "Custom Branding Disabled",
        description: isActivating 
          ? "You can now add your logo and website URL"
          : "Using default Quantum QR branding",
      });
      
      return;
    }

    setActiveFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );

    if (featureId === 'batch-processing') {
      setCurrentTab('batch');
    } else if (featureId === 'picture-to-qr') {
      window.open('/picture-qr', '_blank');
    } else if (featureId === 'multiple-formats') {
      toast({
        title: "Multiple Formats Enabled",
        description: "You can now download QR codes in PNG, JPG, SVG, WebP, and PDF formats from the preview section",
      });
    } else if (featureId === 'qr-shapes') {
      toast({
        title: "QR Shapes Enabled",
        description: "You can now choose from 15 different QR code shapes in the customization panel",
      });
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/90 to-purple-50/20 dark:to-purple-950/20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Enhanced Header with Better Typography */}
        <motion.div 
          className="mb-8 text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 flex items-center gap-2 sm:gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300">
                <Link to="/about" className="flex items-center gap-1 sm:gap-2">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline font-medium">About</span>
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300">
                <Link to="/picture-qr" className="flex items-center gap-1 sm:gap-2">
                  <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline font-medium">Picture QR</span>
                </Link>
              </Button>
            </motion.div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Dark</span>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="data-[state=checked]:bg-purple-600 scale-75 sm:scale-100"
              />
            </div>
          </div>
          
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.025em"
              }}
            >
              Quantum QR
            </motion.h1>
          </motion.div>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 font-medium tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Professional QR Code Generator with Advanced Customization
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid with Animations */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">Professional Features</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {workingFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.08,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button
                  variant={activeFeatures.includes(feature.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFeature(feature.id)}
                  className={`h-auto p-3 sm:p-4 w-full transition-all duration-300 hover:shadow-lg ${
                    activeFeatures.includes(feature.id) 
                      ? `bg-gradient-to-r ${feature.gradient} text-white border-0 shadow-lg` 
                      : 'hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                  } ${!feature.working ? 'opacity-50' : ''}`}
                  disabled={!feature.working}
                >
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                    <span className="text-xs sm:text-sm leading-tight text-center font-medium">
                      {feature.title.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Main Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
              <TabsTrigger value="generator" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Generator</span>
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Batch</span>
              </TabsTrigger>
              <TabsTrigger value="converter" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Barcode className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Barcode</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Scan className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Enhanced Input Section */}
              <motion.div 
                className="lg:col-span-1 space-y-4 sm:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    boxShadow: theme === 'dark' 
                      ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                      : "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </motion.div>
                        Content Input
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QRInput onGenerate={handleQRContentSet} isLoading={isGenerating} />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Collapsible Customization */}
                <AnimatePresence>
                  {qrContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Collapsible open={showCustomization} onOpenChange={setShowCustomization}>
                        <motion.div
                          whileHover={{
                            scale: 1.02,
                            y: -4,
                            boxShadow: theme === 'dark' 
                              ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                              : "0 20px 40px rgba(0, 0, 0, 0.1)",
                            transition: { duration: 0.3 }
                          }}
                        >
                          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl transition-all duration-300">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-300 rounded-t-lg">
                                <CardTitle className="flex items-center justify-between text-base sm:text-lg font-bold">
                                  <div className="flex items-center gap-2">
                                    <motion.div
                                      animate={{ rotate: showCustomization ? 180 : 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    </motion.div>
                                    Customize Your QR
                                  </div>
                                  <motion.div
                                    animate={{ rotate: showCustomization ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </motion.div>
                                </CardTitle>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              >
                                <CardContent>
                                  <AdvancedCustomization
                                    options={customization}
                                    onChange={setCustomization}
                                    onRegenerate={() => qrData && generateEnhancedQR()}
                                    hasQRCode={!!qrData}
                                    activeFeatures={activeFeatures}
                                  />
                                </CardContent>
                              </motion.div>
                            </CollapsibleContent>
                          </Card>
                        </motion.div>
                      </Collapsible>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Generate Button */}
                <AnimatePresence>
                  {qrContent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={generateEnhancedQR} 
                        className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white font-bold py-4 text-base sm:text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 border-0" 
                        disabled={isGenerating}
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2"
                            >
                              <QrCode className="w-5 h-5" />
                            </motion.div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-5 h-5 mr-2" />
                            Generate QR Code
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Preview Section */}
              <motion.div 
                className="lg:col-span-2 space-y-4 sm:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    boxShadow: theme === 'dark' 
                      ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                      : "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl h-fit transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        Preview & Download
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QRPreview qrData={qrData} isGenerating={isGenerating} />
                    </CardContent>
                  </Card>
                </motion.div>

                <AnimatePresence>
                  {qrData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{
                        scale: 1.02,
                        y: -4,
                        boxShadow: theme === 'dark' 
                          ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                          : "0 20px 40px rgba(0, 0, 0, 0.1)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            Beautiful Card Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CustomizableCard qrData={qrData} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Analytics & History Section */}
              <motion.div 
                className="lg:col-span-1 space-y-4 sm:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    boxShadow: theme === 'dark' 
                      ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                      : "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                        <Scan className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QRAnalytics qrData={qrData} />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    boxShadow: theme === 'dark' 
                      ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                      : "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                        History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SmartQRHistory 
                        history={history} 
                        onLoad={(data) => {
                          setQrData(data);
                          setCustomization(data.customization);
                          setQrContent({ content: data.content, type: data.type });
                        }} 
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <BatchGenerator onBatchGenerate={(qrCodes) => {
              setHistory(prev => [...qrCodes, ...prev.slice(0, 20 - qrCodes.length)]);
              localStorage.setItem('enhanced-qr-history', JSON.stringify([...qrCodes, ...history.slice(0, 20 - qrCodes.length)]));
            }} />
          </TabsContent>

          <TabsContent value="converter">
            <BarcodeConverter />
          </TabsContent>

          <TabsContent value="gallery">
            <motion.div
              whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: theme === 'dark' 
                  ? "0 20px 40px rgba(139, 92, 246, 0.3)" 
                  : "0 20px 40px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.3 }
              }}
            >
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl p-4 sm:p-8 transition-all duration-300">
                <CardContent className="text-center space-y-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Scan className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-purple-500" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold">QR Gallery</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    View and manage all your created QR codes in one place.
                  </p>
                  <SmartQRHistory 
                    history={history} 
                    onLoad={(data) => {
                      setQrData(data);
                      setCustomization(data.customization);
                      setQrContent({ content: data.content, type: data.type });
                      setCurrentTab('generator');
                    }} 
                    expanded={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        <DonationCard />

        {/* Enhanced Footer */}
        <motion.footer 
          className="mt-16 py-8 border-t border-purple-200/50 dark:border-purple-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center space-y-4">
            <motion.div 
              className="flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Quantum QR</span>
            </motion.div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Powered by <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 dark:hover:text-purple-400 font-medium transition-colors duration-300 hover:underline">anwe.sh</a>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Quantum QR. Professional QR Generation Platform.
            </p>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
};
