import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Gift, Award, PartyPopper } from 'lucide-react';

interface ProgressCelebrationProps {
  show: boolean;
  milestone: number;
  onComplete: () => void;
  type?: 'streak' | 'workout' | 'nutrition';
}

export function ProgressCelebration({ 
  show, 
  milestone, 
  onComplete,
  type = 'streak'
}: ProgressCelebrationProps) {
  const [playing, setPlaying] = useState(false);
  
  useEffect(() => {
    if (show && !playing) {
      setPlaying(true);
      
      // Trigger confetti effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            setPlaying(false);
            onComplete();
          }, 1000);
          return;
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Burst pattern
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFC107', '#FF9800', '#FF5722', '#F44336'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#26C6DA', '#00ACC1', '#00838F', '#006064'],
        });
      }, 250);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [show, playing, onComplete]);
  
  // Select icon based on milestone
  const getIcon = () => {
    if (milestone >= 100) return <Trophy className="h-12 w-12 text-amber-500" />;
    if (milestone >= 30) return <Award className="h-12 w-12 text-indigo-500" />;
    if (milestone >= 7) return <Star className="h-12 w-12 text-amber-500" />;
    return <PartyPopper className="h-12 w-12 text-blue-500" />;
  };
  
  // Generate congratulation message based on type and milestone
  const getMessage = () => {
    const baseMessage = milestone === 1 
      ? "Great start!" 
      : `Amazing ${milestone}-day streak!`;
    
    switch (type) {
      case 'workout':
        return `${baseMessage} Your fitness consistency is impressive!`;
      case 'nutrition':
        return `${baseMessage} You're building healthy eating habits!`;
      default:
        return `${baseMessage} Keep up the fantastic work!`;
    }
  };
  
  return (
    <AnimatePresence>
      {show && playing && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setPlaying(false);
            onComplete();
          }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md text-center"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              transition: { 
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 15
              }
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
                transition: { 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
              className="mx-auto mb-4 inline-block"
            >
              {getIcon()}
            </motion.div>
            
            <motion.h2
              className="text-2xl font-bold mb-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.4 }
              }}
            >
              Congratulations!
            </motion.h2>
            
            <motion.p
              className="text-muted-foreground mb-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.5 }
              }}
            >
              {getMessage()}
            </motion.p>
            
            <motion.div
              className="py-4 px-6 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 border border-amber-200 dark:border-amber-800 mb-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                transition: { delay: 0.6 } 
              }}
            >
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                <Gift className="h-5 w-5" />
                <span className="font-medium">Reward Unlocked!</span>
              </div>
              <p className="text-sm mt-1">
                {milestone >= 100 ? "Premium coaching session" :
                 milestone >= 30 ? "Exclusive workout plan" :
                 milestone >= 7 ? "Nutrition guide" :
                 "Profile badge"}
              </p>
            </motion.div>
            
            <motion.button
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2 rounded-md font-medium"
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.7 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPlaying(false);
                onComplete();
              }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}