import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, CheckCircle } from 'lucide-react';

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

export default function TrainerStreakView({ 
  streakCount = 5, 
  longestStreak = 12, 
  totalCompletedDays = 23,
  streakDays = [],
  rewards = []
}: TrainerStreakViewProps) {
  
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
  
  // Calculate how many milestones the client has reached based on streak count
  const milestonesReached = rewards.filter(reward => streakCount >= reward.unlocksAt).length;
  const totalMilestones = rewards.length;
  
  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Client Adherence
          </CardTitle>
          <CardDescription>
            Habit tracking summary for this client
          </CardDescription>
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
                        <CheckCircle className="h-4 w-4" />
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
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Achievement Progress</h4>
              <Badge variant="outline">{milestonesReached} of {totalMilestones}</Badge>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${(milestonesReached / totalMilestones) * 100}%` }}
              ></div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              {milestonesReached >= totalMilestones ? (
                <p>Client has reached all available milestones.</p>
              ) : (
                <p>Client will reach next milestone at {
                  rewards.find(reward => reward.unlocksAt > streakCount)?.unlocksAt || 0
                } days of streak.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}