import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Plus, ChevronLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  saveMealPlansToStorage, 
  getMealPlansFromStorage,
  MealPlanData,
  getFoodsFromStorage
} from '@/lib/nutritionHelpers';

export default function NewMealPlan() {
  const [, navigate] = useLocation();
  
  const [mealPlan, setMealPlan] = useState<Partial<MealPlanData>>({
    id: Date.now(),
    name: '',
    description: '',
    isTemplate: false,
    meals: [],
    clientId: null,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  // Check if we're loading from a template or from macro calculator
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    const templateIdParam = urlParams.get('templateId');
    
    // Check for macro parameters from calculator
    const proteinParam = urlParams.get('protein');
    const carbsParam = urlParams.get('carbs');
    const fatParam = urlParams.get('fat');
    
    // If we have macro parameters, use them
    if (proteinParam || carbsParam || fatParam) {
      const protein = proteinParam ? parseInt(proteinParam) : 0;
      const carbs = carbsParam ? parseInt(carbsParam) : 0;
      const fat = fatParam ? parseInt(fatParam) : 0;
      
      // Calculate total calories
      const calories = (protein * 4) + (carbs * 4) + (fat * 9);
      
      setMealPlan(prev => ({ 
        ...prev,
        name: 'Meal Plan Based on Calculated Macros',
        description: `Protein: ${protein}g, Carbs: ${carbs}g, Fat: ${fat}g`,
        protein,
        carbs,
        fat,
        calories
      }));
      
      // Fetch suggested foods based on macros
      fetch(`/api/food/suggestions?protein=${protein}&carbs=${carbs}&fat=${fat}`)
        .then(res => res.json())
        .then(data => {
          console.log('Suggested foods:', data);
          // You could use this data to pre-populate meals in the plan
        })
        .catch(err => console.error('Error fetching food suggestions:', err));
    }
    
    if (templateParam === 'true') {
      setMealPlan(prev => ({ ...prev, isTemplate: true }));
    }
    
    if (templateIdParam) {
      const plans = getMealPlansFromStorage();
      const template = plans.find(p => p.id === parseInt(templateIdParam));
      
      if (template) {
        // Create a new plan based on the template (with new ID)
        setMealPlan({
          ...template,
          id: Date.now(),
          name: `Copy of ${template.name}`,
          isTemplate: false
        });
      }
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMealPlan(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTemplateToggle = (checked: boolean) => {
    setMealPlan(prev => ({ ...prev, isTemplate: checked }));
  };
  
  const handleSave = () => {
    if (!mealPlan.name) {
      alert('Please enter a name for your meal plan');
      return;
    }
    
    // Save the meal plan
    const existingPlans = getMealPlansFromStorage() || [];
    const updatedPlans = [...existingPlans, mealPlan as MealPlanData];
    saveMealPlansToStorage(updatedPlans);
    
    // Navigate back to meal plans
    navigate('/nutrition/meal-plans');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/nutrition/meal-plans')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {mealPlan.isTemplate ? 'Create Meal Plan Template' : 'Create New Meal Plan'}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Meal Plan Details
          </CardTitle>
          <CardDescription>
            Enter the details for your new meal plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Meal Plan Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={mealPlan.name} 
              onChange={handleChange} 
              placeholder="Enter meal plan name" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={mealPlan.description} 
              onChange={handleChange} 
              placeholder="Enter a description for this meal plan" 
              rows={3} 
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isTemplate" 
              checked={mealPlan.isTemplate} 
              onCheckedChange={handleTemplateToggle} 
            />
            <Label htmlFor="isTemplate" className="cursor-pointer">
              Save as template for future use
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/nutrition/meal-plans')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mealPlan.isTemplate ? 'Save Template' : 'Create Meal Plan'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}