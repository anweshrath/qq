
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Trash2 } from 'lucide-react';
import { QRData } from './QRGenerator';

interface QRHistoryProps {
  history: QRData[];
  onLoad: (qrData: QRData) => void;
}

export const QRHistory: React.FC<QRHistoryProps> = ({ history, onLoad }) => {
  const clearHistory = () => {
    localStorage.removeItem('qr-history');
    window.location.reload();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      url: 'bg-blue-100 text-blue-800',
      text: 'bg-green-100 text-green-800',
      file: 'bg-purple-100 text-purple-800',
      contact: 'bg-orange-100 text-orange-800',
      wifi: 'bg-indigo-100 text-indigo-800',
      upi: 'bg-yellow-100 text-yellow-800',
      sms: 'bg-pink-100 text-pink-800',
      email: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No QR codes generated yet</p>
          <p className="text-xs">Your recent QR codes will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <History className="w-4 h-4" />
          History ({history.length})
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearHistory}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <img 
                  src={item.qrCode} 
                  alt="QR Code"
                  className="w-12 h-12 rounded border"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {item.content.length > 40 
                      ? `${item.content.substring(0, 40)}...` 
                      : item.content
                    }
                  </p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onLoad(item)}
                      className="h-6 px-2 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Load
                    </Button>
                    
                    <span className="text-xs text-muted-foreground">
                      {item.customization.width}px
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
