import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, Award, Trophy, Target, TrendingUp, Zap, LineChart } from 'lucide-react';
import ClientStreakTracker from './client-streak-tracker';
import AnimatedProgressChart from './animated-progress-chart';
import { ProgressCelebration } from './progress-celebration';
import WeightTrendChart from './weight-trend-chart';

// Mock data for the client's health metrics
const healthMetrics = {
  currentWeight: 78.6,
  targetWeight: 75.0,
  previousWeight: 79.2,
  workoutStreak: 5,
  longestStreak: 12,
  totalWorkoutDays: 23,
  weightHistory: [
    { date: '2025-03-27', value: 81.3 },
    { date: '2025-03-29', value: 81.0 },
    { date: '2025-04-02', value: 80.7 },
    { date: '2025-04-06', value: 80.4 },
    { date: '2025-04-10', value: 80.5 },
    { date: '2025-04-13', value: 80.0 },
    { date: '2025-04-17', value: 79.8 },
    { date: '2025-04-20', value: 79.5 },
    { date: '2025-04-24', value: 79.2 },
    { date: '2025-04-27', value: 79.0 },
    { date: '2025-05-01', value: 78.9 },
    { date: '2025-05-04', value: 78.8 },
    { date: '2025-05-08', value: 78.6 }
  ],
  workoutCompletion: [
    // Weekly programmed workouts - shows completed vs total for the week
    { date: '2025-04-30', value: 3 }, // 3 completed workouts 
    { date: '2025-05-01', value: 3 },
    { date: '2025-05-02', value: 3 },
    { date: '2025-05-03', value: 3 },
    { date: '2025-05-04', value: 4 },
    { date: '2025-05-05', value: 4 },
    { date: '2025-05-06', value: 4 }
  ],
  nutritionPlan: {
    calories: 2400,
    protein: 180,
    carbs: 220,
    fats: 80
  },
  nutritionAdherence: [
    { date: '2025-04-30', value: 60, calories: 1850, protein: 120, carbs: 190, fats: 60 },
    { date: '2025-05-01', value: 80, calories: 2150, protein: 156, carbs: 201, fats: 72 },
    { date: '2025-05-02', value: 75, calories: 2080, protein: 145, carbs: 192, fats: 68 },
    { date: '2025-05-03', value: 70, calories: 1950, protein: 130, carbs: 170, fats: 65 },
    { date: '2025-05-04', value: 90, calories: 2320, protein: 170, carbs: 215, fats: 76 },
    { date: '2025-05-05', value: 85, calories: 2250, protein: 165, carbs: 210, fats: 74 },
    { date: '2025-05-06', value: 80, calories: 2100, protein: 160, carbs: 195, fats: 70 }
  ],
  streakDays: [
    { date: '2025-05-01', completed: true, activities: ['Workout', 'Nutrition'] },
    { date: '2025-05-02', completed: true, activities: ['Workout'] },
    { date: '2025-05-03', completed: false, activities: [] },
    { date: '2025-05-04', completed: true, activities: ['Workout', 'Nutrition'] },
    { date: '2025-05-05', completed: true, activities: ['Workout'] },
    { date: '2025-05-06', completed: true, activities: ['Workout', 'Nutrition'] },
    { date: '2025-05-07', completed: true, activities: ['Workout'] }
  ]
};

