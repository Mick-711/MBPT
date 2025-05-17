import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Sparkles, Brain, PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { 
  FoodData, 
  MealData, 
  MealPlanData, 
  getFoodsFromStorage 
} from '@/lib/nutritionHelpers';
import { 
  generateAIMealPlan, 
  convertAIMealPlanToAppFormat, 
  MacroTarget
} from '@/lib/aiNutrition';

interface AIMealPlanButtonProps {
  macroTargets: MacroTarget;
  onMealPlanGenerated: (meals: MealData[], macros: MacroTarget) => void;
}

export function AIMealPlanButton({ macroTargets, onMealPlanGenerated }: AIMealPlanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [preferredFoods, setPreferredFoods] = useState<string>('');
  const [excludedFoods, setExcludedFoods] = useState<string>('');
  const [includeFourthMeal, setIncludeFourthMeal] = useState(true);

  const generateMealPlan = async () => {
    try {
      setIsGenerating(true);
      
      // Get food database
      const foodDatabase = getFoodsFromStorage();
      
      // Generate preferences
      const preferences = {
        dietaryRestrictions: dietaryRestrictions,
        preferredFoods: preferredFoods.split(',').map(food => food.trim()).filter(food => food),
        excludedFoods: excludedFoods.split(',').map(food => food.trim()).filter(food => food),
        mealCount: includeFourthMeal ? 4 : 3
      };
      
      // Generate meal plan using AI
      const aiMealPlan = await generateAIMealPlan(macroTargets, foodDatabase, preferences);
      
      // Convert to app format
      const { meals, macros } = convertAIMealPlanToAppFormat(aiMealPlan, foodDatabase);
      
      // Call the callback
      onMealPlanGenerated(meals, macros);
      
      // Close dialog
      setIsOpen(false);
      
      // Show success toast
      toast({
        title: "AI Meal Plan Generated",
        description: "Your AI-powered meal plan has been created successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating AI meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        variant="default" 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Generate with AI
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              AI Meal Plan Generation
            </DialogTitle>
            <DialogDescription>
              Customize your AI-generated meal plan based on your preferences and dietary restrictions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dietary">Dietary Restrictions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map(diet => (
                    <div key={diet} className="flex items-center space-x-2">
                      <Checkbox 
                        id={diet.toLowerCase()}
                        checked={dietaryRestrictions.includes(diet)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDietaryRestrictions(prev => [...prev, diet]);
                          } else {
                            setDietaryRestrictions(prev => prev.filter(d => d !== diet));
                          }
                        }}
                      />
                      <Label htmlFor={diet.toLowerCase()} className="text-sm">{diet}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="preferred">Preferred Foods (comma separated)</Label>
                <Input 
                  id="preferred" 
                  value={preferredFoods} 
                  onChange={(e) => setPreferredFoods(e.target.value)}
                  placeholder="chicken, rice, avocado"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="excluded">Excluded Foods (comma separated)</Label>
                <Input 
                  id="excluded" 
                  value={excludedFoods} 
                  onChange={(e) => setExcludedFoods(e.target.value)}
                  placeholder="shellfish, peanuts, soy"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="includeFourthMeal"
                  checked={includeFourthMeal}
                  onCheckedChange={(checked) => setIncludeFourthMeal(checked === true)}
                />
                <Label htmlFor="includeFourthMeal">Include snacks as a fourth meal</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateMealPlan} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Meal Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}