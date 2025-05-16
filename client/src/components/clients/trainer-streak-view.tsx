import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Medal, Flame, Gift, Star, Crown } from 'lucide-react';

interface TrainerStreakViewProps {
  streakCount: number;
  longestStreak: number;
  totalCompletedDays: number;
  streakDays: Array<{
    date: string;
    completed: boolean;
    activities: string[];
  }>;
  rewards: Array<{
    id: number;
    name: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    unlocksAt: number;
  }>;
}

const defaultRewards = [
  {
    id: 1,
    name: "Dedication Badge",
    description: "Completed 3 days in a row",
    icon: <Medal className="h-8 w-8 text-blue-400" />,
    unlocked: false,
    unlocksAt: 3
  },
  {
    id: 2,
    name: "Consistency Award",
    description: "Completed 7 days in a row",
    icon: <Award className="h-8 w-8 text-green-400" />,
    unlocked: false,
    unlocksAt: 7
  },
  {
    id: 3,
    name: "Fitness Enthusiast",
    description: "Completed 14 days in a row",
    icon: <Flame className="h-8 w-8 text-orange-400" />,
    unlocked: false,
    unlocksAt: 14
  },
  {
    id: 4,
    name: "Health Champion",
    description: "Completed 30 days in a row",
    icon: <Trophy className="h-8 w-8 text-yellow-500" />,
    unlocked: false,
    unlocksAt: 30
  },
  {
    id: 5,
    name: "Fitness Legend",
    description: "Completed 90 days in a row",
    icon: <Crown className="h-8 w-8 text-purple-500" />,
    unlocked: false,
    unlocksAt: 90
  }
];

export default function TrainerStreakView({ 
  streakCount = 5, 
  longestStreak = 12, 
  totalCompletedDays = 23,
  streakDays = [],
  rewards = defaultRewards
}: TrainerStreakViewProps) {
  
  // Process rewards to update unlocked status based on streak count
  const processedRewards = rewards.map(reward => ({
    ...reward,
    unlocked: streakCount >= reward.unlocksAt
  }));
  
  // Fill streakDays with default values if not provided
  const defaultStreakDays = [];
  if (streakDays.length === 0) {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      defaultStreakDays.push({
        date: date.toISOString().split('T')[0],
        completed: Math.random() > 0.3, // Randomly mark as completed
        activities: ["Cardio", "Nutrition plan"]
      });
    }
  }
  
  const displayStreakDays = streakDays.length > 0 ? streakDays : defaultStreakDays;
  
  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Client Streak Progress
          </CardTitle>
          <CardDescription>Habit tracking and streak information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{streakCount} days</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold">{longestStreak} days</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Days</p>
              <p className="text-2xl font-bold">{totalCompletedDays}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Last 7 Days</h4>
            <div className="flex justify-between">
              {displayStreakDays.slice(-7).map((day, index) => {
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
                        <Star className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{date.getDate()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Achievement Progress</h4>
            <div className="grid grid-cols-5 gap-2">
              {processedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`h-auto p-2 flex flex-col items-center border rounded-lg ${
                    reward.unlocked ? 'border-primary' : 'border-muted opacity-70'
                  }`}
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
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}