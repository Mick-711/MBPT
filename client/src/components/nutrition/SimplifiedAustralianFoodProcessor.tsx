import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Plus } from 'lucide-react';

// The food category mapping function
function mapToFoodCategory(foodName: string): string {
  const lowerName = foodName.toLowerCase();
  
  // Protein sources
  if (lowerName.includes('chicken') || lowerName.includes('beef') || 
      lowerName.includes('pork') || lowerName.includes('lamb') || 
      lowerName.includes('fish') || lowerName.includes('tofu') || 
      lowerName.includes('egg') || lowerName.includes('seafood') ||
      lowerName.includes('meat')) {
    return 'protein';
  }
  
  // Carbohydrate sources
  if (lowerName.includes('rice') || lowerName.includes('pasta') || 
      lowerName.includes('bread') || lowerName.includes('cereal') || 
      lowerName.includes('oat') || lowerName.includes('grain') ||
      lowerName.includes('wheat') || lowerName.includes('flour')) {
    return 'carbs';
  }
  
  // Fats
  if (lowerName.includes('oil') || lowerName.includes('butter') || 
      lowerName.includes('margarine') || lowerName.includes('cream') ||
      lowerName.includes('fat') || lowerName.includes('lard')) {
    return 'fat';
  }
  
  // Vegetables
  if (lowerName.includes('vegetable') || lowerName.includes('broccoli') || 
      lowerName.includes('carrot') || lowerName.includes('spinach') ||
      lowerName.includes('lettuce') || lowerName.includes('tomato') ||
      lowerName.includes('potato') || lowerName.includes('onion')) {
    return 'vegetable';
  }
  
  // Fruits
  if (lowerName.includes('fruit') || lowerName.includes('apple') || 
      lowerName.includes('banana') || lowerName.includes('orange') ||
      lowerName.includes('berry') || lowerName.includes('grape')) {
    return 'fruit';
  }
  
  // Dairy
  if (lowerName.includes('milk') || lowerName.includes('yogurt') || 
      lowerName.includes('cheese') || lowerName.includes('dairy')) {
    return 'dairy';
  }
  
  // Nuts and seeds
  if (lowerName.includes('nut') || lowerName.includes('almond') || 
      lowerName.includes('cashew') || lowerName.includes('peanut')) {
    return 'nuts';
  }
  
  if (lowerName.includes('seed') || lowerName.includes('sunflower') || 
      lowerName.includes('pumpkin') || lowerName.includes('flax')) {
    return 'seeds';
  }
  
  // Grains
  if (lowerName.includes('grain') || lowerName.includes('wheat') || 
      lowerName.includes('barley') || lowerName.includes('oat')) {
    return 'grains';
  }
  
  // Default
  return 'other';
}

