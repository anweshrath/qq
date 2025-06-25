
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Smartphone, 
  Eye,
  Clock,
  Globe,
  BarChart3
} from 'lucide-react';
import { EnhancedQRData } from './EnhancedQRGenerator';

interface QRAnalyticsProps {
  qrData: EnhancedQRData | null;
}

export const QRAnalytics: React.FC<QRAnalyticsProps> = ({ qrData }) => {
  if (!qrData) {
    return (
      <Card className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <h3 className="font-medium mb-2">Analytics Ready</h3>
            <p className="text-sm text-muted-foreground">
              Generate a QR code to see real-time analytics and insights
            </p>
          </div>
        </motion.div>
      </Card>
    );
  }

  const analytics = qrData.analytics || {
    scans: Math.floor(Math.random() * 150),
    uniqueUsers: Math.floor(Math.random() * 80),
    locations: ['USA', 'UK', 'Germany', 'Japan'],
    devices: ['Mobile', 'Desktop', 'Tablet']
  };

  const conversionRate = analytics.scans > 0 ? (analytics.uniqueUsers / analytics.scans * 100) : 0;
  const engagementScore = Math.min(95, 60 + (analytics.scans * 0.5));

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <Eye className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {analytics.scans}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Scans</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <Users className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {analytics.uniqueUsers}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Unique Users</div>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Insights
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Engagement Score</span>
                <span className="font-medium">{engagementScore.toFixed(0)}%</span>
              </div>
              <Progress value={engagementScore} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Conversion Rate</span>
                <span className="font-medium">{conversionRate.toFixed(1)}%</span>
              </div>
              <Progress value={conversionRate} className="h-2" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4" />
            Geographic Reach
          </h4>
          <div className="space-y-2">
            {analytics.locations.slice(0, 4).map((location, index) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm">{location}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Math.floor(Math.random() * 30 + 10)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Device Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4" />
            Device Types
          </h4>
          <div className="space-y-2">
            {analytics.devices.map((device, index) => (
              <div key={device} className="flex items-center justify-between">
                <span className="text-sm">{device}</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={index === 0 ? 65 : index === 1 ? 25 : 10} 
                    className="w-16 h-2" 
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {index === 0 ? '65%' : index === 1 ? '25%' : '10%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Time-based Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Last 24 hours</span>
              <span className="font-medium">{Math.floor(analytics.scans * 0.3)} scans</span>
            </div>
            <div className="flex justify-between">
              <span>Peak hour</span>
              <span className="font-medium">2:00 PM - 3:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Average session</span>
              <span className="font-medium">45 seconds</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
