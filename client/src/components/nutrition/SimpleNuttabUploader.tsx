import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, Check, X, File } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SimpleNuttabUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  // Process and upload NUTTAB food data
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);

      // First, process the Excel file on the client-side to handle large files better
      // This uses the xlsx library which has been added to the project
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error("Failed to read file");
          }
          
          const workbook = await import('xlsx').then(XLSX => {
            // Parse the Excel data
            return XLSX.read(data, { type: 'binary' });
          });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = await import('xlsx').then(XLSX => {
            return XLSX.utils.sheet_to_json(worksheet);
          });
          
          console.log(`Processed ${jsonData.length} rows from Excel file`);
          
          if (jsonData.length === 0) {
            throw new Error("No data found in Excel file");
          }
          
          // Process and map the data to our food format
          const processedFoods = jsonData.map((row: any, index) => {
            // Extract fields based on common NUTTAB column names
            const name = row['Food Name'] || row['Name'] || row['FOOD_NAME'] || row['Food_Name'] || row['food_name'];
            const category = row['Food Group'] || row['Category'] || row['FOOD_GROUP'] || row['Food_Group'] || row['food_group'] || 'other';
            const servingSize = parseFloat(row['Serving Size'] || row['SERVE_SIZE'] || row['Serve_Size'] || row['serving_size'] || '100') || 100;
            const servingUnit = row['Serving Unit'] || row['SERVE_UNIT'] || row['Serve_Unit'] || row['serving_unit'] || 'g';
            
            // Convert kJ to kcal if energy is in kJ
            let calories = 0;
            if (row['Energy (kJ)'] || row['ENERGY (kJ)'] || row['Energy']) {
              const energyValue = parseFloat(row['Energy (kJ)'] || row['ENERGY (kJ)'] || row['Energy'] || '0');
              calories = energyValue / 4.184; // Convert kJ to kcal
            } else if (row['Calories'] || row['CALORIES'] || row['calories']) {
              calories = parseFloat(row['Calories'] || row['CALORIES'] || row['calories'] || '0');
            }
            
            // Extract macronutrients
            const protein = parseFloat(row['Protein (g)'] || row['Protein'] || row['PROTEIN'] || '0') || 0;
            const carbs = parseFloat(row['Carbohydrate (g)'] || row['Carbs'] || row['CARBOHYDRATE'] || row['carbs'] || row['carbohydrate'] || '0') || 0;
            const fat = parseFloat(row['Fat, total (g)'] || row['Fat'] || row['FAT'] || row['fat'] || '0') || 0;
            const fiber = parseFloat(row['Fibre (g)'] || row['Fiber (g)'] || row['Fiber'] || row['FIBRE'] || row['fibre'] || row['fiber'] || '0') || 0;
            const sugar = parseFloat(row['Sugars (g)'] || row['Sugar (g)'] || row['Sugar'] || row['SUGARS'] || row['sugar'] || row['sugars'] || '0') || 0;
            const sodium = parseFloat(row['Sodium (mg)'] || row['SODIUM'] || row['sodium'] || '0') || 0;
            
            // Map the category to our food categories
            let mappedCategory = 'other';
            
            // Map common food groups to our categories
            const categoryMapping: Record<string, string> = {
              'meat': 'protein',
              'poultry': 'protein', 
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
            
            // Try to match the category with our mapping
            const lowerCategory = category.toLowerCase();
            for (const [key, value] of Object.entries(categoryMapping)) {
              if (lowerCategory.includes(key)) {
                mappedCategory = value;
                break;
              }
            }
            
            return {
              name: name || `NUTTAB Food ${index + 1}`,
              brand: 'NUTTAB',
              category: mappedCategory,
              servingSize,
              servingUnit,
              calories: Math.round(calories * 10) / 10, // Round to 1 decimal place
              protein: Math.round(protein * 10) / 10,
              carbs: Math.round(carbs * 10) / 10,
              fat: Math.round(fat * 10) / 10,
              fiber: Math.round(fiber * 10) / 10,
              sugar: Math.round(sugar * 10) / 10,
              sodium: Math.round(sodium),
              isPublic: true
            };
          });
          
          // Now save the processed foods to the database
          try {
            const response = await axios.post('/api/foods/batch', {
              foods: processedFoods
            });
            
            setResults({
              success: true,
              message: "Successfully imported foods from Excel file",
              totalProcessed: processedFoods.length,
              foods: response.data.foods || processedFoods.slice(0, 10) // Show at most 10 foods as a sample
            });
            
            // Invalidate food cache to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
            
            toast({
              title: "Import successful",
              description: `Successfully imported ${processedFoods.length} foods from the Excel file.`,
              variant: "default"
            });
          } catch (error) {
            console.error('Error saving foods to database:', error);
            
            // Even if the database save fails, show the processed foods
            setResults({
              success: false,
              message: "Failed to save foods to database. Please try again.",
              totalProcessed: processedFoods.length,
              foods: processedFoods.slice(0, 10) // Show the first 10 foods
            });
            
            toast({
              title: "Import failed",
              description: "Failed to save foods to database. Please try again.",
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
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File reading failed",
          description: "Failed to read the Excel file. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
      };
      
      // Start reading the file as a binary string
      reader.readAsBinaryString(file);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      
      toast({
        title: "Upload failed",
        description: "Failed to upload the Excel file. Please try again.",
        variant: "destructive"
      });
    }
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
          NUTTAB Excel Importer
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
                    disabled={isUploading}
                  >
                    Change File
                  </Button>
                  <Button 
                    onClick={handleFileUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
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
                Successfully imported {results.foods.length} foods from the Excel file
              </AlertDescription>
            </Alert>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Imported Foods:</h4>
              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] bg-muted p-2 gap-4 text-sm font-medium">
                  <div>Food Name</div>
                  <div>Protein</div>
                  <div>Carbs</div>
                  <div>Fat</div>
                </div>
                <div className="divide-y">
                  {results.foods.map((food: any) => (
                    <div key={food.id} className="grid grid-cols-[1fr_auto_auto_auto] p-2 gap-4 text-sm">
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
          Supported formats: Excel (.xlsx, .xls) and CSV files.
          Make sure your spreadsheet has columns for food name, nutritional values,
          and serving sizes.
        </p>
      </CardFooter>
    </Card>
  );
}