const SimplifiedAustralianFoodProcessor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, number | null>>({
    foodName: null,
    energy: null,
    protein: null,
    fat: null,
    carbs: null,
    fiber: null,
    sodium: null
  });
  
  const CHUNK_SIZE = 50; // Process foods in smaller batches
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
      setPreviewData([]);
      setProgress(0);
      setStatus('');
    }
  };
  
  const findHeaderRow = (data: any[]): [number, string[]] => {
    // Look for rows that have "Food Name", "Energy", "Protein", "Fat" columns
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      
      // Check if this row has headers that match what we're looking for
      let isHeaderRow = false;
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toLowerCase();
        if (
          cell.includes('food name') || 
          cell.includes('energy') || 
          cell.includes('protein') || 
          cell.includes('fat') || 
          cell.includes('carb') ||
          cell.includes('sodium')
        ) {
          isHeaderRow = true;
          break;
        }
      }
      
      if (isHeaderRow) {
        console.log('Found header row at index', i, ':', row);
        return [i, row];
      }
    }
    
    // Default to first row if no clear header row is found
    console.log('No header row found, defaulting to row 0');
    return [0, data[0]];
  };
  
  const findColumnIndices = (headers: string[]): Record<string, number> => {
    const mapping: Record<string, number> = {
      foodName: -1,
      energy: -1, 
      protein: -1,
      fat: -1,
      carbs: -1,
      fiber: -1,
      sodium: -1
    };
    
    headers.forEach((header, index) => {
      const headerText = String(header || '').toLowerCase();
      
      // Food name column
      if (headerText.includes('food name') || headerText.includes('name')) {
        mapping.foodName = index;
      }
      
      // Energy column (prioritize "with fibre" if available)
      if (headerText.includes('energy with') && headerText.includes('fibre')) {
        mapping.energy = index;
      } else if (mapping.energy === -1 && headerText.includes('energy')) {
        mapping.energy = index;
      }
      
      // Protein column
      if (headerText.includes('protein')) {
        mapping.protein = index;
      }
      
      // Fat column
      if (headerText.includes('fat, total') || headerText === 'fat') {
        mapping.fat = index;
      }
      
      // Carbs column - look for available carbohydrate first
      if (headerText.includes('available carbohydrate') || headerText.includes('avail carb')) {
        mapping.carbs = index;
      } else if (mapping.carbs === -1 && headerText.includes('carb')) {
        mapping.carbs = index;
      }
      
      // Sodium column
      if (headerText.includes('sodium')) {
        mapping.sodium = index;
      }
    });
    
    console.log('Column mapping:', mapping);
    return mapping;
  };
  
  const processExcelFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    setStatus('Reading Excel file...');
    setProgress(5);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert the sheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
          
          console.log('Total rows:', jsonData.length);
          console.log('First few rows:', jsonData.slice(0, 3));
          
          // Find the header row
          const [headerRowIndex, headerRow] = findHeaderRow(jsonData as any[]);
          
          // Find column indices for required data
          const mapping = findColumnIndices(headerRow as string[]);
          setColumnMapping(mapping);
          
          // Check if we found all required columns
          const missingColumns = [];
          if (mapping.foodName === -1) missingColumns.push('Food Name');
          if (mapping.energy === -1) missingColumns.push('Energy');
          if (mapping.protein === -1) missingColumns.push('Protein');
          if (mapping.fat === -1) missingColumns.push('Fat');
          if (mapping.carbs === -1) missingColumns.push('Carbohydrates');
          if (mapping.sodium === -1) missingColumns.push('Sodium');
          
          if (missingColumns.length > 0) {
            setError(`Could not find required columns: ${missingColumns.join(', ')}`);
            setIsLoading(false);
            return;
          }
          
          // Generate preview with first 5 data rows
          const previewRows = jsonData.slice(headerRowIndex + 1, headerRowIndex + 6);
          setPreviewData(previewRows as any[]);
          
          // Process data
          setStatus('Processing food data...');
          setProgress(20);
          
          // Start with the row after the header row
          const dataRows = jsonData.slice(headerRowIndex + 1) as any[];
          
          // Transform data for database
          const processedFoods = dataRows
            .filter(row => row && row.length > 0 && row[mapping.foodName])
            .map(row => {
              // Get energy value and convert from kJ to kcal if necessary
              let energy = parseFloat(row[mapping.energy]) || 0;
              // If energy value seems to be in kJ (typical for Australian data), convert to kcal
              if (energy > 500) {
                energy = Math.round(energy / 4.184); // Convert kJ to kcal
              }
              
              return {
                name: String(row[mapping.foodName]),
                brand: 'NUTTAB',
                category: mapToFoodCategory(String(row[mapping.foodName])),
                servingSize: 100,
                servingUnit: 'g',
                calories: energy,
                protein: parseFloat(row[mapping.protein]) || 0,
                carbs: parseFloat(row[mapping.carbs]) || 0,
                fat: parseFloat(row[mapping.fat]) || 0,
                fiber: 0, // Not including fiber
                sugar: 0, // Not including sugar
                sodium: parseFloat(row[mapping.sodium]) || 0,
                isPublic: true,
                createdBy: null
              };
            });
          
          setStatus(`Saving ${processedFoods.length} foods to database...`);
          setProgress(50);
          
          // Process in chunks to avoid payload size limits
          const chunks = [];
          for (let i = 0; i < processedFoods.length; i += CHUNK_SIZE) {
            chunks.push(processedFoods.slice(i, i + CHUNK_SIZE));
          }
          
          let successCount = 0;
          let errorCount = 0;
          
          for (let i = 0; i < chunks.length; i++) {
            try {
              setStatus(`Saving batch ${i + 1} of ${chunks.length}...`);
              const progressPercent = 50 + Math.floor((i / chunks.length) * 50);
              setProgress(progressPercent);
              
              const response = await axios.post('/api/foods/batch', {
                foods: chunks[i]
              });
              
              successCount += response.data.count || 0;
            } catch (error: any) {
              console.error('Error saving chunk to database:', error);
              errorCount += chunks[i].length;
            }
          }
          
          console.log(`Processed ${successCount} foods`);
          setSuccess(`Successfully imported ${successCount} foods${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
          setStatus('Complete');
          setProgress(100);
        } catch (error: any) {
          console.error('Error processing Excel file:', error);
          setError(`Error processing file: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setIsLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error: any) {
      console.error('Error processing Excel file:', error);
      setError(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Australian Food Database Importer
          </CardTitle>
          <CardDescription>
            Import foods from the Australian Food Composition Database (NUTTAB) Excel file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                disabled={isLoading}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Select the NUTTAB Excel file containing food data. We'll import the food name, energy, protein, fat, carbs, and sodium.
              </p>
            </div>
            
            {file && (
              <Button
                onClick={processExcelFile}
                disabled={isLoading || !file}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isLoading ? 'Processing...' : 'Process File'}
              </Button>
            )}
            
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      {previewData.length > 0 && columnMapping.foodName !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              First few rows from the spreadsheet with mapped columns highlighted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={columnMapping.foodName !== -1 ? 'bg-primary/10' : ''}>Food Name</TableHead>
                    <TableHead className={columnMapping.energy !== -1 ? 'bg-primary/10' : ''}>Energy (kcal)</TableHead>
                    <TableHead className={columnMapping.protein !== -1 ? 'bg-primary/10' : ''}>Protein (g)</TableHead>
                    <TableHead className={columnMapping.fat !== -1 ? 'bg-primary/10' : ''}>Fat (g)</TableHead>
                    <TableHead className={columnMapping.carbs !== -1 ? 'bg-primary/10' : ''}>Carbs (g)</TableHead>
                    <TableHead className={columnMapping.sodium !== -1 ? 'bg-primary/10' : ''}>Sodium (mg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>
                        {columnMapping.foodName !== -1 ? row[columnMapping.foodName] : 'Not found'}
                      </TableCell>
                      <TableCell>
                        {columnMapping.energy !== -1 ? 
                          (parseFloat(row[columnMapping.energy]) > 500 ? 
                            Math.round(parseFloat(row[columnMapping.energy]) / 4.184) : 
                            row[columnMapping.energy]) : 
                          'Not found'}
                      </TableCell>
                      <TableCell>
                        {columnMapping.protein !== -1 ? row[columnMapping.protein] : 'Not found'}
                      </TableCell>
                      <TableCell>
                        {columnMapping.fat !== -1 ? row[columnMapping.fat] : 'Not found'}
                      </TableCell>
                      <TableCell>
                        {columnMapping.carbs !== -1 ? row[columnMapping.carbs] : 'Not found'}
                      </TableCell>
                      <TableCell>
                        {columnMapping.sodium !== -1 ? row[columnMapping.sodium] : 'Not found'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimplifiedAustralianFoodProcessor;