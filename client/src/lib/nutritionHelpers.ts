// Local storage keys
export const NUTRITION_STORAGE_KEYS = {
  FOODS: 'fitTrainPro_foods',
  MEAL_PLANS: 'fitTrainPro_mealPlans',
  MEAL_LOGS: 'fitTrainPro_mealLogs',
};

// Type definitions
export interface FoodData {
  id: number;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category: string; // 'protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy', 'other'
  isPublic: boolean;
  createdBy: number; // trainer ID or system for default foods
  createdAt: string;
  updatedAt: string;
}

export interface MealData {
  id: number;
  name: string;
  description?: string;
  time?: string; // time of day, e.g. '08:00'
  foods: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealFoodItem {
  foodId: number;
  quantity: number; // number of servings
  notes?: string;
}

export interface MealPlanData {
  id: number;
  name: string;
  description?: string;
  clientId?: number; // if assigned to a specific client
  trainerId: number;
  isTemplate: boolean;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  days: MealPlanDay[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanDay {
  dayNumber: number; // 1-7 for the days of the week
  meals: MealData[];
}

export interface MealLogData {
  id: number;
  clientId: number;
  date: string;
  meals: MealData[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  compliance?: number; // percentage of compliance with meal plan (0-100)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample food data
export const SAMPLE_FOODS: FoodData[] = [
  {
    id: 1,
    name: "Chicken Breast",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: "protein",
    isPublic: true,
    createdBy: 0, // system
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Brown Rice",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8,
    category: "carb",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Avocado",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    category: "fat",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Broccoli",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    fiber: 2.6,
    category: "vegetable",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Salmon",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 13,
    category: "protein",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: "Sweet Potato",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    category: "carb",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    name: "Greek Yogurt",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    category: "dairy",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    name: "Banana",
    brand: "Generic",
    servingSize: 100,
    servingUnit: "g",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12.2,
    category: "fruit",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 9,
    name: "Olive Oil",
    brand: "Generic",
    servingSize: 15,
    servingUnit: "ml",
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    category: "fat",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 10,
    name: "Egg",
    brand: "Generic",
    servingSize: 50,
    servingUnit: "g",
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fat: 5.3,
    category: "protein",
    isPublic: true,
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample meal plans
export const SAMPLE_MEAL_PLANS: MealPlanData[] = [
  {
    id: 1,
    name: "Weight Loss Plan",
    description: "A balanced plan focused on caloric deficit while maintaining adequate protein intake.",
    trainerId: 1,
    isTemplate: true,
    dailyCalories: 1800,
    dailyProtein: 135,
    dailyCarbs: 180,
    dailyFat: 60,
    days: [
      {
        dayNumber: 1,
        meals: [
          {
            id: 1,
            name: "Breakfast",
            time: "07:30",
            foods: [
              { foodId: 10, quantity: 2 }, // 2 eggs
              { foodId: 8, quantity: 1 }, // 1 banana
            ],
            totalCalories: 245,
            totalProtein: 13.7,
            totalCarbs: 24,
            totalFat: 10.9
          },
          {
            id: 2,
            name: "Lunch",
            time: "12:30",
            foods: [
              { foodId: 1, quantity: 1.5 }, // 150g chicken breast
              { foodId: 2, quantity: 1 }, // 100g brown rice
              { foodId: 4, quantity: 1 } // 100g broccoli
            ],
            totalCalories: 394,
            totalProtein: 49.1,
            totalCarbs: 30.6,
            totalFat: 5.8
          },
          {
            id: 3,
            name: "Dinner",
            time: "18:30",
            foods: [
              { foodId: 5, quantity: 1 }, // 100g salmon
              { foodId: 6, quantity: 1.5 }, // 150g sweet potato
              { foodId: 3, quantity: 0.5 } // 50g avocado
            ],
            totalCalories: 395,
            totalProtein: 24.6,
            totalCarbs: 30,
            totalFat: 20.35
          }
        ]
      },
      // More days would be defined here
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get foods from local storage
export function getFoodsFromStorage(): FoodData[] {
  const storedFoods = localStorage.getItem(NUTRITION_STORAGE_KEYS.FOODS);
  return storedFoods ? JSON.parse(storedFoods) : [];
}

// Save foods to local storage
export function saveFoodsToStorage(foods: FoodData[]): void {
  localStorage.setItem(NUTRITION_STORAGE_KEYS.FOODS, JSON.stringify(foods));
}

// Add a new food to storage
export function addFoodToStorage(food: Omit<FoodData, 'id'>): FoodData {
  const foods = getFoodsFromStorage();
  // Generate a new ID (max id + 1)
  const newId = foods.length > 0 
    ? Math.max(...foods.map(f => f.id)) + 1 
    : 1;
  
  const newFood = {
    ...food,
    id: newId,
  } as FoodData;
  
  foods.push(newFood);
  saveFoodsToStorage(foods);
  
  return newFood;
}

// Get meal plans from local storage
export function getMealPlansFromStorage(): MealPlanData[] {
  const storedMealPlans = localStorage.getItem(NUTRITION_STORAGE_KEYS.MEAL_PLANS);
  return storedMealPlans ? JSON.parse(storedMealPlans) : [];
}

// Save meal plans to local storage
export function saveMealPlansToStorage(mealPlans: MealPlanData[]): void {
  localStorage.setItem(NUTRITION_STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
}

// Add a new meal plan to storage
export function addMealPlanToStorage(mealPlan: Omit<MealPlanData, 'id'>): MealPlanData {
  const mealPlans = getMealPlansFromStorage();
  // Generate a new ID (max id + 1)
  const newId = mealPlans.length > 0 
    ? Math.max(...mealPlans.map(mp => mp.id)) + 1 
    : 1;
  
  const newMealPlan = {
    ...mealPlan,
    id: newId,
  } as MealPlanData;
  
  mealPlans.push(newMealPlan);
  saveMealPlansToStorage(mealPlans);
  
  return newMealPlan;
}

// Get meal logs from local storage
export function getMealLogsFromStorage(): MealLogData[] {
  const storedMealLogs = localStorage.getItem(NUTRITION_STORAGE_KEYS.MEAL_LOGS);
  return storedMealLogs ? JSON.parse(storedMealLogs) : [];
}

// Save meal logs to local storage
export function saveMealLogsToStorage(mealLogs: MealLogData[]): void {
  localStorage.setItem(NUTRITION_STORAGE_KEYS.MEAL_LOGS, JSON.stringify(mealLogs));
}

// Add a new meal log to storage
export function addMealLogToStorage(mealLog: Omit<MealLogData, 'id'>): MealLogData {
  const mealLogs = getMealLogsFromStorage();
  // Generate a new ID (max id + 1)
  const newId = mealLogs.length > 0 
    ? Math.max(...mealLogs.map(ml => ml.id)) + 1 
    : 1;
  
  const newMealLog = {
    ...mealLog,
    id: newId,
  } as MealLogData;
  
  mealLogs.push(newMealLog);
  saveMealLogsToStorage(mealLogs);
  
  return newMealLog;
}

// Initialize storage with sample data
export function initializeNutritionStorage(): void {
  const foods = getFoodsFromStorage();
  if (foods.length === 0) {
    saveFoodsToStorage(SAMPLE_FOODS);
  }
  
  const mealPlans = getMealPlansFromStorage();
  if (mealPlans.length === 0) {
    saveMealPlansToStorage(SAMPLE_MEAL_PLANS);
  }
}

/**
 * Calculate precise calories based on macronutrient content
 * Protein: 4 calories per gram
 * Carbs: 4 calories per gram (except fiber)
 * Fiber: 2 calories per gram
 * Fat: 9 calories per gram
 */
export function calculateCaloriesFromMacros(protein: number, carbs: number, fat: number, fiber: number = 0): number {
  // Calculate net carbs (total carbs minus fiber)
  const netCarbs = Math.max(0, carbs - fiber);
  
  // Calculate calories using the specific calorie values for each macronutrient
  const proteinCalories = protein * 4;
  const netCarbCalories = netCarbs * 4;
  const fiberCalories = fiber * 2; // Fiber contributes 2 calories per gram
  const fatCalories = fat * 9;
  
  // Return the sum of all calories
  return proteinCalories + netCarbCalories + fiberCalories + fatCalories;
}

// Calculate calories and macros for a meal
export function calculateMealNutrition(mealFoods: MealFoodItem[], foodsData: FoodData[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const totals = mealFoods.reduce((totals, item) => {
    const food = foodsData.find(f => f.id === item.foodId);
    if (!food) return totals;
    
    // Extract fiber content, defaulting to 0 if not provided
    const foodFiber = food.fiber || 0;
    const itemFiber = foodFiber * item.quantity;
    
    return {
      protein: totals.protein + (food.protein * item.quantity),
      carbs: totals.carbs + (food.carbs * item.quantity),
      fat: totals.fat + (food.fat * item.quantity),
      fiber: totals.fiber + itemFiber
    };
  }, { protein: 0, carbs: 0, fat: 0, fiber: 0 });
  
  // Calculate calories using our precise formula
  const calories = calculateCaloriesFromMacros(
    totals.protein,
    totals.carbs,
    totals.fat,
    totals.fiber
  );
  
  return {
    calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    fiber: totals.fiber
  };
}

// Calculate recommended calories based on client data
export function calculateCalorieNeeds(
  weight: number, // in kg
  height: number, // in cm
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  goal: 'maintain' | 'lose' | 'gain',
  bodyComposition: 'below_average' | 'average' | 'lean' | 'very_lean' = 'average', // Default to average if not provided
  fatPercentage: '20' | '25' | '30' | '35' = '25' // Default to 25% if not provided
): {
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number;
  protein: number; // in grams
  fat: number; // in grams
  carbs: number; // in grams
} {
  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    very_active: 1.9 // Very hard exercise & physical job or 2x training
  };
  
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
  
  // Adjust based on goal
  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.round(tdee * 0.8); // 20% deficit
  } else if (goal === 'gain') {
    targetCalories = Math.round(tdee * 1.1); // 10% surplus
  }
  
  // Calculate protein based on body composition and goal per client request
  // Updated protein factors based on user specifications
  let proteinFactor: number;
  
  if (bodyComposition === 'very_lean') {
    // Higher protein needs for very lean individuals (2.8g/kg)
    proteinFactor = goal === 'gain' ? 3.0 : 2.8;
  } else if (bodyComposition === 'lean') {
    // Moderately high protein for lean individuals (2.4g/kg)
    proteinFactor = goal === 'gain' ? 2.6 : 2.4;
  } else if (bodyComposition === 'average') {
    // Standard protein for average body composition (2.0g/kg)
    proteinFactor = goal === 'gain' ? 2.2 : 2.0;
  } else { // below_average
    // Lower protein for below average body composition (1.7g/kg)
    proteinFactor = goal === 'gain' ? 1.9 : 1.7;
  }
  
  const protein = Math.round(weight * proteinFactor);
  
  // Fat: User-specified percentage of calories
  const fatPercent = parseInt(fatPercentage) / 100;
  
  const fat = Math.round((targetCalories * fatPercent) / 9); // 9 calories per gram
  
  // Remaining calories from carbs
  const proteinCalories = protein * 4; // 4 calories per gram
  const fatCalories = fat * 9; // 9 calories per gram
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4); // 4 calories per gram
  
  return {
    tdee,
    targetCalories,
    protein,
    fat,
    carbs
  };
}