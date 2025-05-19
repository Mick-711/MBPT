import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// Create a directory for data if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Sample food data - structure matches our database schema
const foodItems = [
  {
    name: "Chicken Breast",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    cholesterol: 85,
    brand: "",
    tags: "lean,meat,poultry"
  },
  {
    name: "Salmon",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    cholesterol: 55,
    brand: "",
    tags: "fish,omega3,seafood"
  },
  {
    name: "Brown Rice",
    category: "carbs",
    servingSize: 100,
    servingUnit: "g",
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 5,
    cholesterol: 0,
    brand: "",
    tags: "whole grain,complex carbs"
  },
  {
    name: "Sweet Potato",
    category: "carbs",
    servingSize: 100,
    servingUnit: "g",
    calories: 86,
    protein: 1.6,
    carbs: 20.1,
    fat: 0.1,
    fiber: 3,
    sugar: 4.2,
    sodium: 55,
    cholesterol: 0,
    brand: "",
    tags: "vegetable,complex carbs"
  },
  {
    name: "Avocado",
    category: "fat",
    servingSize: 100,
    servingUnit: "g",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    sugar: 0.7,
    sodium: 7,
    cholesterol: 0,
    brand: "",
    tags: "healthy fat,fruit"
  },
  {
    name: "Olive Oil",
    category: "fat",
    servingSize: 15,
    servingUnit: "ml",
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    brand: "",
    tags: "cooking oil,healthy fat"
  },
  {
    name: "Egg Whites",
    category: "protein",
    servingSize: 100,
    servingUnit: "g",
    calories: 52,
    protein: 10.9,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0,
    sugar: 0.7,
    sodium: 166,
    cholesterol: 0,
    brand: "",
    tags: "low fat,high protein"
  },
  {
    name: "Greek Yogurt",
    category: "dairy",
    servingSize: 100,
    servingUnit: "g",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    sugar: 3.6,
    sodium: 36,
    cholesterol: 5,
    brand: "Generic",
    tags: "probiotic,breakfast"
  },
  {
    name: "Spinach",
    category: "vegetable",
    servingSize: 100,
    servingUnit: "g",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    sodium: 79,
    cholesterol: 0,
    brand: "",
    tags: "leafy green,iron"
  },
  {
    name: "Blueberries",
    category: "fruit",
    servingSize: 100,
    servingUnit: "g",
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    cholesterol: 0,
    brand: "",
    tags: "antioxidant,berry"
  }
];

// Create a new workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(foodItems);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Foods");

// Write the workbook to a file
const outputPath = path.join(dataDir, "food_items.xlsx");
XLSX.writeFile(workbook, outputPath);

console.log(`Sample food data created at: ${outputPath}`);
console.log(`Created with ${foodItems.length} sample food items`);