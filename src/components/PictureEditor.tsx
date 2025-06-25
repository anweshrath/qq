
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Crop,
  Palette,
  Sun,
  Contrast,
  Scissors,
  Download,
  RotateCcw,
  Move
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PictureEditorProps {
  imageSrc: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

export const PictureEditor: React.FC<PictureEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = containerRef.current?.clientWidth || 400;
    const containerHeight = 300;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `
      brightness(${brightness[0]}%) 
      contrast(${contrast[0]}%) 
      saturate(${saturation[0]}%)
    `;

    // Calculate image dimensions with zoom
    const scale = zoom[0] / 100;
    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;

    // Center the image and apply position offset
    const x = (canvas.width - imageWidth) / 2 + position.x;
    const y = (canvas.height - imageHeight) / 2 + position.y;

    // Save context for rotation
    ctx.save();
    
    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation[0] * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the image
    ctx.drawImage(image, x, y, imageWidth, imageHeight);

    // Restore context
    ctx.restore();

    // Draw crop overlay if in crop mode
    if (cropMode) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cropX = (cropArea.x / 100) * canvas.width;
      const cropY = (cropArea.y / 100) * canvas.height;
      const cropW = (cropArea.width / 100) * canvas.width;
      const cropH = (cropArea.height / 100) * canvas.height;
      
      ctx.clearRect(cropX, cropY, cropW, cropH);
      
      // Draw crop border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);
    }
  }, [zoom, rotation, brightness, contrast, saturation, position, cropMode, cropArea]);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.onload = applyFilters;
    }
  }, [applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cropMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || cropMode) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetTransforms = () => {
    setZoom([100]);
    setRotation([0]);
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setPosition({ x: 0, y: 0 });
    setCropMode(false);
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !cropMode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropX = (cropArea.x / 100) * canvas.width;
    const cropY = (cropArea.y / 100) * canvas.height;
    const cropW = (cropArea.width / 100) * canvas.width;
    const cropH = (cropArea.height / 100) * canvas.height;

    const imageData = ctx.getImageData(cropX, cropY, cropW, cropH);
    
    canvas.width = cropW;
    canvas.height = cropH;
    ctx.putImageData(imageData, 0, 0);
    
    setCropMode(false);
    setPosition({ x: 0, y: 0 });
    
    toast({
      title: "Image Cropped",
      description: "Crop applied successfully",
    });
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If in crop mode, apply crop first
    if (cropMode) {
      applyCrop();
    }

    const editedImageData = canvas.toDataURL('image/png');
    onSave(editedImageData);
    
    toast({
      title: "Image Saved",
      description: "Your edited image is ready for QR generation",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Picture Editor</h2>
          <p className="text-muted-foreground">Edit your image before creating QR code</p>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Canvas Area */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
            <div 
              ref={containerRef}
              className="relative w-full h-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain ${!cropMode ? 'cursor-move' : 'cursor-crosshair'}`}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Edit"
                className="hidden"
                crossOrigin="anonymous"
              />
              
              {cropMode && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded">
                  Crop Mode: Drag to adjust crop area
                </div>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-80 p-6 space-y-6 overflow-y-auto">
            {/* Transform Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Transform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zoom: {zoom[0]}%</Label>
                  <Slider
                    value={zoom}
                    onValueChange={setZoom}
                    min={10}
                    max={300}
                    step={5}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setZoom([Math.max(10, zoom[0] - 10)])}
                    >
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setZoom([Math.min(300, zoom[0] + 10)])}
                    >
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rotation: {rotation[0]}°</Label>
                  <Slider
                    value={rotation}
                    onValueChange={setRotation}
                    min={-180}
                    max={180}
                    step={5}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRotation([rotation[0] - 15])}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRotation([rotation[0] + 15])}
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Brightness: {brightness[0]}%</Label>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contrast: {contrast[0]}%</Label>
                  <Slider
                    value={contrast}
                    onValueChange={setContrast}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Saturation: {saturation[0]}%</Label>
                  <Slider
                    value={saturation}
                    onValueChange={setSaturation}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Crop Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crop className="w-4 h-4" />
                  Crop
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant={cropMode ? "default" : "outline"}
                  onClick={() => setCropMode(!cropMode)}
                  className="w-full"
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  {cropMode ? 'Exit Crop Mode' : 'Enable Crop Mode'}
                </Button>

                {cropMode && (
                  <>
                    <div className="space-y-2">
                      <Label>Crop X: {cropArea.x}%</Label>
                      <Slider
                        value={[cropArea.x]}
                        onValueChange={([x]) => setCropArea(prev => ({ ...prev, x }))}
                        min={0}
                        max={100 - cropArea.width}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Crop Y: {cropArea.y}%</Label>
                      <Slider
                        value={[cropArea.y]}
                        onValueChange={([y]) => setCropArea(prev => ({ ...prev, y }))}
                        min={0}
                        max={100 - cropArea.height}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width: {cropArea.width}%</Label>
                      <Slider
                        value={[cropArea.width]}
                        onValueChange={([width]) => setCropArea(prev => ({ ...prev, width }))}
                        min={10}
                        max={100 - cropArea.x}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height: {cropArea.height}%</Label>
                      <Slider
                        value={[cropArea.height]}
                        onValueChange={([height]) => setCropArea(prev => ({ ...prev, height }))}
                        min={10}
                        max={100 - cropArea.y}
                        step={1}
                      />
                    </div>
                    <Button onClick={applyCrop} className="w-full">
                      Apply Crop
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={resetTransforms} variant="outline" className="w-full">
                Reset All
              </Button>
              <Button onClick={saveImage} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Save & Continue
              </Button>
              <Button onClick={onCancel} variant="destructive" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
