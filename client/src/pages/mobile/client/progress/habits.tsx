import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MobileClientNav from '@/components/layout/mobile-client-nav';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Trophy, Medal, Flame, Gift, Star, Crown, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from 'wouter';
import { ProgressCelebration } from '@/components/clients/progress-celebration';
import confetti from 'canvas-confetti';

interface Reward {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlocksAt: number;
}

export default function ClientHabits() {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // Fetch client streak data
  const { data: streakData, isLoading } = useQuery({
    queryKey: ['/api/client/streaks'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Default data 
  const streakInfo = streakData || {
    streakCount: 14,
    longestStreak: 21,
    totalCompletedDays: 32,
    streakDays: [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return {
        date: date.toISOString().split('T')[0],
        completed: Math.random() > 0.2, // Most days completed for demo
        activities: ["Morning Workout", "Nutrition Plan"]
      };
    }),
    lastAchievement: {
      id: 3,
      name: "Fitness Enthusiast",
      description: "Completed 14 days in a row",
      timestamp: new Date(Date.now() - 2 * 60000).toISOString() // 2 minutes ago
    }
  };
  
  // Available rewards
  const rewards: Reward[] = [
    {
      id: 1,
      name: "Dedication Badge",
      description: "Completed 3 days in a row",
      icon: <Medal className="h-8 w-8 text-blue-400" />,
      unlocked: streakInfo.streakCount >= 3,
      unlocksAt: 3
    },
    {
      id: 2,
      name: "Consistency Award",
      description: "Completed 7 days in a row",
      icon: <Award className="h-8 w-8 text-green-400" />,
      unlocked: streakInfo.streakCount >= 7,
      unlocksAt: 7
    },
    {
      id: 3,
      name: "Fitness Enthusiast",
      description: "Completed 14 days in a row",
      icon: <Flame className="h-8 w-8 text-orange-400" />,
      unlocked: streakInfo.streakCount >= 14,
      unlocksAt: 14
    },
    {
      id: 4,
      name: "Health Champion",
      description: "Completed 30 days in a row",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      unlocked: streakInfo.streakCount >= 30,
      unlocksAt: 30
    },
    {
      id: 5,
      name: "Fitness Legend",
      description: "Completed 90 days in a row",
      icon: <Crown className="h-8 w-8 text-purple-500" />,
      unlocked: streakInfo.streakCount >= 90,
      unlocksAt: 90
    }
  ];
  
  // Check for newly unlocked achievements
  useEffect(() => {
    if (streakInfo.lastAchievement && 
        new Date(streakInfo.lastAchievement.timestamp).getTime() > Date.now() - 1000 * 60 * 5) { // Within last 5 minutes
      const achievement = rewards.find(r => r.id === streakInfo.lastAchievement.id);
      if (achievement) {
        setCelebrationMessage(`You've earned the ${achievement.name}! ${achievement.description}`);
        setShowCelebration(true);
      }
    }
  }, [streakInfo]);
  
  const openRewardDetails = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRewardDialog(true);
    
    if (reward.unlocked) {
      // Trigger confetti when viewing an unlocked reward
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
    }
  };
  
  return (
    <div className="pb-16">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center">
            <Link href="/mobile/client/progress">
              <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Habits & Streaks</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 space-y-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-orange-500" />
                  Your Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">{streakInfo.streakCount} days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                    <p className="text-2xl font-bold">{streakInfo.longestStreak} days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Days</p>
                    <p className="text-2xl font-bold">{streakInfo.totalCompletedDays}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Last 7 Days</h4>
                  <div className="flex justify-between">
                    {streakInfo.streakDays.slice(-7).map((day, index) => {
                      const date = new Date(day.date);
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="text-xs text-muted-foreground">
                            {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                          </div>
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center mt-1
                            ${day.completed 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                            }
                          `}>
                            {day.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{date.getDate()}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {rewards.map((reward) => (
                    <Button
                      key={reward.id}
                      variant="outline"
                      className={`h-auto p-2 flex flex-col items-center ${
                        reward.unlocked ? 'border-primary' : 'opacity-70'
                      }`}
                      onClick={() => openRewardDetails(reward)}
                    >
                      <div className="mb-1">
                        {reward.unlocked ? reward.icon : (
                          <div className="relative">
                            {reward.icon}
                            <div className="absolute inset-0 bg-background opacity-80 flex items-center justify-center rounded-full">
                              <Gift className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-xs truncate w-full text-center">
                        {reward.unlocked ? reward.name : `${reward.unlocksAt} days`}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      
      {/* Achievement popup */}
      {showCelebration && (
        <ProgressCelebration message={celebrationMessage} />
      )}
      
      {/* Reward Details Dialog */}
      {selectedReward && (
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center flex flex-col items-center">
                <div className="mb-4 mt-2">
                  {selectedReward.icon}
                </div>
                <span>{selectedReward.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <p className="mb-4">{selectedReward.description}</p>
              <p className="text-sm text-muted-foreground">
                {selectedReward.unlocked 
                  ? "You've earned this achievement! Keep up the great work." 
                  : `Continue your streak for ${selectedReward.unlocksAt - streakInfo.streakCount} more days to unlock.`
                }
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <MobileClientNav />
    </div>
  );
}