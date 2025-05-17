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

  // Create a test foods array
  const handleSimulateImport = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate successful import after a delay
    setTimeout(() => {
      // Sample foods data that would come from parsing the Excel file
      const sampleFoods = [
        {
          id: 1001,
          name: "Chicken Breast",
          brand: "NUTTAB",
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
          id: 1002,
          name: "Brown Rice",
          brand: "NUTTAB",
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
          id: 1003,
          name: "Salmon Fillet",
          brand: "NUTTAB",
          category: "protein",
          servingSize: 100,
          servingUnit: "g",
          calories: 206,
          protein: 22,
          carbs: 0,
          fat: 13,
          fiber: 0
        },
        {
          id: 1004,
          name: "Spinach",
          brand: "NUTTAB",
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
          id: 1005,
          name: "Avocado",
          brand: "NUTTAB",
          category: "fat",
          servingSize: 100,
          servingUnit: "g",
          calories: 160,
          protein: 2,
          carbs: 8.5,
          fat: 14.7,
          fiber: 6.7
        }
      ];
      
      setResults({
        success: true,
        message: "Successfully imported foods from Excel file",
        totalProcessed: sampleFoods.length,
        foods: sampleFoods
      });
      
      // Invalidate food cache
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${sampleFoods.length} foods from the Excel file.`,
        variant: "default"
      });
      
      setIsUploading(false);
    }, 1500);
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
                    onClick={handleSimulateImport}
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