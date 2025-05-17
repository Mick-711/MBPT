// Import types from nutritionHelpers.ts
// We're using a separate interface here since the original may not be exported
export interface FoodData {
  id: number;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isPublic?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealFoodItem {
  foodId: number;
  quantity: number;
  notes?: string;
}

export interface MealData {
  id: number;
  name: string;
  description?: string;
  time?: string;
  foods: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlanDay {
  dayNumber: number;
  meals: MealData[];
}

// Import actual functions from nutritionHelpers
import { getFoodsFromStorage } from './nutritionHelpers';

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodSuggestion {
  name: string;
  servingSize: string;
  macros: MacroTarget;
}

export interface AISuggestions {
  protein: FoodSuggestion[];
  carbs: FoodSuggestion[];
  fats: FoodSuggestion[];
  vegetables?: FoodSuggestion[];
}

export interface MealRecommendation {
  mealName: string;
  foods: Array<{
    name: string;
    quantity: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  totalMacros: MacroTarget;
}

export interface AIMealPlan {
  breakfast: MealRecommendation;
  lunch: MealRecommendation;
  dinner: MealRecommendation;
  snacks?: MealRecommendation;
  dailyTotals: MacroTarget;
}

interface PreferenceOptions {
  dietaryRestrictions?: string[];
  preferredFoods?: string[];
  excludedFoods?: string[];
  mealCount?: number;
}

/**
 * Get AI-powered food suggestions based on macro targets
 */
export async function getAIFoodSuggestions(
  macroTargets: MacroTarget,
  preferences: PreferenceOptions = {}
): Promise<AISuggestions> {
  try {
    const response = await fetch(`/api/food/suggestions?protein=${macroTargets.protein}&carbs=${macroTargets.carbs}&fat=${macroTargets.fat}&ai=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get AI food suggestions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting AI food suggestions:', error);
    throw error;
  }
}

/**
 * Generate an AI-powered meal plan based on macro targets and available foods
 */
export async function generateAIMealPlan(
  macroTargets: MacroTarget,
  availableFoods: FoodData[],
  preferences: PreferenceOptions = {}
): Promise<AIMealPlan> {
  try {
    const response = await fetch('/api/nutrition/ai/meal-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        macroTargets,
        availableFoods,
        preferences
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate AI meal plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating AI meal plan:', error);
    throw error;
  }
}

/**
 * Convert AI meal plan to our app's meal plan format
 */
export function convertAIMealPlanToAppFormat(
  aiMealPlan: AIMealPlan,
  foodDatabase: FoodData[]
): { 
  meals: MealData[],
  macros: MacroTarget
} {
  const meals: MealData[] = [];
  
  // Process breakfast
  const breakfast: MealData = {
    id: Date.now(),
    name: aiMealPlan.breakfast.mealName,
    description: 'AI-generated breakfast',
    time: '08:00',
    foods: mapAiFoodsToMealFoods(aiMealPlan.breakfast.foods, foodDatabase),
    totalCalories: aiMealPlan.breakfast.totalMacros.calories,
    totalProtein: aiMealPlan.breakfast.totalMacros.protein,
    totalCarbs: aiMealPlan.breakfast.totalMacros.carbs,
    totalFat: aiMealPlan.breakfast.totalMacros.fat
  };
  meals.push(breakfast);
  
  // Process lunch
  const lunch: MealData = {
    id: Date.now() + 1,
    name: aiMealPlan.lunch.mealName,
    description: 'AI-generated lunch',
    time: '13:00',
    foods: mapAiFoodsToMealFoods(aiMealPlan.lunch.foods, foodDatabase),
    totalCalories: aiMealPlan.lunch.totalMacros.calories,
    totalProtein: aiMealPlan.lunch.totalMacros.protein,
    totalCarbs: aiMealPlan.lunch.totalMacros.carbs,
    totalFat: aiMealPlan.lunch.totalMacros.fat
  };
  meals.push(lunch);
  
  // Process dinner
  const dinner: MealData = {
    id: Date.now() + 2,
    name: aiMealPlan.dinner.mealName,
    description: 'AI-generated dinner',
    time: '19:00',
    foods: mapAiFoodsToMealFoods(aiMealPlan.dinner.foods, foodDatabase),
    totalCalories: aiMealPlan.dinner.totalMacros.calories,
    totalProtein: aiMealPlan.dinner.totalMacros.protein,
    totalCarbs: aiMealPlan.dinner.totalMacros.carbs,
    totalFat: aiMealPlan.dinner.totalMacros.fat
  };
  meals.push(dinner);
  
  // Process snacks if available
  if (aiMealPlan.snacks) {
    const snacks: MealData = {
      id: Date.now() + 3,
      name: aiMealPlan.snacks.mealName,
      description: 'AI-generated snacks',
      time: '16:00',
      foods: mapAiFoodsToMealFoods(aiMealPlan.snacks.foods, foodDatabase),
      totalCalories: aiMealPlan.snacks.totalMacros.calories,
      totalProtein: aiMealPlan.snacks.totalMacros.protein,
      totalCarbs: aiMealPlan.snacks.totalMacros.carbs,
      totalFat: aiMealPlan.snacks.totalMacros.fat
    };
    meals.push(snacks);
  }
  
  return {
    meals,
    macros: aiMealPlan.dailyTotals
  };
}

/**
 * Map AI foods to meal food items
 */
function mapAiFoodsToMealFoods(
  aiFoods: Array<{
    name: string;
    quantity: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>,
  foodDatabase: FoodData[]
) {
  return aiFoods.map(aiFood => {
    // Try to find matching food in database
    const matchingFood = foodDatabase.find(
      f => f.name.toLowerCase() === aiFood.name.toLowerCase()
    );
    
    if (matchingFood) {
      return {
        foodId: matchingFood.id,
        quantity: aiFood.quantity,
        notes: `AI recommended ${aiFood.quantity} ${aiFood.servingUnit}`
      };
    } else {
      // If no matching food, create a temporary food entry
      const tempFood: FoodData = {
        id: -Date.now() - Math.floor(Math.random() * 1000),  // Temporary negative ID
        name: aiFood.name,
        category: determineCategory(aiFood),
        servingSize: parseInt(aiFood.servingUnit) || 100,
        servingUnit: aiFood.servingUnit.replace(/[0-9]/g, '').trim() || 'g',
        calories: aiFood.calories,
        protein: aiFood.protein,
        carbs: aiFood.carbs,
        fat: aiFood.fat,
        isPublic: true,
        createdBy: 0, // System-created
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local database (would need to be implemented elsewhere)
      // For now, return the foodId reference
      return {
        foodId: tempFood.id,
        quantity: aiFood.quantity,
        notes: `AI recommended food not in database`
      };
    }
  });
}

/**
 * Determine the category of a food based on its macros
 */
function determineCategory(food: { protein: number, carbs: number, fat: number }): string {
  const totalMacroGrams = food.protein + food.carbs + food.fat;
  const proteinPercentage = food.protein / totalMacroGrams * 100;
  const carbsPercentage = food.carbs / totalMacroGrams * 100;
  const fatPercentage = food.fat / totalMacroGrams * 100;
  
  if (proteinPercentage >= 40) return 'protein';
  if (carbsPercentage >= 40) return 'carbs';
  if (fatPercentage >= 40) return 'fat';
  return 'other';
}