
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Layers, Download, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { QROptions, generateQRCode } from '@/utils/qrGenerator';
import { EnhancedQRData } from './EnhancedQRGenerator';
import { useToast } from '@/hooks/use-toast';

interface BatchGeneratorProps {
  onBatchGenerate: (qrCodes: EnhancedQRData[]) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({ onBatchGenerate }) => {
  const [batchInput, setBatchInput] = useState('');
  const [batchType, setBatchType] = useState('url');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCodes, setGeneratedCodes] = useState<EnhancedQRData[]>([]);
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

  const handleBatchGenerate = async () => {
    const lines = batchInput.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      toast({
        title: "Error",
        description: "Please enter content for batch generation",
        variant: "destructive",
      });
      return;
    }

    if (lines.length > 50) {
      toast({
        title: "Limit Exceeded",
        description: "Maximum 50 QR codes can be generated at once",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    const newQRCodes: EnhancedQRData[] = [];

    try {
      for (let i = 0; i < lines.length; i++) {
        const content = lines[i].trim();
        
        try {
          const qrCode = await generateQRCode(content, defaultOptions);
          
          const qrData: EnhancedQRData = {
            id: `batch-${Date.now()}-${i}`,
            type: batchType,
            content,
            customization: { ...defaultOptions },
            qrCode,
            timestamp: Date.now(),
            analytics: {
              scans: 0,
              uniqueUsers: 0,
              locations: [],
              devices: []
            }
          };

          newQRCodes.push(qrData);
        } catch (error) {
          console.error(`Failed to generate QR for: ${content}`, error);
        }

        setProgress(((i + 1) / lines.length) * 100);
      }

      setGeneratedCodes(newQRCodes);
      onBatchGenerate(newQRCodes);

      toast({
        title: "✨ Batch Generation Complete!",
        description: `Successfully generated ${newQRCodes.length} QR codes`,
      });
    } catch (error) {
      console.error('Batch generation error:', error);
      toast({
        title: "Error",
        description: "Failed to complete batch generation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAll = () => {
    generatedCodes.forEach((qrData, index) => {
      const link = document.createElement('a');
      link.href = qrData.qrCode;
      link.download = `batch-qr-${index + 1}-${qrData.type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast({
      title: "Download Started",
      description: `Downloading ${generatedCodes.length} QR codes`,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Batch QR Generator
        </h2>
        <p className="text-muted-foreground">
          Generate multiple QR codes at once - perfect for campaigns and bulk operations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Batch Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>QR Code Type</Label>
              <Select value={batchType} onValueChange={setBatchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Website URLs</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="email">Email Addresses</SelectItem>
                  <SelectItem value="phone">Phone Numbers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content (One per line, max 50)</Label>
              <Textarea
                placeholder={`Enter your ${batchType}s here, one per line:
${batchType === 'url' ? 'https://example1.com\nhttps://example2.com\nhttps://example3.com' : 
  batchType === 'email' ? 'user1@example.com\nuser2@example.com\nuser3@example.com' :
  batchType === 'phone' ? '+1234567890\n+0987654321\n+1122334455' :
  'Text content 1\nText content 2\nText content 3'}`}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{batchInput.trim().split('\n').filter(line => line.trim()).length} items</span>
                <span>Max: 50 items</span>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generating QR codes...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button
              onClick={handleBatchGenerate}
              disabled={isGenerating || !batchInput.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 mr-2" />
                  Generate Batch QR Codes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Generated QR Codes
            </CardTitle>
            {generatedCodes.length > 0 && (
              <Button onClick={downloadAll} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {generatedCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Generated QR codes will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-green-500 text-white">
                    {generatedCodes.length} Generated
                  </Badge>
                  <Badge variant="outline">
                    {batchType.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                  {generatedCodes.map((qrData, index) => (
                    <motion.div
                      key={qrData.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="bg-white p-2 rounded-lg border shadow-sm">
                        <img
                          src={qrData.qrCode}
                          alt={`QR Code ${index + 1}`}
                          className="w-full h-24 object-contain"
                        />
                        <p className="text-xs text-center mt-1 truncate">
                          {qrData.content.length > 20 
                            ? `${qrData.content.substring(0, 20)}...` 
                            : qrData.content
                          }
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = qrData.qrCode;
                          link.download = `qr-${index + 1}.png`;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            How Batch Generation Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">📝 Input Format</h4>
              <ul className="space-y-1">
                <li>• Enter one item per line</li>
                <li>• Maximum 50 items per batch</li>
                <li>• Choose the appropriate type</li>
                <li>• Remove empty lines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">⚡ Features</h4>
              <ul className="space-y-1">
                <li>• Real-time progress tracking</li>
                <li>• Individual QR downloads</li>
                <li>• Bulk download option</li>
                <li>• Error handling for failed items</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
