
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Upload, 
  Zap, 
  RotateCcw, 
  Settings,
  Shapes,
  Heart,
  Star,
  Diamond,
  Hexagon,
  Triangle,
  Square,
  Circle
} from 'lucide-react';
import { QROptions } from '@/utils/qrGenerator';
import { useToast } from '@/hooks/use-toast';

interface AdvancedCustomizationProps {
  options: QROptions & {
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
  onChange: (options: any) => void;
  onRegenerate?: () => void;
  hasQRCode: boolean;
  activeFeatures: string[];
}

const qrShapes = [
  { id: 'square', name: 'Square', icon: Square, description: 'Classic square shape' },
  { id: 'circle', name: 'Circle', icon: Circle, description: 'Rounded circular design' },
  { id: 'rounded-square', name: 'Rounded Square', icon: Square, description: 'Square with rounded corners' },
  { id: 'heart', name: 'Heart', icon: Heart, description: 'Romantic heart shape' },
  { id: 'star', name: 'Star', icon: Star, description: 'Five-pointed star' },
  { id: 'diamond', name: 'Diamond', icon: Diamond, description: 'Diamond/rhombus shape' },
  { id: 'hexagon', name: 'Hexagon', icon: Hexagon, description: 'Six-sided polygon' },
  { id: 'octagon', name: 'Octagon', icon: Settings, description: 'Eight-sided polygon' },
  { id: 'triangle', name: 'Triangle', icon: Triangle, description: 'Triangular design' },
  { id: 'cross', name: 'Cross', icon: Settings, description: 'Plus/cross shape' },
  { id: 'arrow', name: 'Arrow', icon: Settings, description: 'Arrow pointing right' },
  { id: 'shield', name: 'Shield', icon: Settings, description: 'Protective shield shape' },
  { id: 'leaf', name: 'Leaf', icon: Settings, description: 'Natural leaf design' },
  { id: 'flower', name: 'Flower', icon: Settings, description: 'Floral pattern' },
  { id: 'spiral', name: 'Spiral', icon: Settings, description: 'Spiral/swirl design' }
];

export const AdvancedCustomization: React.FC<AdvancedCustomizationProps> = ({
  options,
  onChange,
  onRegenerate,
  hasQRCode,
  activeFeatures
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a logo smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setLogoFile(file);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string;
        onChange({ ...options, logo: logoDataUrl });
        setIsUploading(false);
        
        toast({
          title: "Logo Uploaded",
          description: "Logo has been added to your QR code customization",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  const updateOption = (key: string, value: any) => {
    const newOptions = { ...options, [key]: value };
    onChange(newOptions);
  };

  const updateColorOption = (path: string, value: string) => {
    if (path === 'dark') {
      const newOptions = { ...options, color: { ...options.color, dark: value } };
      onChange(newOptions);
    } else if (path === 'light') {
      const newOptions = { ...options, color: { ...options.color, light: value } };
      onChange(newOptions);
    }
  };

  const resetToDefaults = () => {
    const defaultOptions = {
      errorCorrectionLevel: 'M' as const,
      margin: 4,
      color: { dark: '#000000', light: '#FFFFFF' },
      width: 512,
    };
    onChange(defaultOptions);
    setLogoFile(null);
    
    toast({
      title: "Reset Complete",
      description: "All customization options have been reset to defaults",
    });
  };

  const canRegenerate = hasQRCode && (
    options.logo || 
    options.color?.dark !== '#000000' || 
    options.color?.light !== '#FFFFFF' ||
    options.width !== 512 ||
    options.margin !== 4 ||
    options.errorCorrectionLevel !== 'M' ||
    options.shape !== 'square'
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="shapes">Shapes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* Colors */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Colors</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Foreground</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={options.color?.dark || '#000000'}
                    onChange={(e) => updateColorOption('dark', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={options.color?.dark || '#000000'}
                    onChange={(e) => updateColorOption('dark', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={options.color?.light || '#FFFFFF'}
                    onChange={(e) => updateColorOption('light', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={options.color?.light || '#FFFFFF'}
                    onChange={(e) => updateColorOption('light', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Size: {options.width}px</Label>
            <Slider
              value={[options.width]}
              onValueChange={(value) => updateOption('width', value[0])}
              min={128}
              max={1024}
              step={32}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>128px</span>
              <span>1024px</span>
            </div>
          </div>

          {/* Margin */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Margin: {options.margin}</Label>
            <Slider
              value={[options.margin]}
              onValueChange={(value) => updateOption('margin', value[0])}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Error Correction */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Error Correction</Label>
            <Select
              value={options.errorCorrectionLevel}
              onValueChange={(value) => updateOption('errorCorrectionLevel', value)}
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
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Logo</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                {options.logo ? (
                  <div className="space-y-2 text-center">
                    <img
                      src={options.logo}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain mx-auto rounded border"
                    />
                    <Badge className="bg-green-500 text-white">
                      ✓ Logo Added
                    </Badge>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? 'Uploading...' : 'Click to upload logo'}
                    </span>
                  </>
                )}
              </label>
            </div>
            {options.logo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateOption('logo', undefined)}
                className="w-full"
              >
                Remove Logo
              </Button>
            )}
          </div>

          {/* Pattern Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pattern Style</Label>
            <Select
              value={options.patternStyle || 'square'}
              onValueChange={(value) => updateOption('patternStyle', value)}
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

          {/* Corner Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Corner Style</Label>
            <Select
              value={options.cornerStyle || 'square'}
              onValueChange={(value) => updateOption('cornerStyle', value)}
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
        </TabsContent>

        <TabsContent value="shapes" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shapes className="w-4 h-4 text-pink-500" />
              <Label className="text-sm font-medium">QR Code Shape</Label>
              <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs">
                15 Shapes
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {qrShapes.map((shape) => (
                <motion.div
                  key={shape.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={options.shape === shape.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOption('shape', shape.id)}
                    className={`w-full h-auto p-3 flex flex-col items-center gap-1 ${
                      options.shape === shape.id 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0' 
                        : ''
                    }`}
                    title={shape.description}
                  >
                    <shape.icon className="w-4 h-4" />
                    <span className="text-xs text-center leading-tight">
                      {shape.name}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Choose from 15 unique QR code shapes to match your brand
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="flex items-center gap-2 flex-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        
        {canRegenerate && onRegenerate && (
          <Button
            onClick={onRegenerate}
            size="sm"
            className="flex items-center gap-2 flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Zap className="w-4 h-4" />
            Apply Changes
          </Button>
        )}
      </div>

      {/* Feature Status */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center justify-between">
          <span>Custom Branding:</span>
          <Badge variant={options.logo ? "default" : "outline"} className="text-xs">
            {options.logo ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>High Quality:</span>
          <Badge variant={options.width >= 512 ? "default" : "outline"} className="text-xs">
            {options.width >= 512 ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Custom Shape:</span>
          <Badge variant={options.shape && options.shape !== 'square' ? "default" : "outline"} className="text-xs">
            {options.shape && options.shape !== 'square' ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
