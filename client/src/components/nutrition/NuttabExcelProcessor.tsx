import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, Check, X, File } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NuttabExcelProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  // Process the NUTTAB Excel file
  const handleProcessFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read the Excel file directly
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          
          // Process the file with xlsx library
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to array of arrays first to find the header row
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("First few rows:", rawRows.slice(0, 5));
          
          if (rawRows.length < 5) {
            throw new Error("Excel file must have sufficient data rows");
          }
          
          // Find the actual header row - often a few rows down in NUTTAB files
          // Look for rows that might contain column headers
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(20, rawRows.length); i++) {
            const row = rawRows[i] as any[];
            if (!row || row.length === 0) continue;
            
            // Check if this row has strings that look like headers
            const headerCandidates = [
              "food", "name", "energy", "protein", "carbohydrate", "fat", 
              "fibre", "sugar", "sodium", "cholesterol", "calcium"
            ];
            
            let headerMatches = 0;
            for (const cell of row) {
              if (!cell) continue;
              const cellStr = cell.toString().toLowerCase();
              for (const candidate of headerCandidates) {
                if (cellStr.includes(candidate)) {
                  headerMatches++;
                  break;
                }
              }
            }
            
            // If we found multiple header matches, this is likely the header row
            if (headerMatches >= 3) {
              headerRowIndex = i;
              break;
            }
          }
          
          // If we couldn't find a header row, try to use row 5 (common in many NUTTAB files)
          if (headerRowIndex === -1) {
            // Try row 5 as a fallback (0-indexed, so 4)
            headerRowIndex = 4;
            console.log("Couldn't detect header row, using row 5 as fallback");
          }
          
          const headers = rawRows[headerRowIndex] as string[];
          console.log("Using row", headerRowIndex + 1, "as headers:", headers);
          
          // Find columns for key nutritional data
          const nameIndex = findColumnIndex(headers, ['food name', 'name', 'food description', 'food']);
          const energyIndex = findColumnIndex(headers, ['energy', 'energy (kj)', 'energy, with dietary fibre']);
          const proteinIndex = findColumnIndex(headers, ['protein', 'protein (g)', 'protein, total']);
          const carbsIndex = findColumnIndex(headers, ['carbohydrate', 'carbs', 'carbohydrate (g)', 'carbohydrate, total', 'available carbohydrate']);
          const fatIndex = findColumnIndex(headers, ['fat', 'fat (g)', 'fat, total', 'total fat']);
          const fiberIndex = findColumnIndex(headers, ['fibre', 'fiber', 'dietary fibre', 'fibre (g)', 'fibre, dietary']);
          const sugarIndex = findColumnIndex(headers, ['sugar', 'sugars', 'sugars (g)', 'sugars, total']);
          const sodiumIndex = findColumnIndex(headers, ['sodium', 'sodium (mg)', 'sodium, na']);
          const categoryIndex = findColumnIndex(headers, ['food group', 'category', 'food type']);
          
          if (nameIndex === -1) {
            throw new Error("Could not find a column for food name");
          }
          
          if (energyIndex === -1 && proteinIndex === -1 && carbsIndex === -1 && fatIndex === -1) {
            throw new Error("Could not find any nutritional data columns");
          }
          
          // Process data rows - start from the row after headers
          const processedFoods = [];
          for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
            const row = rawRows[i] as any[];
            if (!row || row.length === 0) continue; // Skip empty rows
            
            // Skip rows without a name if we found a name column
            if (nameIndex !== -1 && !row[nameIndex]) continue;
            
            // Extract name
            const name = row[nameIndex]?.toString() || 'Unnamed Food';
            
            // Extract energy (converting kJ to kcal if needed)
            let calories = 0;
            if (energyIndex !== -1 && row[energyIndex]) {
              const energyValue = parseFloat(row[energyIndex]);
              if (!isNaN(energyValue)) {
                // Check if the value is likely in kJ (much higher number)
                if (energyValue > 100) {
                  calories = energyValue / 4.184; // Convert kJ to kcal
                } else {
                  calories = energyValue; // Already in kcal
                }
              }
            }
            
            // Extract other nutrients
            let protein = 0;
            if (proteinIndex !== -1 && row[proteinIndex]) {
              const val = parseFloat(row[proteinIndex]);
              if (!isNaN(val)) protein = val;
            }
            
            let carbs = 0;
            if (carbsIndex !== -1 && row[carbsIndex]) {
              const val = parseFloat(row[carbsIndex]);
              if (!isNaN(val)) carbs = val;
            }
            
            let fat = 0;
            if (fatIndex !== -1 && row[fatIndex]) {
              const val = parseFloat(row[fatIndex]);
              if (!isNaN(val)) fat = val;
            }
            
            let fiber = 0;
            if (fiberIndex !== -1 && row[fiberIndex]) {
              const val = parseFloat(row[fiberIndex]);
              if (!isNaN(val)) fiber = val;
            }
            
            let sugar = 0;
            if (sugarIndex !== -1 && row[sugarIndex]) {
              const val = parseFloat(row[sugarIndex]);
              if (!isNaN(val)) sugar = val;
            }
            
            let sodium = 0;
            if (sodiumIndex !== -1 && row[sodiumIndex]) {
              const val = parseFloat(row[sodiumIndex]);
              if (!isNaN(val)) sodium = val;
            }
            
            // Map category
            let category = 'other';
            if (categoryIndex !== -1 && row[categoryIndex]) {
              const categoryText = row[categoryIndex].toString().toLowerCase();
              category = mapToFoodCategory(categoryText);
            }
            
            // Create the food object
            const food = {
              name,
              brand: 'NUTTAB',
              category,
              servingSize: 100,
              servingUnit: 'g',
              calories: Math.round(calories * 10) / 10, // Round to 1 decimal place
              protein: Math.round(protein * 10) / 10,
              carbs: Math.round(carbs * 10) / 10,
              fat: Math.round(fat * 10) / 10,
              fiber: Math.round(fiber * 10) / 10,
              sugar: Math.round(sugar * 10) / 10,
              sodium: Math.round(sodium),
              isPublic: true
            };
            
            processedFoods.push(food);
          }
          
          console.log(`Processed ${processedFoods.length} foods`);
          
          if (processedFoods.length === 0) {
            throw new Error("No valid food data was found in the Excel file");
          }
          
          // Save to database
          try {
            const response = await axios.post('/api/foods/batch', {
              foods: processedFoods
            });
            
            setResults({
              success: true,
              message: "Successfully imported foods from NUTTAB data",
              totalProcessed: processedFoods.length,
              foods: processedFoods.slice(0, 10) // Show the first 10 as examples
            });
            
            // Invalidate food cache
            queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
            
            toast({
              title: "Import successful",
              description: `Successfully imported ${processedFoods.length} foods from the NUTTAB data.`,
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
              title: "Database error",
              description: "The foods were processed but couldn't be saved to the database.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setResults({
            success: false,
            message: error.message || "Failed to process Excel file",
            totalProcessed: 0,
            foods: []
          });
          
          toast({
            title: "Processing failed",
            description: error.message || "Failed to process Excel file. Please check the file format.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File reading failed",
          description: "Failed to read the Excel file. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
      };
      
      // Start reading the file
      reader.readAsBinaryString(file);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setIsProcessing(false);
      
      toast({
        title: "Processing failed",
        description: "Failed to process the Excel file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to find column index by possible names (case insensitive)
  const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => 
        typeof h === 'string' && h.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  };

  // Map food category
  const mapToFoodCategory = (categoryText: string): string => {
    if (!categoryText) return 'other';
    
    const categoryMap: Record<string, string> = {
      'meat': 'protein',
      'poultry': 'protein',
      'chicken': 'protein',
      'beef': 'protein',
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
          NUTTAB Excel Processor
        </CardTitle>
        <CardDescription>
          Import nutritional data from NUTTAB Excel spreadsheets
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!results && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!file ? (
              <div className="py-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">Choose a file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an Excel file (.xlsx, .xls) or CSV containing NUTTAB nutrition data
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
                    disabled={isProcessing}
                  >
                    Change File
                  </Button>
                  <Button 
                    onClick={handleProcessFile}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Process NUTTAB Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {results && results.success && (
          <div className="space-y-4">
            <Alert>
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Import Successful</AlertTitle>
              <AlertDescription>
                Successfully imported {results.totalProcessed} foods from the NUTTAB data
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
                  {results.foods.map((food: any, index: number) => (
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
          Designed specifically for NUTTAB data format. This processor will attempt to
          identify columns for food name, energy, protein, carbs, fat, fiber, sugar,
          and sodium even if column names vary.
        </p>
      </CardFooter>
    </Card>
  );
}