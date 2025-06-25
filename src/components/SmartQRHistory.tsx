
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Download, 
  Trash2, 
  Eye, 
  Star,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EnhancedQRData } from './EnhancedQRGenerator';
import { CustomizableCard } from './CustomizableCard';

interface SmartQRHistoryProps {
  history: EnhancedQRData[];
  onLoad: (data: EnhancedQRData) => void;
  expanded?: boolean;
}

export const SmartQRHistory: React.FC<SmartQRHistoryProps> = ({ 
  history, 
  onLoad,
  expanded = false 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const uniqueTypes = Array.from(new Set(history.map(item => item.type)));

  if (!expanded && history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No QR codes yet</p>
        <p className="text-sm">Generated codes will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expanded && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search QR codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            >
              {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className={expanded ? "h-[600px]" : "h-[300px]"}>
        <AnimatePresence>
          {viewMode === 'grid' && expanded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => onLoad(item)}
                >
                  <CustomizableCard qrData={item} showBranding={false} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
                       onClick={() => onLoad(item)}>
                    <div className="flex-shrink-0">
                      <img 
                        src={item.qrCode} 
                        alt="QR Code"
                        className="w-12 h-12 rounded border"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.type.toUpperCase()}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {item.content.length > 40 
                          ? `${item.content.substring(0, 40)}...`
                          : item.content
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()} • 
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoad(item);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.download = `qrcode-${item.id}.png`;
                          link.href = item.qrCode;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {filteredHistory.length === 0 && (searchTerm || filterType !== 'all') && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No matches found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
