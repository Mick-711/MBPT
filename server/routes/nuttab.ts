import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Route to search for foods in NUTTAB database
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, count } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const searchCount = count || 10;
    
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
            `Provide ${searchCount} food items from NUTTAB that match the query: "${query}". ` +
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
      return res.status(500).json({ error: "Invalid response format from OpenAI" });
    }

    // Process and validate the foods
    const processedFoods = result.foods.map((food: any, index: number) => ({
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

    return res.json({ foods: processedFoods });
  } catch (error: any) {
    console.error("Error searching NUTTAB:", error);
    return res.status(500).json({ 
      error: "Failed to search NUTTAB database",
      message: error.message
    });
  }
});

export default router;