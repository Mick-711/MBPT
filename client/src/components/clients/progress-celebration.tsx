import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProgressCelebrationProps {
  message: string;
}

export function ProgressCelebration({ message }: ProgressCelebrationProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Skip celebration effects if we're in the trainer view
    if (open && !window.IS_TRAINER_VIEW) {
      // Trigger confetti when celebration modal is shown
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        
        // Launch confetti from both sides
        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: 0 }
        });
        
        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: 1 }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-primary-foreground to-background border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-10 w-10 text-yellow-500 mr-2" />
              <span>Achievement Unlocked!</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-6">
          <p className="text-xl mb-6">{message}</p>
          <div className="flex justify-center">
            <Button onClick={() => setOpen(false)} className="px-6">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}