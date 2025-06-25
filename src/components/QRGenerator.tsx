import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode } from 'lucide-react';
import { QROptions, generateQRCode } from '@/utils/qrGenerator';
import { QRInput } from './QRInput';
import { QRCustomization } from './QRCustomization';
import { QRPreview } from './QRPreview';
import { QRHistory } from './QRHistory';
import { useToast } from '@/hooks/use-toast';

export interface QRData {
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
  };
  qrCode: string;
  timestamp: number;
}

export const QRGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QRData[]>([]);
  const { toast } = useToast();

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
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  const generateQR = async (content: string, type: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to generate QR code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const qrCode = await generateQRCode(content, customization);
      
      const newQRData: QRData = {
        id: Date.now().toString(),
        type,
        content,
        customization: { ...customization },
        qrCode,
        timestamp: Date.now(),
      };

      setQrData(newQRData);
      
      // Add to history
      const newHistory = [newQRData, ...history.slice(0, 9)]; // Keep last 10
      setHistory(newHistory);
      localStorage.setItem('qr-history', JSON.stringify(newHistory));

      toast({
        title: "Success",
        description: "QR code generated successfully!",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadFromHistory = (historicalData: QRData) => {
    setQrData(historicalData);
    setCustomization(historicalData.customization);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          QR Studio Pro
        </h1>
        <p className="text-lg text-muted-foreground">
          Professional QR Code Generator with Advanced Customization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Content Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRInput onGenerate={generateQR} isLoading={isGenerating} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <QRCustomization
                options={customization}
                onChange={setCustomization}
                onRegenerate={() => qrData && generateQR(qrData.content, qrData.type)}
                hasQRCode={!!qrData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Preview & Download</CardTitle>
            </CardHeader>
            <CardContent>
              <QRPreview qrData={qrData} isGenerating={isGenerating} />
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Recent QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <QRHistory history={history} onLoad={loadFromHistory} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
