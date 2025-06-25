
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Heart, Coffee, Gift, Zap, ChevronUp, ChevronDown, X } from 'lucide-react';
import { generateQRCode, generateUPI } from '@/utils/qrGenerator';

export const DonationCard: React.FC = () => {
  const [donationQR, setDonationQR] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const amounts = [50, 100, 250, 500];

  useEffect(() => {
    generateDonationQR();
  }, [selectedAmount]);

  const generateDonationQR = async () => {
    const upiData = generateUPI({
      payeeId: 'anweshrath-4@oksbi',
      payeeName: 'Anwesh Rath',
      amount: selectedAmount || undefined,
      currency: 'INR',
      note: 'Support anwe.sh QR Studio - Thank you! ❤️'
    });

    try {
      const qrCode = await generateQRCode(upiData, {
        errorCorrectionLevel: 'M',
        margin: 4,
        color: { dark: '#e11d48', light: '#ffffff' },
        width: 256,
      });
      setDonationQR(qrCode);
    } catch (error) {
      console.error('Error generating donation QR:', error);
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-500 to-red-500 shadow-2xl border-2 border-white/20"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 w-72 sm:w-80"
    >
      <Card className="backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-200/20 shadow-2xl">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                    </motion.div>
                    Support Our Work
                    <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs">
                      Free Forever
                    </Badge>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </CardTitle>
                </Button>
              </CollapsibleTrigger>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 hover:bg-red-500/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            <CollapsibleContent>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Help keep this service free for everyone! Any amount is appreciated.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {amounts.map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => setSelectedAmount(selectedAmount === amount ? null : amount)}
                        className={`text-xs ${
                          selectedAmount === amount 
                            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' 
                            : 'hover:bg-pink-50 hover:border-pink-300'
                        }`}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAmount(null)}
                    className="w-full text-xs hover:bg-green-50 hover:border-green-300"
                  >
                    <Gift className="w-3 h-3 mr-1" />
                    Any Amount
                  </Button>

                  {donationQR && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <div className="p-2 bg-white rounded-lg inline-block shadow-sm">
                        <img src={donationQR} alt="Donation QR" className="w-20 h-20 sm:w-24 sm:h-24" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scan to donate {selectedAmount ? `₹${selectedAmount}` : 'any amount'}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground bg-background/50 rounded-lg p-2">
                    <Coffee className="w-3 h-3" />
                    <span className="font-mono">anweshrath-4@oksbi</span>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Made with ❤️ by <span className="font-semibold text-pink-600">Anwesh Rath</span>
                    </p>
                  </div>
                </CardContent>
              </motion.div>
            </CollapsibleContent>
          </AnimatePresence>
        </Collapsible>
      </Card>
    </motion.div>
  );
};
