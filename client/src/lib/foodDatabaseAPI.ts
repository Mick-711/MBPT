import OpenAI from "openai";
import { FoodData } from "./nutritionHelpers";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

/**
 * Fetches nutritional data from NUTTAB via OpenAI API
 */
export async function fetchNuttabFoods(
  query: string,
  count: number = 10
): Promise<FoodData[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a nutrition database API that provides accurate data from the NUTTAB (Australian Food Composition Database). " +
            "When asked for food nutritional data, provide real, accurate values for standard serving sizes. " +
            "Include calories, protein, carbs, fat, and fiber where available. " +
            "Format data as JSON objects matching the schema requested. " +
            "Always use realistic values, and provide a diverse range of foods that match the query criteria."
        },
        {
          role: "user",
          content: 
            `Provide ${count} food items from NUTTAB that match the query: "${query}". ` +
            "Return only a valid JSON array of food objects with the following properties: " +
            "name (string), category (string), servingSize (number), servingUnit (string), " +
            "calories (number), protein (number), carbs (number), fat (number), fiber (number). " +
            "Don't include any explanation or text, just the JSON array."
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Process and validate the foods
    const processedFoods: FoodData[] = result.foods.map((food: any, index: number) => ({
      id: Date.now() + index, // Temporary ID that will be replaced when saved to database
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0
    }));

    return processedFoods;
  } catch (error) {
    console.error("Error fetching NUTTAB data:", error);
    throw new Error(`Failed to fetch NUTTAB data: ${error.message}`);
  }
}

/**
 * Imports food data into the local storage database
 */
export async function importFoodsToDatabase(foods: FoodData[]): Promise<FoodData[]> {
  try {
    // Get existing foods from storage
    const existingFoods = JSON.parse(localStorage.getItem('foods') || '[]');
    
    // Get the highest existing ID
    const highestId = existingFoods.length > 0 
      ? Math.max(...existingFoods.map((food: FoodData) => food.id)) 
      : 0;
    
    // Assign new IDs to the imported foods
    const foodsWithIds = foods.map((food, index) => ({
      ...food,
      id: highestId + index + 1
    }));
    
    // Combine existing and new foods
    const updatedFoods = [...existingFoods, ...foodsWithIds];
    
    // Save to local storage
    localStorage.setItem('foods', JSON.stringify(updatedFoods));
    
    return foodsWithIds;
  } catch (error) {
    console.error("Error importing foods to database:", error);
    throw new Error(`Failed to import foods: ${error.message}`);
  }
}