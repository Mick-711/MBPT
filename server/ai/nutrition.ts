import OpenAI from "openai";

// Define FoodData interface since it's not exported from the schema
interface FoodData {
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

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealRecommendation {
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
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlanRecommendation {
  meals: MealRecommendation[];
  dailyTotals: MacroTarget;
}

export interface AIGeneratedMealPlan {
  breakfast: MealRecommendation;
  lunch: MealRecommendation;
  dinner: MealRecommendation;
  snacks?: MealRecommendation;
  dailyTotals: MacroTarget;
}

/**
 * Generate meal recommendations based on macro targets and available foods
 */
export async function generateMealRecommendations(
  macroTargets: MacroTarget,
  availableFoods: FoodData[],
  preferences: {
    dietaryRestrictions?: string[];
    preferredFoods?: string[];
    excludedFoods?: string[];
    mealCount?: number;
  } = {}
): Promise<AIGeneratedMealPlan> {
  try {
    const mealCount = preferences.mealCount || 3;
    
    // Create the system prompt
    const systemPrompt = `
You are a professional nutrition coach helping to create a personalized meal plan.
Your task is to create a balanced meal plan that hits the macro targets while using foods from the provided list.
Follow these guidelines:
1. Use ONLY foods from the provided food list
2. The meal plan should closely match the daily macro targets
3. Create ${mealCount} meals: breakfast, lunch, dinner${mealCount > 3 ? ', and snacks' : ''}
4. For each meal, specify the exact quantity of each food (in the food's serving unit)
5. Calculate accurate macros for each meal based on the quantities and food nutritional data
6. The sum of all meals' macros should be within 5% of the daily targets
7. Consider any dietary restrictions or preferences provided
8. Focus on creating balanced, realistic meal combinations

Respond with a JSON object following this exact format (nothing else):
{
  "breakfast": {
    "mealName": "Breakfast",
    "foods": [
      {
        "name": "Food Name",
        "quantity": 1.5,
        "servingUnit": "g/ml/oz",
        "calories": 100,
        "protein": 20,
        "carbs": 10,
        "fat": 5
      }
    ],
    "totalMacros": {
      "calories": 300,
      "protein": 30,
      "carbs": 20,
      "fat": 10
    }
  },
  "lunch": { ... },
  "dinner": { ... },
  ${mealCount > 3 ? '"snacks": { ... },' : ''}
  "dailyTotals": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fat": 60
  }
}`;

    // Create the user prompt with macro targets and available foods
    const userPrompt = `
Daily Macro Targets:
- Calories: ${macroTargets.calories} kcal
- Protein: ${macroTargets.protein}g
- Carbs: ${macroTargets.carbs}g
- Fat: ${macroTargets.fat}g

${preferences.dietaryRestrictions && preferences.dietaryRestrictions.length ? `Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ')}` : ''}
${preferences.preferredFoods && preferences.preferredFoods.length ? `Preferred Foods: ${preferences.preferredFoods.join(', ')}` : ''}
${preferences.excludedFoods && preferences.excludedFoods.length ? `Excluded Foods: ${preferences.excludedFoods.join(', ')}` : ''}

Available Foods List:
${availableFoods.map(food => 
  `- ${food.name}: ${food.servingSize}${food.servingUnit}, Calories: ${food.calories}kcal, Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fat: ${food.fat}g`
).join('\n')}

Please create a meal plan that matches these requirements.`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in AI response");
    }
    const result = JSON.parse(content) as AIGeneratedMealPlan;
    return result;
  } catch (error: any) {
    console.error("Error generating meal recommendations:", error);
    throw new Error(`Failed to generate meal recommendations: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Generate food suggestions based on macro targets
 */
export async function generateFoodSuggestions(
  macroTargets: MacroTarget,
  preferences: {
    dietaryRestrictions?: string[];
    preferredFoods?: string[];
    excludedFoods?: string[];
  } = {}
): Promise<{ [category: string]: Array<{ name: string, servingSize: string, macros: MacroTarget }> }> {
  try {
    // Create the system prompt
    const systemPrompt = `
You are a professional nutrition coach helping to suggest foods for a meal plan.
Your task is to recommend foods that would help meet the provided macro targets.
Follow these guidelines:
1. Suggest 5-8 foods for each category: protein, carbs, fats, and vegetables
2. For each food, provide a typical serving size and its macro content
3. Consider any dietary restrictions or preferences provided
4. Focus on whole, nutritious foods that are commonly available
5. Include a good variety of options within each category

Respond with a JSON object following this exact format (nothing else):
{
  "protein": [
    {
      "name": "Chicken Breast",
      "servingSize": "100g",
      "macros": {
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6
      }
    }
  ],
  "carbs": [ ... ],
  "fats": [ ... ],
  "vegetables": [ ... ]
}`;

    // Create the user prompt with macro targets
    const userPrompt = `
Daily Macro Targets:
- Calories: ${macroTargets.calories} kcal
- Protein: ${macroTargets.protein}g
- Carbs: ${macroTargets.carbs}g
- Fat: ${macroTargets.fat}g

${preferences.dietaryRestrictions?.length ? `Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ')}` : ''}
${preferences.preferredFoods?.length ? `Preferred Foods: ${preferences.preferredFoods.join(', ')}` : ''}
${preferences.excludedFoods?.length ? `Excluded Foods: ${preferences.excludedFoods.join(', ')}` : ''}

Please suggest foods that would be good to include in a meal plan with these macro targets.`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in AI response");
    }
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error("Error generating food suggestions:", error);
    throw new Error(`Failed to generate food suggestions: ${error?.message || "Unknown error"}`);
  }
}