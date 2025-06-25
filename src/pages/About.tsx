
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Zap, 
  Globe, 
  Shield, 
  Sparkles, 
  Gift,
  ExternalLink,
  Code,
  Rocket,
  Trophy,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const achievements = [
    "Full-stack developer with 8+ years experience",
    "Built multiple successful products reaching millions",
    "Open source contributor and tech enthusiast",
    "Passionate about creating free tools for everyone"
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate QR codes instantly with our optimized algorithms"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "All processing happens in your browser - no data leaves your device"
    },
    {
      icon: Sparkles,
      title: "AI Enhanced",
      description: "Smart optimization for maximum scannability and visual appeal"
    },
    {
      icon: Heart,
      title: "Always Free",
      description: "No hidden costs, no subscriptions, no limits - free forever"
    },
    {
      icon: Globe,
      title: "Universal Access",
      description: "Works on any device, anywhere in the world"
    },
    {
      icon: Gift,
      title: "Feature Rich",
      description: "Advanced customization, analytics, and unique features"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            anwe.sh
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-6"
            variants={itemVariants}
          >
            QR Studio - The Future of QR Code Generation
          </motion.p>
          <motion.div className="flex justify-center gap-4 flex-wrap" variants={itemVariants}>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              100% Free Forever
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Powered
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Privacy First
            </Badge>
          </motion.div>
        </motion.div>

        {/* Why Free Forever */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <Heart className="w-8 h-8 text-red-500" />
                Why Free Forever?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg text-muted-foreground leading-relaxed">
                <p className="mb-4">
                  <strong>Because knowledge and tools should be accessible to everyone.</strong>
                </p>
                <p className="mb-4">
                  I believe in democratizing technology. QR codes are essential for modern digital communication, 
                  and everyone deserves access to professional-quality generation tools without barriers.
                </p>
                <p className="mb-4">
                  This project is my contribution to the global community - a way to give back and help 
                  businesses, students, developers, and creators around the world succeed without worrying about costs.
                </p>
                <p>
                  Your support through donations helps maintain and improve this service, but it will 
                  <strong> always remain free</strong> for everyone, everywhere.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose anwe.sh QR Studio?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="h-full backdrop-blur-sm bg-card/80 border-2 border-border/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/10">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About Anwesh */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <Rocket className="w-8 h-8 text-blue-500" />
                About Anwesh Rath
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    Full-stack developer, entrepreneur, and passionate creator building tools 
                    that make a difference in people's lives.
                  </p>
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Connect & Explore</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        anwe.sh - Personal Website
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://xbesh.com" target="_blank" rel="noopener noreferrer">
                        <Code className="w-4 h-4 mr-2" />
                        xbesh.com - Tech Blog
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://copyalche.my" target="_blank" rel="noopener noreferrer">
                        <Sparkles className="w-4 h-4 mr-2" />
                        copyalche.my - AI Tools
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="text-center">
          <Card className="backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-200/20 p-8">
            <CardContent className="space-y-6">
              <h3 className="text-2xl font-bold">Ready to Create Amazing QR Codes?</h3>
              <p className="text-muted-foreground">
                Join thousands of users already creating professional QR codes with our platform.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  <Link to="/">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Creating
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer">
                    <Heart className="w-4 h-4 mr-2" />
                    Learn More About Me
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default About;