export default function ClientHealthMetricsTab({ client }) {
  const [showWeightCelebration, setShowWeightCelebration] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  // Simulate effects when the component loads
  useEffect(() => {
    // Show animations after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 500);
    
    // Check if weight milestone reached
    if (healthMetrics.currentWeight < healthMetrics.previousWeight) {
      setTimeout(() => {
        setShowWeightCelebration(true);
      }, 1000);
    }
    
    // Check if streak milestone reached
    if (healthMetrics.workoutStreak >= 5 && healthMetrics.workoutStreak % 5 === 0) {
      setTimeout(() => {
        setShowStreakCelebration(true);
      }, 2000);
    }
  }, []);
  
  return (
    <div>
      <Tabs defaultValue="progress">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="progress" className="flex-1 py-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex-1 py-2">
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex-1 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Streaks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Heart className="text-red-500 mr-2 h-5 w-5" />
                Weight Progress
              </h3>
              <AnimatedProgressChart 
                data={healthMetrics.weightHistory}
                animate={animate}
                goal={healthMetrics.targetWeight}
                isWeightChart={true}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Trophy className="text-amber-500 mr-2 h-5 w-5" />
                Workout Completion
              </h3>
              <AnimatedProgressChart 
                data={healthMetrics.workoutCompletion}
                animate={animate}
                goal={5} // Weekly goal of 5 workouts
                isWorkoutChart={true}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Award className="text-emerald-500 mr-2 h-5 w-5" />
              Nutrition Adherence
            </h3>
            
            <div className="bg-muted/30 p-3 rounded-md mb-4">
              <h4 className="text-sm font-medium mb-2">Daily Nutrition Plan</h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-background rounded-md p-2">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="text-lg font-medium">{healthMetrics.nutritionPlan.calories}</div>
                </div>
                <div className="bg-background rounded-md p-2">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="text-lg font-medium">{healthMetrics.nutritionPlan.protein}g</div>
                </div>
                <div className="bg-background rounded-md p-2">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="text-lg font-medium">{healthMetrics.nutritionPlan.carbs}g</div>
                </div>
                <div className="bg-background rounded-md p-2">
                  <div className="text-xs text-muted-foreground">Fats</div>
                  <div className="text-lg font-medium">{healthMetrics.nutritionPlan.fats}g</div>
                </div>
              </div>
            </div>
            
            <AnimatedProgressChart 
              data={healthMetrics.nutritionAdherence}
              animate={animate}
              goal={100}
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <LineChart className="text-blue-500 mr-2 h-5 w-5" />
              Weight Trend Analysis
            </h3>
            <WeightTrendChart 
              weightData={healthMetrics.weightHistory}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Client Goals</CardTitle>
              <CardDescription>
                Current targets and achievements for {client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium">Weight Goal</h4>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-xl font-semibold">{healthMetrics.currentWeight} kg</p>
                    </div>
                    <div className="font-medium text-lg">→</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="text-xl font-semibold">{healthMetrics.targetWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-xl font-semibold">
                        {(healthMetrics.currentWeight - healthMetrics.targetWeight).toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Workout Consistency</h4>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-xl font-semibold">{healthMetrics.workoutStreak} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Goal</p>
                      <p className="text-xl font-semibold">
                        {healthMetrics.workoutStreak < 7 ? 7 :
                         healthMetrics.workoutStreak < 14 ? 14 :
                         healthMetrics.workoutStreak < 30 ? 30 : 90} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Days to Go</p>
                      <p className="text-xl font-semibold">
                        {healthMetrics.workoutStreak < 7 ? 7 - healthMetrics.workoutStreak :
                         healthMetrics.workoutStreak < 14 ? 14 - healthMetrics.workoutStreak :
                         healthMetrics.workoutStreak < 30 ? 30 - healthMetrics.workoutStreak : 
                         90 - healthMetrics.workoutStreak}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">Update Goals</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="streaks">
          <ClientStreakTracker 
            streakCount={healthMetrics.workoutStreak}
            longestStreak={healthMetrics.longestStreak}
            totalCompletedDays={healthMetrics.totalWorkoutDays}
            streakDays={healthMetrics.streakDays}
          />
        </TabsContent>
      </Tabs>
      
      {/* Celebration modals */}
      {showWeightCelebration && (
        <ProgressCelebration 
          message={`Great job! You've lost ${(healthMetrics.previousWeight - healthMetrics.currentWeight).toFixed(1)} kg since your last weigh-in!`}
        />
      )}
      
      {showStreakCelebration && (
        <ProgressCelebration 
          message={`Awesome! You've maintained your workout streak for ${healthMetrics.workoutStreak} days!`}
        />
      )}
    </div>
  );
}