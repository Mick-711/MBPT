import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Activity, Dumbbell, Scale, Apple, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProgressCelebration } from './progress-celebration';

interface DataPoint {
  date: string;
  value: number;
  goal?: number;
}

interface ProgressChartProps {
  clientId: number;
  weightData: DataPoint[];
  workoutData: DataPoint[];
  nutritionData: DataPoint[];
  streakCount: number;
}

export default function AnimatedProgressChart({ 
  clientId,
  weightData, 
  workoutData,
  nutritionData,
  streakCount
}: ProgressChartProps) {
  const [activeTab, setActiveTab] = useState('weight');
  const [milestone, setMilestone] = useState<number | null>(null);
  const [animateChart, setAnimateChart] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [progressBarValues, setProgressBarValues] = useState({
    weight: 0,
    workout: 0, 
    nutrition: 0
  });
  
  // Compute progress metrics for each category
  const calculateProgress = () => {
    // Weight progress - calculate percentage towards goal
    const latestWeight = weightData[weightData.length - 1];
    const initialWeight = weightData[0];
    const weightGoal = latestWeight.goal || initialWeight.value * 0.9; // Default goal is 10% reduction
    const weightProgressPercent = Math.min(
      100, 
      Math.max(0, Math.round(((initialWeight.value - latestWeight.value) / (initialWeight.value - weightGoal)) * 100))
    );
    
    // Workout progress - calculate adherence to planned workouts
    const workoutAdherence = workoutData.reduce((acc, curr) => acc + (curr.value >= (curr.goal || 0) ? 1 : 0), 0);
    const workoutProgressPercent = Math.round((workoutAdherence / workoutData.length) * 100);
    
    // Nutrition progress - calculate adherence to nutrition plan
    const nutritionAdherence = nutritionData.reduce((acc, curr) => acc + (curr.value >= (curr.goal || 0) ? 1 : 0), 0);
    const nutritionProgressPercent = Math.round((nutritionAdherence / nutritionData.length) * 100);
    
    return {
      weight: weightProgressPercent,
      workout: workoutProgressPercent,
      nutrition: nutritionProgressPercent
    };
  };
  
  // Animate progress bars on mount
  useEffect(() => {
    const progress = calculateProgress();
    
    // Animated the progress bars
    const animationTimeout = setTimeout(() => {
      setAnimateChart(true);
      
      const animationDuration = 1500; // Animation duration in ms
      const stepTime = 20; // Update interval in ms
      const steps = animationDuration / stepTime;
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const fraction = currentStep / steps;
        
        setProgressBarValues({
          weight: Math.round(progress.weight * fraction),
          workout: Math.round(progress.workout * fraction),
          nutrition: Math.round(progress.nutrition * fraction)
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimationComplete(true);
          
          // Check for milestone achievements based on streak
          if (streakCount === 7 || streakCount === 30 || streakCount === 100) {
            setMilestone(streakCount);
          }
        }
      }, stepTime);
      
      return () => clearInterval(interval);
    }, 500);
    
    return () => clearTimeout(animationTimeout);
  }, []);
  
  const activeData = React.useMemo(() => {
    switch(activeTab) {
      case 'weight': return weightData;
      case 'workout': return workoutData;
      case 'nutrition': return nutritionData;
      default: return weightData;
    }
  }, [activeTab, weightData, workoutData, nutritionData]);
  
  // Get color for progress bar based on value
  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-lime-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Get appropriate icon for each category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'weight': return <Scale className="h-4 w-4" />;
      case 'workout': return <Dumbbell className="h-4 w-4" />;
      case 'nutrition': return <Apple className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Progress Visualization
          </CardTitle>
          <CardDescription>
            Track your client's progress across key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weight" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="weight" className="flex items-center gap-1">
                <Scale className="h-4 w-4" />
                <span>Weight</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                <span>Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center gap-1">
                <Apple className="h-4 w-4" />
                <span>Nutrition</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="h-[200px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(value) => value.split(' ')[0]} 
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9), 
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]} 
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name={activeTab === 'weight' ? 'Weight' : activeTab === 'workout' ? 'Workouts' : 'Nutrition Score'}
                    stroke="#1a73e8" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                    isAnimationActive={animateChart}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                  {activeData[0]?.goal && (
                    <Line 
                      type="monotone" 
                      dataKey="goal" 
                      name="Target" 
                      stroke="#e53935" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false}
                      isAnimationActive={animateChart}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2">Overall Progress</h3>
              
              {/* Progress bars */}
              <div className="space-y-3">
                {Object.entries(progressBarValues).map(([category, value]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category}</span>
                      </div>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${getProgressColor(value)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Achievement badges for completed milestones */}
              {animationComplete && (
                <motion.div 
                  className="flex gap-2 pt-3 flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7, duration: 0.5 }}
                >
                  {progressBarValues.weight >= 25 && (
                    <motion.div 
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs flex items-center gap-1"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.8, type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <Scale className="h-3 w-3" />
                      <span>Weight 25%</span>
                    </motion.div>
                  )}
                  
                  {progressBarValues.workout >= 50 && (
                    <motion.div 
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs flex items-center gap-1"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.0, type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <Dumbbell className="h-3 w-3" />
                      <span>Workout 50%</span>
                    </motion.div>
                  )}
                  
                  {progressBarValues.nutrition >= 75 && (
                    <motion.div 
                      className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs flex items-center gap-1"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.2, type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <Apple className="h-3 w-3" />
                      <span>Nutrition 75%</span>
                    </motion.div>
                  )}
                  
                  {streakCount >= 7 && (
                    <motion.div 
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs flex items-center gap-1"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.4, type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <Heart className="h-3 w-3" />
                      <span>{streakCount} Day Streak</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Celebration modal for milestone achievements */}
      <ProgressCelebration 
        show={milestone !== null}
        milestone={milestone || 0}
        type={activeTab as any}
        onComplete={() => setMilestone(null)}
      />
    </>
  );
}