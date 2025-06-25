
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, CreditCard, Wifi, User, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { EnhancedQRData } from './EnhancedQRGenerator';

interface CustomizableCardProps {
  qrData: EnhancedQRData;
  cardStyle?: 'minimal' | 'glassmorphism' | 'gradient' | 'neon';
  showBranding?: boolean;
}

export const CustomizableCard: React.FC<CustomizableCardProps> = ({ 
  qrData, 
  cardStyle = 'glassmorphism',
  showBranding = true 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return Globe;
      case 'upi': return CreditCard;
      case 'wifi': return Wifi;
      case 'contact': return User;
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      default: return Globe;
    }
  };

  const getCardStyles = () => {
    switch (cardStyle) {
      case 'minimal':
        return 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700';
      case 'glassmorphism':
        return 'backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10';
      case 'gradient':
        return 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-0';
      case 'neon':
        return 'bg-black border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]';
      default:
        return 'backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10';
    }
  };

  const parseUPIData = (content: string) => {
    if (!content.startsWith('upi://pay')) return null;
    
    const url = new URL(content);
    return {
      payeeId: url.searchParams.get('pa') || '',
      payeeName: decodeURIComponent(url.searchParams.get('pn') || ''),
      amount: url.searchParams.get('am') || '',
      note: decodeURIComponent(url.searchParams.get('tn') || ''),
      currency: url.searchParams.get('cu') || 'INR'
    };
  };

  const parseURLData = (content: string) => {
    try {
      const url = new URL(content);
      return {
        domain: url.hostname,
        title: url.hostname.replace('www.', '').toUpperCase(),
        path: url.pathname
      };
    } catch {
      return null;
    }
  };

  const TypeIcon = getTypeIcon(qrData.type);
  const upiData = qrData.type === 'upi' ? parseUPIData(qrData.content) : null;
  const urlData = qrData.type === 'url' ? parseURLData(qrData.content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className={`${getCardStyles()} p-6 space-y-4`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {qrData.type === 'upi' ? 'Payment Request' : 
                 qrData.type === 'url' ? 'Website' :
                 qrData.type.charAt(0).toUpperCase() + qrData.type.slice(1)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(qrData.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            Premium
          </Badge>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <img 
              src={qrData.qrCode} 
              alt="QR Code"
              className="w-48 h-48 rounded-lg"
            />
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-3">
          {upiData && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pay To:</span>
                <span className="font-medium">{upiData.payeeName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">UPI ID:</span>
                <span className="font-mono text-sm">{upiData.payeeId}</span>
              </div>
              {upiData.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-bold text-lg text-green-600">
                    ₹{upiData.amount}
                  </span>
                </div>
              )}
              {upiData.note && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Note:</span>
                  <span className="text-sm">{upiData.note}</span>
                </div>
              )}
            </div>
          )}

          {urlData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{urlData.title}</span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {qrData.content}
              </div>
            </div>
          )}

          {qrData.type === 'text' && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{qrData.content}</p>
            </div>
          )}
        </div>

        {/* Branding */}
        {showBranding && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Generated by</span>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                anwe.sh
              </span>
              <span>QR Studio</span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
