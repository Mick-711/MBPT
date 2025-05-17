import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MacroTarget, MealData } from '@/types/nutrition';

interface InlineMealPlanAIProps {
  macroTargets: MacroTarget;
  onMealsGenerated: (meals: MealData[]) => void;
}

export default function InlineMealPlanAI({ macroTargets, onMealsGenerated }: InlineMealPlanAIProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [mealCount, setMealCount] = useState<string>("3");
  
  // Helper function to get values from input fields with fallbacks
  const getInputValue = (id: string, defaultValue: string): number => {
    const element = document.getElementById(id) as HTMLInputElement;
    return element ? parseInt(element.value || defaultValue) : parseInt(defaultValue);
  };
  
  const handleGenerateMeals = () => {
    setGenerating(true);
    
    try {
      // Get meal distribution percentages from UI
      const breakfastPercentage = getInputValue('inline-breakfast-percentage', "25");
      const lunchPercentage = getInputValue('inline-lunch-percentage', "40");
      const dinnerPercentage = getInputValue('inline-dinner-percentage', "35");
      
      // Validate percentages sum to 100 for the base 3 meals
      let baseSum = breakfastPercentage + lunchPercentage + dinnerPercentage;
      let adjustedBreakfastPct = breakfastPercentage;
      let adjustedLunchPct = lunchPercentage;
      let adjustedDinnerPct = dinnerPercentage;
      
      // Adjust if not 100%
      if (baseSum !== 100) {
        const adjustmentFactor = 100 / baseSum;
        adjustedBreakfastPct = Math.round(breakfastPercentage * adjustmentFactor);
        adjustedLunchPct = Math.round(lunchPercentage * adjustmentFactor);
        // Ensure the total is exactly 100%
        adjustedDinnerPct = 100 - adjustedBreakfastPct - adjustedLunchPct;
      }
      
      // Determine meal configuration based on count
      let mealNames = ['Breakfast', 'Lunch', 'Dinner'];
      let times = ['08:00', '13:00', '19:00'];
      let ratios = [
        adjustedBreakfastPct/100, 
        adjustedLunchPct/100, 
        adjustedDinnerPct/100
      ];
      
      // Add snacks if needed
      const mealCountInt = parseInt(mealCount);
      if (mealCountInt > 3) {
        const snacksCount = mealCountInt - 3;
        const includeSnacks = (document.getElementById('inline-includeSnacks') as HTMLInputElement)?.checked ?? true;
        
        if (includeSnacks) {
          // Calculate percentage for snacks (evenly distributed)
          const snackPercentage = 15; // 15% per snack
          const totalSnackPercentage = snackPercentage * snacksCount;
          
          // Adjust main meal percentages
          const mainMealsAdjustment = (100 - totalSnackPercentage) / 100;
          ratios = ratios.map(r => r * mainMealsAdjustment);
          
          // Add snack ratios
          const snackRatio = snackPercentage / 100;
          
          // Add snacks to meals
          for (let i = 0; i < snacksCount; i++) {
            const snackNum = i + 1;
            mealNames.push(`Snack ${snacksCount > 1 ? snackNum : ''}`);
            
            // Set appropriate snack times
            if (snacksCount === 1) {
              times.push('15:30'); // Mid-afternoon snack
            } else if (snacksCount === 2) {
              times.push(i === 0 ? '10:30' : '15:30'); // Morning and afternoon
            } else if (snacksCount === 3) {
              times.push(i === 0 ? '10:30' : (i === 1 ? '15:30' : '20:30')); // Morning, afternoon, evening
            }
            
            ratios.push(snackRatio);
          }
        }
      }
      
      const totalProtein = macroTargets.protein || 0;
      const totalCarbs = macroTargets.carbs || 0;
      const totalFat = macroTargets.fat || 0;
      const totalCalories = macroTargets.calories || 0;
      
      // Create meals based on calculated distribution
      const meals = mealNames.map((name, index) => {
        const ratio = ratios[index];
        return {
          id: Date.now() + index,
          name,
          description: `AI-generated ${name.toLowerCase()} suggestion`,
          time: times[index],
          foods: [],
          totalCalories: Math.round(totalCalories * ratio),
          totalProtein: Math.round(totalProtein * ratio),
          totalCarbs: Math.round(totalCarbs * ratio),
          totalFat: Math.round(totalFat * ratio)
        };
      });
      
      // Pass generated meals to parent
      onMealsGenerated(meals);
      
      // Show success toast
      toast({
        title: "Success!",
        description: "AI meal plan created with balanced macros.",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error generating meals:", error);
      toast({
        title: "Error generating meals",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Distribute Macros with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Meal Distribution</DialogTitle>
          <DialogDescription>
            Create a balanced meal distribution based on your macro targets
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p>Using AI technology, we'll intelligently distribute your macros across multiple meals.</p>
          <div className="bg-muted p-3 rounded-md">
            <h4 className="font-medium mb-1">Current Macro Targets:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Calories: <span className="font-medium">{macroTargets.calories} kcal</span></div>
              <div>Protein: <span className="font-medium">{macroTargets.protein}g</span></div>
              <div>Carbs: <span className="font-medium">{macroTargets.carbs}g</span></div>
              <div>Fat: <span className="font-medium">{macroTargets.fat}g</span></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Customize Meal Plan:</h4>
            
            <div className="space-y-1">
              <Label htmlFor="mealCount">Number of Meals</Label>
              <Select 
                defaultValue="3"
                onValueChange={(value) => setMealCount(value)}
              >
                <SelectTrigger id="mealCount" className="w-full">
                  <SelectValue placeholder="Choose meal count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 (Breakfast, Lunch, Dinner)</SelectItem>
                  <SelectItem value="4">4 (Breakfast, Lunch, Dinner, Snack)</SelectItem>
                  <SelectItem value="5">5 (Breakfast, Lunch, Dinner, 2 Snacks)</SelectItem>
                  <SelectItem value="6">6 (Breakfast, Lunch, Dinner, 3 Snacks)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>
                  Breakfast Macros
                  <span className="ml-1 text-xs text-muted-foreground">(25%)</span>
                </Label>
                <Input 
                  type="number" 
                  defaultValue="25"
                  min="5"
                  max="50"
                  className="w-full"
                  id="inline-breakfast-percentage"
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Lunch Macros
                  <span className="ml-1 text-xs text-muted-foreground">(40%)</span>
                </Label>
                <Input 
                  type="number" 
                  defaultValue="40"
                  min="10"
                  max="50"
                  className="w-full"
                  id="inline-lunch-percentage"
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Dinner Macros
                  <span className="ml-1 text-xs text-muted-foreground">(35%)</span>
                </Label>
                <Input 
                  type="number" 
                  defaultValue="35"
                  min="10"
                  max="50"
                  className="w-full"
                  id="inline-dinner-percentage"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <Checkbox id="inline-includeSnacks" defaultChecked />
                <Label htmlFor="inline-includeSnacks" className="ml-2">
                  Include snacks if needed to balance total macros
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                The system will automatically calculate and create snacks to help balance your daily macro targets
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogTrigger>
          <Button
            type="button"
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            onClick={handleGenerateMeals}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Generating...
              </>
            ) : (
              'Generate Meals'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}