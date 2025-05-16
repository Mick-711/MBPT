import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronUp, ChevronDown, Target } from 'lucide-react';

interface ProgressChartProps {
  data: Array<{ date: string; value: number }>;
  animate: boolean;
  goal?: number;
  isWeightChart?: boolean;
}

export default function AnimatedProgressChart({ data, animate, goal, isWeightChart = false }: ProgressChartProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [percentToGoal, setPercentToGoal] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

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
            if (previousValue > goal) {
              // Weight reduction goal
              const totalReduction = previousValue - goal;
              const currentReduction = previousValue - newValue;
              percentage = (currentReduction / totalReduction) * 100;
            } else {
              // Weight gain goal
              percentage = (newValue / goal) * 100;
            }
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
          if (previousValue > goal) {
            // Weight reduction goal
            const totalReduction = previousValue - goal;
            const currentReduction = previousValue - latestValue;
            percentage = (currentReduction / totalReduction) * 100;
          } else {
            // Weight gain goal
            percentage = (latestValue / goal) * 100;
          }
        } else {
          // Regular progress toward increasing a value
          percentage = (latestValue / goal) * 100;
        }
        
        setPercentToGoal(Math.min(percentage, 100));
      }
    }
  }, [data, animate, goal, isWeightChart]);

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold">
            {currentValue.toFixed(1)}
            <span className="text-xs text-muted-foreground ml-1">
              {isWeightChart ? 'kg' : ''}
            </span>
          </div>
          {getChangeIndicator()}
        </div>
        
        {goal && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress to goal</span>
              <div className="flex items-center">
                <Target className="w-3 h-3 mr-1 text-primary" />
                <span>{goal.toFixed(1)}{isWeightChart ? 'kg' : ''}</span>
              </div>
            </div>
            <Progress value={percentToGoal} className={`h-2 ${showAnimation ? 'animate-pulse' : ''}`} />
          </div>
        )}
        
        <div className="flex mt-4 space-x-1">
          {data.slice(-7).map((item, index) => {
            const max = Math.max(...data.slice(-7).map(d => d.value));
            const min = Math.min(...data.slice(-7).map(d => d.value));
            const range = max - min;
            const height = range > 0 ? ((item.value - min) / range) * 60 + 10 : 35;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center">
                  <div 
                    className={`w-full max-w-[20px] rounded-t-sm ${index === data.slice(-7).length - 1 ? 'bg-primary' : 'bg-muted'}`}
                    style={{ height: `${height}px` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                  {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}