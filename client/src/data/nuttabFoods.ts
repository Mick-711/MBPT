import { FoodData } from "@/lib/nutritionHelpers";

// Create a simplified FoodData type for NUTTAB imports that matches our needs
export interface NuttabFoodData {
  id: number;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  brand?: string;
  sugar?: number;
  sodium?: number;
}

// Convert NuttabFoodData to full FoodData
export function convertToFoodData(food: NuttabFoodData): FoodData {
  return {
    ...food,
    isPublic: true,
    createdBy: 0, // system
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// This is a sample of foods from the NUTTAB database for demonstration purposes
export const nuttabFoods: NuttabFoodData[] = [
  // Proteins
  {
    id: 1001,
    name: "Beef, ground, lean",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 250,
    protein: 26.1,
    carbs: 0,
    fat: 17.2,
    fiber: 0
  },
  {
    id: 1002,
    name: "Chicken breast, skinless",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0
  },
  {
    id: 1003,
    name: "Salmon, Atlantic, raw",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 206,
    protein: 22.1,
    carbs: 0,
    fat: 13.4,
    fiber: 0
  },
  {
    id: 1004,
    name: "Tuna, canned in water",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 116,
    protein: 25.5,
    carbs: 0,
    fat: 1,
    fiber: 0
  },
  {
    id: 1005,
    name: "Lentils, cooked",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 116,
    protein: 9.0,
    carbs: 20.1,
    fat: 0.4,
    fiber: 7.9
  },
  {
    id: 1006,
    name: "Tofu, firm",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 144,
    protein: 17.3,
    carbs: 2.8,
    fat: 8.7,
    fiber: 2.3
  },
  
  // Carbohydrates
  {
    id: 2001,
    name: "Rice, brown, cooked",
    category: "carbs",
    servingSize: 100,
    servingUnit: "g",
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8
  },
  {
    id: 2002,
    name: "Sweet potato, baked",
    category: "carbs",
    servingSize: 100,
    servingUnit: "g",
    calories: 90,
    protein: 2,
    carbs: 20.7,
    fat: 0.2,
    fiber: 3.3
  },
  {
    id: 2003,
    name: "Quinoa, cooked",
    category: "carbs",
    servingSize: 100,
    servingUnit: "g",
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    fiber: 2.8
  },
  {
    id: 2004,
    name: "Oats, rolled",
    category: "carbs",
    servingSize: 100,
    servingUnit: "g",
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    fiber: 10.6
  },
  {
    id: 2005,
    name: "Bread, whole grain",
    category: "carbs",
    servingSize: 40,
    servingUnit: "g",
    calories: 95,
    protein: 4.7,
    carbs: 17.8,
    fat: 1.2,
    fiber: 2.4
  },
  
  // Vegetables
  {
    id: 3001,
    name: "Broccoli, raw",
    category: "vegetable",
    servingSize: 100,
    servingUnit: "g",
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    fiber: 2.6
  },
  {
    id: 3002,
    name: "Spinach, raw",
    category: "vegetable",
    servingSize: 100,
    servingUnit: "g",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2
  },
  {
    id: 3003,
    name: "Kale, raw",
    category: "vegetable",
    servingSize: 100,
    servingUnit: "g",
    calories: 49,
    protein: 4.3,
    carbs: 8.8,
    fat: 0.9,
    fiber: 3.6
  },
  {
    id: 3004,
    name: "Carrot, raw",
    category: "vegetable",
    servingSize: 100,
    servingUnit: "g",
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8
  },
  {
    id: 3005,
    name: "Bell pepper, red, raw",
    category: "vegetable",
    servingSize: 100,
    servingUnit: "g",
    calories: 31,
    protein: 1,
    carbs: 6.3,
    fat: 0.3,
    fiber: 2.1
  },
  
  // Fruits
  {
    id: 4001,
    name: "Apple, with skin",
    category: "fruit",
    servingSize: 100,
    servingUnit: "g",
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4
  },
  {
    id: 4002,
    name: "Banana, raw",
    category: "fruit",
    servingSize: 100,
    servingUnit: "g",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6
  },
  {
    id: 4003,
    name: "Blueberries, raw",
    category: "fruit",
    servingSize: 100,
    servingUnit: "g",
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    fiber: 2.4
  },
  {
    id: 4004,
    name: "Strawberries, raw",
    category: "fruit",
    servingSize: 100,
    servingUnit: "g",
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2
  },
  {
    id: 4005,
    name: "Avocado, raw",
    category: "fruit",
    servingSize: 100,
    servingUnit: "g",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7
  },
  
  // Dairy
  {
    id: 5001,
    name: "Greek yogurt, plain, non-fat",
    category: "dairy",
    servingSize: 100,
    servingUnit: "g",
    calories: 59,
    protein: 10.2,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0
  },
  {
    id: 5002,
    name: "Milk, low-fat, 1%",
    category: "dairy",
    servingSize: 100,
    servingUnit: "ml",
    calories: 42,
    protein: 3.4,
    carbs: 5,
    fat: 1,
    fiber: 0
  },
  {
    id: 5003,
    name: "Cheese, cheddar",
    category: "dairy",
    servingSize: 28,
    servingUnit: "g",
    calories: 115,
    protein: 7.1,
    carbs: 0.4,
    fat: 9.4,
    fiber: 0
  },
  
  // Nuts and seeds
  {
    id: 6001,
    name: "Almonds, raw",
    category: "nuts",
    servingSize: 28,
    servingUnit: "g",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5
  },
  {
    id: 6002,
    name: "Chia seeds",
    category: "seeds",
    servingSize: 28,
    servingUnit: "g",
    calories: 137,
    protein: 4.4,
    carbs: 12.3,
    fat: 8.6,
    fiber: 10.6
  },
  {
    id: 6003,
    name: "Walnuts, raw",
    category: "nuts",
    servingSize: 28,
    servingUnit: "g",
    calories: 185,
    protein: 4.3,
    carbs: 3.9,
    fat: 18.5,
    fiber: 1.9
  },
  
  // Oils and fats
  {
    id: 7001,
    name: "Olive oil, extra virgin",
    category: "fat",
    servingSize: 15,
    servingUnit: "ml",
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    fiber: 0
  },
  {
    id: 7002,
    name: "Coconut oil",
    category: "fat",
    servingSize: 15,
    servingUnit: "ml",
    calories: 121,
    protein: 0,
    carbs: 0,
    fat: 14,
    fiber: 0
  },
  
  // Grains
  {
    id: 8001,
    name: "Pasta, whole wheat, cooked",
    category: "grains",
    servingSize: 100,
    servingUnit: "g",
    calories: 124,
    protein: 5.3,
    carbs: 26.5,
    fat: 0.9,
    fiber: 3.2
  },
  {
    id: 8002,
    name: "Barley, pearled, cooked",
    category: "grains",
    servingSize: 100,
    servingUnit: "g",
    calories: 123,
    protein: 2.3,
    carbs: 28.2,
    fat: 0.4,
    fiber: 3.8
  }
];

// Function to search NUTTAB foods
export function searchNuttabFoods(query: string): NuttabFoodData[] {
  if (!query) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  // Search by name or category
  return nuttabFoods.filter(food => 
    food.name.toLowerCase().includes(lowercaseQuery) ||
    food.category.toLowerCase().includes(lowercaseQuery)
  );
}