import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Download, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

import { FoodData } from '@/lib/nutritionHelpers';
import { nuttabFoods, searchNuttabFoods, convertToFoodData, NuttabFoodData } from '@/data/nuttabFoods';

export default function NuttabFoodImporter() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NuttabFoodData[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term to find foods in NUTTAB.",
        variant: "destructive"
      });
      return;
    }
    
    const results = searchNuttabFoods(query);
    setSearchResults(results);
    setSelectedFoods([]); // Reset selections
  };

  // Toggle food selection
  const toggleFoodSelection = (id: number) => {
    setSelectedFoods(prev => 
      prev.includes(id) 
        ? prev.filter(foodId => foodId !== id) 
        : [...prev, id]
    );
  };

  // Select all foods
  const selectAllFoods = () => {
    if (selectedFoods.length === searchResults.length) {
      setSelectedFoods([]);
    } else {
      setSelectedFoods(searchResults.map(food => food.id));
    }
  };

  // Import selected foods
  const handleImport = async () => {
    if (selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please select at least one food to import.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      const foodsToImport = searchResults.filter(food => 
        selectedFoods.includes(food.id)
      );
      
      // Get existing foods from storage
      const existingFoods = JSON.parse(localStorage.getItem('foods') || '[]');
      
      // Get the highest existing ID
      const highestId = existingFoods.length > 0 
        ? Math.max(...existingFoods.map((food: FoodData) => food.id)) 
        : 0;
      
      // Convert NUTTAB foods to full FoodData format with new IDs
      const foodsWithIds = foodsToImport.map((food, index) => {
        // Create a complete FoodData object with required fields
        return {
          ...convertToFoodData(food),
          id: highestId + index + 1
        };
      });
      
      // Combine existing and new foods
      const updatedFoods = [...existingFoods, ...foodsWithIds];
      
      // Save to local storage
      localStorage.setItem('foods', JSON.stringify(updatedFoods));
      
      // Invalidate foods cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      
      toast({
        title: "Foods imported successfully",
        description: `${foodsWithIds.length} foods have been added to your database.`,
        variant: "default"
      });
      
      // Clear results after successful import
      setSearchResults([]);
      setSelectedFoods([]);
      setQuery('');
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import foods to database.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2 text-primary" />
          NUTTAB Food Database Import
        </CardTitle>
        <CardDescription>
          Search and import nutritional data from the Australian Food Composition Database (NUTTAB)
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="nuttab-search" className="text-sm font-medium">
              Search Query
            </label>
            <div className="flex gap-2">
              <Input
                id="nuttab-search"
                placeholder="e.g., fruits, vegetables, chicken, etc."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter food categories or specific food items to search in NUTTAB
            </p>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Search Results</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllFoods}>
                  {selectedFoods.length === searchResults.length 
                    ? "Deselect All" 
                    : "Select All"}
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleImport}
                  disabled={selectedFoods.length === 0 || isImporting}
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Import Selected ({selectedFoods.length})
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border rounded-md">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                <div></div>
                <div>Food Name</div>
                <div>Nutrition (per serving)</div>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {searchResults.map((food) => (
                  <div key={food.id} className="grid grid-cols-[auto_1fr_1fr] gap-4 p-4 items-center">
                    <div>
                      <Checkbox
                        checked={selectedFoods.includes(food.id)}
                        onCheckedChange={() => toggleFoodSelection(food.id)}
                        id={`food-${food.id}`}
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor={`food-${food.id}`} 
                        className="font-medium cursor-pointer"
                      >
                        {food.name}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {food.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {food.servingSize} {food.servingUnit}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{food.calories} kcal</div>
                      <div className="text-muted-foreground">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g{" "}
                        {food.fiber > 0 && `• Fiber: ${food.fiber}g`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {query && searchResults.length === 0 && (
          <div className="mt-6 text-center p-8 border rounded-md">
            <X className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-xl font-medium mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-2">
              No foods matching "{query}" were found in the NUTTAB database.
            </p>
            <p className="text-sm text-muted-foreground">
              Try using more general terms or check your spelling.
            </p>
          </div>
        )}
      </CardContent>
      
      {searchResults.length > 0 && (
        <CardFooter className="flex justify-end border-t pt-4">
          <Button 
            variant="default" 
            onClick={handleImport}
            disabled={selectedFoods.length === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Importing Selected Foods...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import {selectedFoods.length} Selected Foods
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}