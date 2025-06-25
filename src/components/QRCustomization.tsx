
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Palette, Settings, RefreshCw } from 'lucide-react';
import { QROptions } from '@/utils/qrGenerator';
import { readFileAsDataURL } from '@/utils/fileHandler';

interface ExtendedQROptions extends QROptions {
  logo?: string;
  gradientColors?: string[];
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  cornerStyle?: 'square' | 'rounded' | 'circle';
  patternStyle?: 'square' | 'circle' | 'rounded';
  backgroundColor?: string;
  foregroundColor?: string;
}

interface QRCustomizationProps {
  options: ExtendedQROptions;
  onChange: (options: ExtendedQROptions) => void;
  onRegenerate: () => void;
  hasQRCode: boolean;
}

export const QRCustomization: React.FC<QRCustomizationProps> = ({
  options,
  onChange,
  onRegenerate,
  hasQRCode
}) => {
  const [logoFile, setLogoFile] = useState<string>('');

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataURL(file);
      setLogoFile(dataUrl);
      onChange({ ...options, logo: dataUrl });
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const updateOption = (key: keyof ExtendedQROptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const gradientPresets = [
    { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
    { name: 'Sunset', colors: ['#f093fb', '#f5576c'] },
    { name: 'Forest', colors: ['#4ecdc4', '#44a08d'] },
    { name: 'Fire', colors: ['#ff6b6b', '#ffa726'] },
    { name: 'Purple', colors: ['#a855f7', '#3b82f6'] },
    { name: 'Gold', colors: ['#fbbf24', '#f59e0b'] },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label>Error Correction Level</Label>
            <Select 
              value={options.errorCorrectionLevel} 
              onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => updateOption('errorCorrectionLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Size: {options.width}px</Label>
            <Slider
              value={[options.width]}
              onValueChange={([value]) => updateOption('width', value)}
              min={256}
              max={2048}
              step={64}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Margin: {options.margin}</Label>
            <Slider
              value={[options.margin]}
              onValueChange={([value]) => updateOption('margin', value)}
              min={0}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="darkColor">Foreground Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="darkColor"
                  type="color"
                  value={options.color.dark}
                  onChange={(e) => updateOption('color', { ...options.color, dark: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={options.color.dark}
                  onChange={(e) => updateOption('color', { ...options.color, dark: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lightColor">Background Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="lightColor"
                  type="color"
                  value={options.color.light}
                  onChange={(e) => updateOption('color', { ...options.color, light: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={options.color.light}
                  onChange={(e) => updateOption('color', { ...options.color, light: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div>
            <Label>Upload Logo</Label>
            <Card className="border-dashed border-2 p-3">
              <div className="text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose Logo</span>
                  </Button>
                </Label>
                {logoFile && (
                  <div className="mt-2">
                    <img src={logoFile} alt="Logo preview" className="w-12 h-12 mx-auto rounded" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Label>Gradient Presets</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {gradientPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => updateOption('gradientColors', preset.colors)}
                  className="p-2 h-auto"
                  style={{
                    background: `linear-gradient(45deg, ${preset.colors.join(', ')})`,
                    color: 'white'
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {options.gradientColors && (
            <div>
              <Label>Gradient Direction</Label>
              <Select 
                value={options.gradientDirection || 'diagonal'} 
                onValueChange={(value: 'horizontal' | 'vertical' | 'diagonal') => updateOption('gradientDirection', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="diagonal">Diagonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Corner Style</Label>
            <Select 
              value={options.cornerStyle || 'square'} 
              onValueChange={(value: 'square' | 'rounded' | 'circle') => updateOption('cornerStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Pattern Style</Label>
            <Select 
              value={options.patternStyle || 'square'} 
              onValueChange={(value: 'square' | 'circle' | 'rounded') => updateOption('patternStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                updateOption('color', { dark: '#000000', light: '#FFFFFF' });
                updateOption('gradientColors', undefined);
                updateOption('logo', undefined);
                setLogoFile('');
              }}
            >
              Reset to Default
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                const colors = Array.from({ length: 3 }, () => 
                  '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
                );
                updateOption('gradientColors', colors);
              }}
            >
              <Palette className="w-4 h-4 mr-2" />
              Random Gradient
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                const darkColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                updateOption('color', { ...options.color, dark: darkColor });
              }}
            >
              Random Color
            </Button>
          </div>

          <div className="pt-2 border-t">
            <Label className="text-sm text-muted-foreground">
              Pro Tips:
            </Label>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Use high error correction for logos</li>
              <li>• Keep logos under 30% of QR size</li>
              <li>• Test QR codes before printing</li>
              <li>• Higher contrast improves scanning</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {hasQRCode && (
        <Button 
          onClick={onRegenerate} 
          variant="outline" 
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Apply Changes
        </Button>
      )}
    </div>
  );
};
