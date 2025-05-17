// Define basic nutrition types for reuse across components

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealFoodItem {
  id: number;
  foodId: number;
  name: string;
  quantity: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealData {
  id: number;
  name: string;
  description: string;
  time: string;
  foods: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DayData {
  dayNumber: number;
  meals: MealData[];
}

export interface MealPlanData {
  id: number;
  name: string;
  description: string | null;
  isTemplate: boolean;
  clientId?: number;
  trainerId?: number;
  startDate?: string;
  endDate?: string;
  days: DayData[];
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

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
  notes?: string;
}

export interface MealLogData {
  id: number;
  date: string;
  clientId?: number;
  meals: MealData[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}