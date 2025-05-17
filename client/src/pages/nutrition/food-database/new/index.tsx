import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { addFoodToStorage } from '@/lib/nutritionHelpers';

// Categories for the form
const FOOD_CATEGORIES = [
  { value: 'protein', label: 'Protein Source' },
  { value: 'carb', label: 'Carbohydrate' },
  { value: 'fat', label: 'Fat' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' }
];

// Serving units
const SERVING_UNITS = [
  { value: 'g', label: 'grams (g)' },
  { value: 'ml', label: 'milliliters (ml)' },
  { value: 'oz', label: 'ounces (oz)' },
  { value: 'cup', label: 'cup' },
  { value: 'tbsp', label: 'tablespoon' },
  { value: 'tsp', label: 'teaspoon' },
  { value: 'piece', label: 'piece' },
  { value: 'serving', label: 'serving' }
];

// Form schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Food name must be at least 2 characters.' })
    .max(100, { message: 'Food name must be less than 100 characters.' }),
  brand: z.string().optional(),
  category: z.string({
    required_error: 'Please select a category.'
  }),
  servingSize: z
    .coerce
    .number()
    .min(0.1, { message: 'Serving size must be greater than 0.' }),
  servingUnit: z.string({
    required_error: 'Please select a serving unit.'
  }),
  calories: z
    .coerce
    .number()
    .min(0, { message: 'Calories must be a positive number.' }),
  protein: z
    .coerce
    .number()
    .min(0, { message: 'Protein must be a positive number.' }),
  carbs: z
    .coerce
    .number()
    .min(0, { message: 'Carbs must be a positive number.' }),
  fat: z
    .coerce
    .number()
    .min(0, { message: 'Fat must be a positive number.' }),
  fiber: z
    .coerce
    .number()
    .min(0, { message: 'Fiber must be a positive number.' })
    .optional(),
  sugar: z
    .coerce
    .number()
    .min(0, { message: 'Sugar must be a positive number.' })
    .optional(),
  sodium: z
    .coerce
    .number()
    .min(0, { message: 'Sodium must be a positive number.' })
    .optional(),
  isPublic: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

export default function AddFoodPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get trainer ID - in a real app, this would come from authentication
  const trainerId = 1;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: 'protein',
      servingSize: 100,
      servingUnit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      isPublic: true
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Add timestamps
      const now = new Date().toISOString();
      
      // Create the new food object
      const newFood = {
        ...data,
        createdBy: trainerId,
        createdAt: now,
        updatedAt: now
      };
      
      // Save to storage
      const savedFood = addFoodToStorage(newFood);
      
      // Invalidate foods query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      
      // Show success toast
      toast({
        title: 'Food Added',
        description: `${data.name} has been added to your food database.`,
      });
      
      // Navigate back to food database
      navigate('/nutrition/food-database');
    } catch (error) {
      console.error('Error saving food:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the food. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate calories
  const calculateCalories = () => {
    const protein = form.watch('protein') || 0;
    const carbs = form.watch('carbs') || 0;
    const fat = form.watch('fat') || 0;
    
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    form.setValue('calories', Math.round(calculatedCalories));
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/nutrition/food-database')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Food Database
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Food</h1>
          <p className="text-muted-foreground">
            Add a new food to your database with detailed nutritional information
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the general information about this food
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chicken Breast" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Generic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FOOD_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="servingSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serving Size*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.1"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="servingUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serving Unit*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVING_UNITS.map(unit => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Information</CardTitle>
              <CardDescription>
                Enter the nutritional values per serving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Total energy in kcal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein* (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.1"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Calculate calories when values change
                            setTimeout(calculateCalories, 100);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        4 calories per gram
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs* (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.1"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Calculate calories when values change
                            setTimeout(calculateCalories, 100);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        4 calories per gram
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat* (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.1"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Calculate calories when values change
                            setTimeout(calculateCalories, 100);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        9 calories per gram
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber (g) - Optional</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sugar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar (g) - Optional</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium (mg) - Optional</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Visibility Settings</CardTitle>
              <CardDescription>
                Control who can see this food in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Food</FormLabel>
                      <FormDescription>
                        Make this food visible to clients and other trainers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/nutrition/food-database')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Food"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}