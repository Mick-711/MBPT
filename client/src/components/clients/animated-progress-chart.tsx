import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronUp, ChevronDown, Target, CalendarDays, CheckCircle } from 'lucide-react';

interface ProgressChartProps {
  data: Array<{ date: string; value: number }>;
  animate: boolean;
  goal?: number;
  isWeightChart?: boolean;
  isWorkoutChart?: boolean;
}

export default function AnimatedProgressChart({ 
  data, 
  animate, 
  goal, 
  isWeightChart = false,
  isWorkoutChart = false
}: ProgressChartProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [percentToGoal, setPercentToGoal] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Get initial value (starting point)
  const getInitialValue = () => {
    if (!data || data.length === 0) return 0;
    return data[0].value;
  };

  const getChangeIndicator = () => {
    if (data.length < 2) return null;
    
    const latestValue = data[data.length - 1].value;
    const previousValue = data[data.length - 2].value;
    const diff = latestValue - previousValue;
    
    // For weight chart, decreasing is positive progress (unless goal is higher than current)
    const isPositiveDirection = isWeightChart ? 
      (goal && goal > latestValue ? diff > 0 : diff < 0) : 
      diff > 0;
    
    const absValue = Math.abs(diff).toFixed(1);
    
    return (
      <div className={`flex items-center ${isPositiveDirection ? 'text-green-500' : 'text-red-500'}`}>
        {isPositiveDirection ? 
          <ChevronUp className="w-4 h-4 mr-1" /> : 
          <ChevronDown className="w-4 h-4 mr-1" />
        }
        <span>{absValue}</span>
      </div>
    );
  };

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const latestValue = data[data.length - 1].value;
    const previousValue = data.length > 1 ? data[data.length - 2].value : latestValue;
    
    setIsIncreasing(latestValue > previousValue);
    
    if (animate) {
      setShowAnimation(true);
      setCurrentValue(0);
      
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      const animationDuration = 2000; // 2 seconds
      const steps = 60; // 60 steps (30fps for 2 seconds)
      const increment = latestValue / steps;
      let currentStep = 0;
      
      const animateTo = () => {
        currentStep++;
        const newValue = Math.min(increment * currentStep, latestValue);
        setCurrentValue(newValue);
        
        if (goal) {
          // Calculate percentage to goal
          // For weight chart, if current > goal, we want to show progress toward reduction
          // For other charts, we generally want to show progress toward increase
          let percentage;
          if (isWeightChart) {
            if (getInitialValue() > goal) {
              // Weight reduction goal
              const totalReduction = getInitialValue() - goal;
              const currentReduction = getInitialValue() - newValue;
              percentage = (currentReduction / totalReduction) * 100;
            } else {
              // Weight gain goal
              percentage = (newValue / goal) * 100;
            }
          } else if (isWorkoutChart) {
            // Workout chart shows workouts completed vs programmed per week
            percentage = (newValue / goal) * 100;
          } else {
            // Regular progress toward increasing a value
            percentage = (newValue / goal) * 100;
          }
          
          setPercentToGoal(Math.min(percentage, 100));
        }
        
        if (currentStep < steps) {
          animationRef.current = setTimeout(animateTo, animationDuration / steps);
        } else {
          setShowAnimation(false);
        }
      };
      
      animationRef.current = setTimeout(animateTo, 10);
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    } else {
      setCurrentValue(latestValue);
      
      if (goal) {
        // Calculate final percentage
        let percentage;
        if (isWeightChart) {
          if (getInitialValue() > goal) {
            // Weight reduction goal
            const totalReduction = getInitialValue() - goal;
            const currentReduction = getInitialValue() - latestValue;
            percentage = (currentReduction / totalReduction) * 100;
          } else {
            // Weight gain goal
            percentage = (latestValue / goal) * 100;
          }
        } else if (isWorkoutChart) {
          // Workout chart shows workouts completed vs programmed per week
          percentage = (latestValue / goal) * 100;
        } else {
          // Regular progress toward increasing a value
          percentage = (latestValue / goal) * 100;
        }
        
        setPercentToGoal(Math.min(percentage, 100));
      }
    }
  }, [data, animate, goal, isWeightChart, isWorkoutChart]);

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Render specific content based on chart type
  const renderContent = () => {
    if (isWeightChart) {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="text-lg font-semibold">{getInitialValue().toFixed(1)} kg</div>
              <div className="text-xs mx-2 text-muted-foreground">→</div>
              <div className="text-lg font-semibold">{currentValue.toFixed(1)} kg</div>
            </div>
            {getChangeIndicator()}
          </div>
          
          {goal && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress to goal</span>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-primary" />
                  <span>{goal.toFixed(1)} kg</span>
                  <span className="text-xs text-muted-foreground">({Math.round(percentToGoal)}%)</span>
                </div>
              </div>
              <Progress value={percentToGoal} className={`h-2 ${showAnimation ? 'animate-pulse' : ''}`} />
            </div>
          )}
        </>
      );
    } else if (isWorkoutChart) {
      return (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-semibold flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              <span>{currentValue.toFixed(0)}</span>
              <span className="text-xs text-muted-foreground ml-1">
                / {goal} workouts this week
              </span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Weekly completion</span>
              <div className="flex items-center">
                <CalendarDays className="w-3 h-3 mr-1 text-primary" />
                <span>{currentValue.toFixed(0)}/{goal} ({Math.round(percentToGoal)}%)</span>
              </div>
            </div>
            <Progress value={percentToGoal} className={`h-2 ${showAnimation ? 'animate-pulse' : ''}`} />
          </div>
        </>
      );
    } else {
      // Default for other chart types (like nutrition)
      return (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-semibold">
              {currentValue.toFixed(1)}
            </div>
            {getChangeIndicator()}
          </div>
          
          {goal && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress to goal</span>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-primary" />
                  <span>{goal.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({Math.round(percentToGoal)}%)</span>
                </div>
              </div>
              <Progress value={percentToGoal} className={`h-2 ${showAnimation ? 'animate-pulse' : ''}`} />
            </div>
          )}
          
          <div className="mt-4">
            <div className="flex justify-between mb-2 text-xs font-medium">
              <div>Day</div>
              <div>Calories</div>
              <div>Protein</div>
              <div>Carbs</div>
              <div>Fats</div>
            </div>
            
            {data.slice(-7).map((item: any, index) => {
              const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
              const isToday = index === data.slice(-7).length - 1;
              
              return (
                <div key={index} className={`flex justify-between py-1.5 text-xs border-t ${isToday ? 'bg-muted/30' : ''}`}>
                  <div className="font-medium">{dayName}</div>
                  <div>{item.calories || '-'}</div>
                  <div>{item.protein || '-'}g</div>
                  <div>{item.carbs || '-'}g</div>
                  <div>{item.fats || '-'}g</div>
                </div>
              );
            })}
          </div>
        </>
      );
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}