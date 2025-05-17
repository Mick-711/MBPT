import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Pizza,
  ShoppingCart,
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  Download,
  Upload
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { 
  getFoodsFromStorage,
  initializeNutritionStorage,
  FoodData 
} from '@/lib/nutritionHelpers';

// Categories for filtering
const FOOD_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'protein', label: 'Protein Sources' },
  { value: 'carb', label: 'Carbohydrates' },
  { value: 'fat', label: 'Fats' },
  { value: 'vegetable', label: 'Vegetables' },
  { value: 'fruit', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' }
];

export default function FoodDatabasePage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Initialize nutrition storage if empty
  useEffect(() => {
    initializeNutritionStorage();
  }, []);
  
  // Fetch food database
  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods'],
    queryFn: () => getFoodsFromStorage()
  });
  
  // Filter foods based on search term and category
  const filteredFoods = foods?.filter(food => {
    const matchesSearch = 
      searchTerm === '' || 
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || food.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];
  
  // Categorize foods for display
  const foodsByCategory = filteredFoods.reduce((acc: Record<string, FoodData[]>, food) => {
    const category = food.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(food);
    return acc;
  }, {});
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };
  
  // JSX for the filters section
  const filtersSection = (
    <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
      <div className="flex-1">
        <div className="text-sm font-medium mb-2">Search Foods</div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or brand..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="w-full md:w-[200px]">
        <div className="text-sm font-medium mb-2">Category</div>
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {FOOD_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        {(searchTerm || categoryFilter !== 'all') && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="ml-auto flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate('/nutrition/food-database/nuttab-import')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import from NUTTAB
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button onClick={() => navigate('/nutrition/food-database/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Food
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/nutrition')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Nutrition
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food Database</h1>
          <p className="text-muted-foreground">
            Manage your food database with detailed nutritional information
          </p>
        </div>
      </div>
      
      {filtersSection}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredFoods.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Food</TableHead>
                  <TableHead className="text-center">Serving</TableHead>
                  <TableHead className="text-center">Calories</TableHead>
                  <TableHead className="text-center">Protein</TableHead>
                  <TableHead className="text-center">Carbs</TableHead>
                  <TableHead className="text-center">Fat</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFoods.map((food) => (
                  <TableRow key={food.id}>
                    <TableCell>
                      <div className="font-medium">{food.name}</div>
                      {food.brand && (
                        <div className="text-xs text-muted-foreground">{food.brand}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {food.servingSize} {food.servingUnit}
                    </TableCell>
                    <TableCell className="text-center">{food.calories}</TableCell>
                    <TableCell className="text-center">{food.protein}g</TableCell>
                    <TableCell className="text-center">{food.carbs}g</TableCell>
                    <TableCell className="text-center">{food.fat}g</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/nutrition/food-database/${food.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/nutrition/food-database/${food.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Foods Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm || categoryFilter !== 'all' 
              ? "No foods match your search filters. Try adjusting your search criteria."
              : "Your food database is empty. Add foods to get started."}
          </p>
          {searchTerm || categoryFilter !== 'all' ? (
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button onClick={() => navigate('/nutrition/food-database/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Food
            </Button>
          )}
        </div>
      )}
      
      {categoryFilter === 'all' && filteredFoods.length > 0 && (
        <div className="mt-8 space-y-8">
          {Object.entries(foodsByCategory).map(([category, foods]) => (
            <div key={category}>
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold capitalize">{category === 'carb' ? 'Carbohydrates' : `${category}s`}</h2>
                <Badge className="ml-2">{foods.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foods.map(food => (
                  <Card key={food.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/nutrition/food-database/${food.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          {food.brand && (
                            <div className="text-xs text-muted-foreground">{food.brand}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{food.calories}</div>
                          <div className="text-xs text-muted-foreground">kcal</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-2">
                        <div className="flex space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">{food.protein}g</div>
                            <div className="text-xs text-muted-foreground">Protein</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{food.carbs}g</div>
                            <div className="text-xs text-muted-foreground">Carbs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{food.fat}g</div>
                            <div className="text-xs text-muted-foreground">Fat</div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground self-end">
                          {food.servingSize} {food.servingUnit}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}