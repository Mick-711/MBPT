import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, Flame, Medal, Star, Trophy, Award, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakDay {
  date: string;
  completed: boolean;
  activities: string[];
}

interface Reward {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlocksAt: number; // streak count to unlock
}

interface ClientStreakTrackerProps {
  clientId: number;
  streakCount: number;
  streakDays: StreakDay[];
  longestStreak: number;
  totalCompletedDays: number;
  rewards: Reward[];
}

export default function ClientStreakTracker({ 
  clientId, 
  streakCount, 
  streakDays,
  longestStreak,
  totalCompletedDays,
  rewards 
}: ClientStreakTrackerProps) {
  // Calculate the next milestone
  const nextMilestone = React.useMemo(() => {
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    return milestones.find(milestone => milestone > streakCount) || milestones[milestones.length - 1];
  }, [streakCount]);

  // Calculate progress percentage to next milestone
  const progressToNextMilestone = React.useMemo(() => {
    const prevMilestone = streakCount === 0 ? 0 : 
      [0, 7, 14, 30, 60, 90, 180].filter(m => m < streakCount).pop() || 0;
    return Math.round(((streakCount - prevMilestone) / (nextMilestone - prevMilestone)) * 100);
  }, [streakCount, nextMilestone]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Habit Streaks</CardTitle>
          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Flame className="h-5 w-5" />
            <span className="text-xl">{streakCount}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </div>
        <CardDescription>
          Track consistency across workouts and nutrition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current streak visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Current Streak</span>
            <span>{streakCount} days</span>
          </div>
          <div className="space-y-1">
            <Progress value={progressToNextMilestone} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Next milestone: {nextMilestone} days</span>
              <span>{progressToNextMilestone}%</span>
            </div>
          </div>
        </div>

        {/* Recent activity calendar */}
        <div className="pt-2">
          <div className="text-sm font-medium mb-2">Recent Activity</div>
          <div className="flex gap-1 justify-between">
            {streakDays.slice(-7).map((day, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "flex flex-col items-center",
                        day.completed ? "text-green-500" : "text-muted-foreground"
                      )}
                    >
                      <div 
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full", 
                          day.completed ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
                        )}
                      >
                        {day.completed ? (
                          <Flame className="h-4 w-4" />
                        ) : (
                          <Calendar className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                      <div className="text-xs mt-1">{day.date.split(' ')[0]}</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="font-semibold">{day.date}</p>
                    {day.completed ? (
                      <>
                        <p className="text-xs text-green-500 font-medium">Activities completed:</p>
                        <ul className="text-xs mt-1 space-y-1">
                          {day.activities.map((activity, j) => (
                            <li key={j} className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-xs">No activities recorded</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Longest Streak</span>
            </div>
            <div className="mt-1 text-2xl font-semibold">{longestStreak} days</div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Days</span>
            </div>
            <div className="mt-1 text-2xl font-semibold">{totalCompletedDays}</div>
          </div>
        </div>

        {/* Rewards section */}
        <div className="pt-2">
          <div className="text-sm font-medium mb-3">Achievements & Rewards</div>
          <div className="grid grid-cols-4 gap-3">
            {rewards.map((reward) => (
              <TooltipProvider key={reward.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "aspect-square rounded-lg flex flex-col items-center justify-center",
                        reward.unlocked 
                          ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 flex items-center justify-center",
                        !reward.unlocked && "opacity-30"
                      )}>
                        {reward.icon}
                      </div>
                      {!reward.unlocked && (
                        <div className="text-[10px] mt-1 text-center">
                          {reward.unlocksAt} days
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="space-y-1">
                      <p className="font-semibold">{reward.name}</p>
                      <p className="text-xs">{reward.description}</p>
                      {!reward.unlocked && (
                        <p className="text-xs text-muted-foreground">
                          Unlocks at {reward.unlocksAt} day streak
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={rewards.every(r => r.unlocked)}
        >
          <Gift className="mr-2 h-4 w-4" />
          {rewards.every(r => r.unlocked) 
            ? "All rewards unlocked!" 
            : "Keep going for more rewards"}
        </Button>
      </CardFooter>
    </Card>
  );
}