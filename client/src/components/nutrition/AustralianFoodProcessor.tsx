import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, Check, X, File, Info } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AustralianFoodProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetPreview, setSheetPreview] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setSelectedSheet(null);
      setSheetPreview(null);
    }
  };

  // Analyze the Excel file to find available sheets
  const analyzeExcel = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file");
          
          // Parse Excel file
          const workbook = XLSX.read(data, { type: 'binary' });
          
          if (workbook.SheetNames.length === 0) {
            throw new Error("Excel file doesn't contain any sheets");
          }
          
          // Get a preview of each sheet
          const sheetPreviews = {};
          
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const preview = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              range: 0,
              defval: ""
            });
            
            // Only keep first 10 rows for preview
            sheetPreviews[sheetName] = preview.slice(0, 10);
          }
          
          setSheetPreview(sheetPreviews);
          setSelectedSheet(workbook.SheetNames[0]);
          
          toast({
            title: "File Analyzed",
            description: `Found ${workbook.SheetNames.length} sheets in the Excel file.`,
            variant: "default"
          });
        } catch (error) {
          console.error('Error analyzing Excel file:', error);
          toast({
            title: "Analysis Failed",
            description: error.message || "Failed to analyze Excel file.",
            variant: "destructive"
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File Reading Failed",
          description: "Failed to read the Excel file. Please try again.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error analyzing file:', error);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the Excel file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Process the Australian Food Composition data
  const processFood = async () => {
    if (!file || !selectedSheet) {
      toast({
        title: "Selection Required",
        description: "Please select a file and sheet to process.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file");
          
          // Parse Excel file
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[selectedSheet];
          
          // First get all rows as arrays
          const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          console.log("Total rows:", allRows.length);
          console.log("First few rows:", allRows.slice(0, 10));
          
          // Try to find rows with nutrient headers
          let headerRow = null;
          let headerIndex = -1;
          
          // Common headers in Australian food database
          const keyHeaderTerms = [
            'food name', 'energy', 'protein', 'fat', 'carbohydrate', 
            'dietary fibre', 'sodium'
          ];
          
          // Find header row by looking for common nutrient names
          for (let i = 0; i < Math.min(20, allRows.length); i++) {
            const row = allRows[i];
            if (!row || row.length === 0) continue;
            
            // Convert row to lowercase strings for comparison
            const rowText = row.map(cell => 
              cell && typeof cell === 'string' ? cell.toLowerCase() : ''
            ).join(' ');
            
            // Check how many key terms are in this row
            const matchCount = keyHeaderTerms.filter(term => 
              rowText.includes(term.toLowerCase())
            ).length;
            
            // If we find at least 3 key terms, consider this a header row
            if (matchCount >= 3) {
              headerRow = row;
              headerIndex = i;
              break;
            }
          }
          
          if (!headerRow) {
            // If no header found, try to find any row with "energy" and "protein"
            for (let i = 0; i < Math.min(30, allRows.length); i++) {
              const row = allRows[i];
              if (!row || row.length === 0) continue;
              
              const rowStr = row.map(cell => 
                cell ? cell.toString().toLowerCase() : ''
              ).join(' ');
              
              if (rowStr.includes('energy') && rowStr.includes('protein')) {
                headerRow = row;
                headerIndex = i;
                break;
              }
            }
          }
          
          if (!headerRow) {
            throw new Error("Could not find a header row with nutritional information");
          }
          
          console.log("Found header row at index", headerIndex, ":", headerRow);
          
          // Create a map of column indices for nutrients
          const columnMap = {};
          
          // Map column names to indices
          headerRow.forEach((header, index) => {
            if (!header) return;
            
            const headerText = header.toString().toLowerCase();
            
            // Food name or description
            if (headerText.includes('food') || headerText.includes('description') || 
                headerText.includes('name') || headerText.includes('item')) {
              columnMap.foodName = index;
            }
            
            // Food group or category
            if (headerText.includes('group') || headerText.includes('category') || 
                headerText.includes('type')) {
              columnMap.category = index;
            }
            
            // Energy (in kJ typically for Australian data)
            if (headerText.includes('energy')) {
              columnMap.energy = index;
            }
            
            // Protein
            if (headerText.includes('protein')) {
              columnMap.protein = index;
            }
            
            // Carbohydrates
            if (headerText.includes('carbohydrate') || headerText.includes('carbs')) {
              columnMap.carbs = index;
            }
            
            // Fat
            if (headerText.includes('fat') && !headerText.includes('saturated')) {
              columnMap.fat = index;
            }
            
            // Fiber
            if (headerText.includes('fibre') || headerText.includes('fiber')) {
              columnMap.fiber = index;
            }
            
            // Sugar
            if (headerText.includes('sugar')) {
              columnMap.sugar = index;
            }
            
            // Sodium
            if (headerText.includes('sodium')) {
              columnMap.sodium = index;
            }
          });
          
          // Check if we found essential columns
          if (!columnMap.foodName) {
            throw new Error("Could not find a column for food names");
          }
          
          if (!columnMap.energy && !columnMap.protein && !columnMap.carbs && !columnMap.fat) {
            throw new Error("Could not find any columns for nutritional data");
          }
          
          console.log("Column mapping:", columnMap);
          
          // Process all data rows after the header
          const processedFoods = [];
          
          for (let i = headerIndex + 1; i < allRows.length; i++) {
            const row = allRows[i];
            if (!row || row.length === 0) continue;
            
            // Skip rows without a food name
            const foodName = row[columnMap.foodName];
            if (!foodName) continue;
            
            // Extract nutrient values with safe parsing
            const getNumber = (columnIndex) => {
              if (columnIndex === undefined) return 0;
              const value = row[columnIndex];
              if (value === undefined || value === null || value === '') return 0;
              const num = parseFloat(value);
              return isNaN(num) ? 0 : num;
            };
            
            // Get the food category if available
            let category = 'other';
            if (columnMap.category) {
              const categoryText = row[columnMap.category]?.toString()?.toLowerCase() || '';
              category = mapToFoodCategory(categoryText);
            }
            
            // Get energy and convert from kJ to kcal if needed
            let calories = 0;
            if (columnMap.energy) {
              const energyValue = getNumber(columnMap.energy);
              // If energy is higher than 100, it's likely in kJ (common in Australian data)
              calories = energyValue > 100 ? energyValue / 4.184 : energyValue;
            }
            
            // Create food object
            const food = {
              name: foodName.toString(),
              brand: 'NUTTAB',
              category,
              servingSize: 100,
              servingUnit: 'g',
              calories: Math.round(calories * 10) / 10, // Round to 1 decimal place
              protein: Math.round(getNumber(columnMap.protein) * 10) / 10,
              carbs: Math.round(getNumber(columnMap.carbs) * 10) / 10,
              fat: Math.round(getNumber(columnMap.fat) * 10) / 10,
              fiber: Math.round(getNumber(columnMap.fiber) * 10) / 10,
              sugar: Math.round(getNumber(columnMap.sugar) * 10) / 10,
              sodium: Math.round(getNumber(columnMap.sodium)),
              isPublic: true
            };
            
            processedFoods.push(food);
          }
          
          console.log(`Processed ${processedFoods.length} foods`);
          
          if (processedFoods.length === 0) {
            throw new Error("No valid food data found after processing");
          }
          
          // Save to database
          try {
            const response = await axios.post('/api/foods/batch', {
              foods: processedFoods
            });
            
            setResults({
              success: true,
              message: "Successfully imported foods from Australian Food Composition Database",
              totalProcessed: processedFoods.length,
              foods: processedFoods.slice(0, 10) // Show first 10 as examples
            });
            
            // Invalidate food cache
            queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
            
            toast({
              title: "Import Successful",
              description: `Successfully imported ${processedFoods.length} foods from the database.`,
              variant: "default"
            });
          } catch (error) {
            console.error('Error saving foods to database:', error);
            
            setResults({
              success: false,
              message: "Failed to save foods to database. Please try again.",
              totalProcessed: processedFoods.length,
              foods: processedFoods.slice(0, 10)
            });
            
            toast({
              title: "Database Error",
              description: "The foods were processed but couldn't be saved to the database.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing food data:', error);
          setResults({
            success: false,
            message: error.message || "Failed to process food data",
            totalProcessed: 0,
            foods: []
          });
          
          toast({
            title: "Processing Failed",
            description: error.message || "Failed to process food data. Please check the file format.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File Reading Failed",
          description: "Failed to read the Excel file. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setIsProcessing(false);
      
      toast({
        title: "Processing Failed",
        description: "Failed to process the Excel file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Map food category based on text
  const mapToFoodCategory = (categoryText: string): string => {
    if (!categoryText) return 'other';
    
    const categoryMap: Record<string, string> = {
      'meat': 'protein',
      'poultry': 'protein',
      'chicken': 'protein',
      'beef': 'protein',
      'lamb': 'protein',
      'pork': 'protein', 
      'fish': 'protein',
      'seafood': 'protein',
      'egg': 'protein',
      'legume': 'protein',
      'grain': 'carbs',
      'bread': 'carbs',
      'cereal': 'carbs',
      'rice': 'carbs',
      'pasta': 'carbs',
      'potato': 'carbs',
      'fruit': 'fruit',
      'vegetable': 'vegetable',
      'veg': 'vegetable',
      'dairy': 'dairy',
      'milk': 'dairy',
      'cheese': 'dairy',
      'yoghurt': 'dairy',
      'yogurt': 'dairy',
      'nut': 'nuts',
      'seed': 'seeds',
      'oil': 'fat',
      'butter': 'fat',
      'margarine': 'fat'
    };
    
    // Try to match category
    for (const [key, value] of Object.entries(categoryMap)) {
      if (categoryText.includes(key)) {
        return value;
      }
    }
    
    return 'other';
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setSelectedSheet(null);
    setSheetPreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
          Australian Food Database Processor
        </CardTitle>
        <CardDescription>
          Import nutritional data from the Australian Food Composition Database (NUTTAB) Excel files
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!results && !sheetPreview && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!file ? (
              <div className="py-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">Choose an Excel file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an Australian Food Composition Database Excel file (.xlsx, .xls)
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('excel-file')?.click()}
                >
                  Select File
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="p-2 rounded-md bg-muted">
                    <File className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={reset}
                    disabled={isAnalyzing}
                  >
                    Change File
                  </Button>
                  <Button 
                    onClick={analyzeExcel}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Info className="mr-2 h-4 w-4" />
                        Analyze File
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {sheetPreview && !results && (
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-md font-medium mb-2">Select Sheet to Process</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.keys(sheetPreview).map((sheetName) => (
                  <Button
                    key={sheetName}
                    variant={selectedSheet === sheetName ? "default" : "outline"}
                    onClick={() => setSelectedSheet(sheetName)}
                    className="justify-start"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {sheetName}
                  </Button>
                ))}
              </div>
              
              {selectedSheet && (
                <Accordion type="single" collapsible defaultValue="preview">
                  <AccordionItem value="preview">
                    <AccordionTrigger>Data Preview</AccordionTrigger>
                    <AccordionContent>
                      <div className="max-h-80 overflow-auto">
                        <table className="w-full text-sm border-collapse">
                          <tbody>
                            {sheetPreview[selectedSheet].map((row, rowIndex) => (
                              <tr key={rowIndex} className={rowIndex === 0 ? "bg-muted font-medium" : ""}>
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="border px-2 py-1 truncate max-w-[200px]">
                                    {cell?.toString() || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={reset}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button 
                onClick={processFood}
                disabled={isProcessing || !selectedSheet}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process Nutrition Data
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {results && results.success && (
          <div className="space-y-4">
            <Alert>
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Import Successful</AlertTitle>
              <AlertDescription>
                Successfully imported {results.totalProcessed} foods from the Australian Food Database
              </AlertDescription>
            </Alert>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Sample Imported Foods:</h4>
              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] bg-muted p-2 gap-4 text-sm font-medium">
                  <div>Food Name</div>
                  <div>Protein</div>
                  <div>Carbs</div>
                  <div>Fat</div>
                </div>
                <div className="divide-y">
                  {results.foods.map((food, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] p-2 gap-4 text-sm">
                      <div>{food.name}</div>
                      <div>{food.protein}g</div>
                      <div>{food.carbs}g</div>
                      <div>{food.fat}g</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={reset}>
              Import Another File
            </Button>
          </div>
        )}
        
        {results && !results.success && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>
                {results.message || "Failed to process the Excel file"}
              </AlertDescription>
            </Alert>
            
            <Button variant="outline" size="sm" onClick={reset}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <p>
          This processor is optimized for the Australian Food Composition Database format.
          It will automatically identify column headers and handle the kJ to kcal conversion
          common in Australian nutrition data.
        </p>
      </CardFooter>
    </Card>
  );
}