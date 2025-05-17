import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  Calculator, 
  Dumbbell, 
  Activity, 
  Target, 
  Scale, 
  Calendar, 
  Ruler, 
  User2 
} from 'lucide-react';

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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { calculateCalorieNeeds } from '@/lib/nutritionHelpers';

// Form schema
const calculatorSchema = z.object({
  weight: z
    .coerce
    .number()
    .min(30, { message: 'Weight must be at least 30 kg.' })
    .max(250, { message: 'Weight must be less than 250 kg.' }),
  height: z
    .coerce
    .number()
    .min(100, { message: 'Height must be at least 100 cm.' })
    .max(250, { message: 'Height must be less than 250 cm.' }),
  age: z
    .coerce
    .number()
    .min(16, { message: 'Age must be at least 16 years.' })
    .max(100, { message: 'Age must be less than 100 years.' }),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['maintain', 'lose', 'gain']),
  bodyComposition: z.enum(['average', 'lean', 'very_lean'])
});

type FormValues = z.infer<typeof calculatorSchema>;

interface MacroResults {
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export default function MacroCalculatorPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [results, setResults] = useState<MacroResults | null>(null);
  const [activeTab, setActiveTab] = useState('calculator');
  
  const activityLevelDescriptions = {
    sedentary: 'Little to no exercise, desk job',
    light: 'Light exercise 1-3 days/week',
    moderate: 'Moderate exercise 3-5 days/week',
    active: 'Hard exercise 6-7 days/week',
    very_active: 'Professional athlete or very physically demanding job'
  };
  
  const goalDescriptions = {
    maintain: 'Maintain current weight',
    lose: 'Lose weight (20% deficit)',
    gain: 'Gain weight (10% surplus)'
  };
  
  const bodyCompositionDescriptions = {
    average: 'Average body fat percentage',
    lean: 'Lower body fat, visible muscle definition',
    very_lean: 'Very low body fat, clearly visible muscle separation'
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      weight: 70,
      height: 170,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain',
      bodyComposition: 'average'
    }
  });
  
  // Calculate macros when form is submitted
  const onSubmit = (data: FormValues) => {
    // Calculate macros using helper function
    const macroResults = calculateCalorieNeeds(
      data.weight,
      data.height,
      data.age,
      data.gender,
      data.activityLevel,
      data.goal,
      data.bodyComposition
    );
    
    // Set results
    setResults(macroResults);
    
    // Switch to results tab
    setActiveTab('results');
    
    // Show toast
    toast({
      title: 'Calculation Complete',
      description: 'Your macro calculation has been completed.',
    });
  };
  
  // Reset calculator
  const resetCalculator = () => {
    form.reset();
    setResults(null);
    setActiveTab('calculator');
  };
  
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
          <h1 className="text-3xl font-bold tracking-tight">Macro Calculator</h1>
          <p className="text-muted-foreground">
            Calculate personalized macronutrient targets for your clients
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>
            <Target className="mr-2 h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Macro Calculator</CardTitle>
              <CardDescription>
                Enter your client's details to calculate their recommended calorie and macronutrient targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Physical Information</h3>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Scale className="mr-2 h-4 w-4" />
                                    Weight (kg)
                                  </div>
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Ruler className="mr-2 h-4 w-4" />
                                    Height (cm)
                                  </div>
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Age (years)
                                  </div>
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <User2 className="mr-2 h-4 w-4" />
                                    Gender
                                  </div>
                                </FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="male" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Male
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="female" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Female
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Activity & Goals</h3>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="activityLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Activity Level
                                  </div>
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select activity level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="sedentary">Sedentary</SelectItem>
                                    <SelectItem value="light">Lightly Active</SelectItem>
                                    <SelectItem value="moderate">Moderately Active</SelectItem>
                                    <SelectItem value="active">Very Active</SelectItem>
                                    <SelectItem value="very_active">Extremely Active</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {(activityLevelDescriptions as any)[field.value]}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Target className="mr-2 h-4 w-4" />
                                    Goal
                                  </div>
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select goal" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                                    <SelectItem value="lose">Lose Weight</SelectItem>
                                    <SelectItem value="gain">Gain Weight</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {(goalDescriptions as any)[field.value]}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bodyComposition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Dumbbell className="mr-2 h-4 w-4" />
                                    Body Composition
                                  </div>
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select body composition" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="average">Average</SelectItem>
                                    <SelectItem value="lean">Lean</SelectItem>
                                    <SelectItem value="very_lean">Very Lean</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {(bodyCompositionDescriptions as any)[field.value]}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit" 
                          className="w-full"
                        >
                          <Calculator className="mr-2 h-4 w-4" />
                          Calculate Macros
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          {results && (
            <div className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Macro Calculation Results</CardTitle>
                  <CardDescription>
                    Personalized macronutrient targets based on the provided information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Calorie Targets</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-sm font-medium">Maintenance Calories (TDEE)</div>
                            <div className="text-sm font-medium">{results.tdee} kcal</div>
                          </div>
                          <Progress value={100} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Total Daily Energy Expenditure
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-sm font-medium">Target Calories</div>
                            <div className="text-sm font-medium">{results.targetCalories} kcal</div>
                          </div>
                          <Progress 
                            value={(results.targetCalories / results.tdee) * 100} 
                            className={`h-2 ${
                              results.targetCalories < results.tdee 
                                ? 'bg-amber-500' 
                                : results.targetCalories > results.tdee 
                                  ? 'bg-green-500' 
                                  : ''
                            }`} 
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {results.targetCalories < results.tdee 
                              ? `${results.tdee - results.targetCalories} kcal deficit for weight loss` 
                              : results.targetCalories > results.tdee 
                                ? `${results.targetCalories - results.tdee} kcal surplus for weight gain` 
                                : 'Maintenance calories'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Macronutrient Distribution</h3>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4 text-center">
                              <div className="text-sm text-muted-foreground">Protein</div>
                              <div className="text-2xl font-bold">{results.protein}g</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((results.protein * 4 / results.targetCalories) * 100)}% of calories
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {Math.round(results.protein / form.getValues().weight * 10) / 10}g/kg body weight
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                            <CardContent className="p-4 text-center">
                              <div className="text-sm text-muted-foreground">Carbs</div>
                              <div className="text-2xl font-bold">{results.carbs}g</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((results.carbs * 4 / results.targetCalories) * 100)}% of calories
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                            <CardContent className="p-4 text-center">
                              <div className="text-sm text-muted-foreground">Fat</div>
                              <div className="text-2xl font-bold">{results.fat}g</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((results.fat * 9 / results.targetCalories) * 100)}% of calories
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Daily Meal Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Breakfast (25%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Calories:</span>
                              <span className="font-medium">{Math.round(results.targetCalories * 0.25)} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Protein:</span>
                              <span className="font-medium">{Math.round(results.protein * 0.25)}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Carbs:</span>
                              <span className="font-medium">{Math.round(results.carbs * 0.25)}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fat:</span>
                              <span className="font-medium">{Math.round(results.fat * 0.25)}g</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Lunch (35%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Calories:</span>
                              <span className="font-medium">{Math.round(results.targetCalories * 0.35)} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Protein:</span>
                              <span className="font-medium">{Math.round(results.protein * 0.35)}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Carbs:</span>
                              <span className="font-medium">{Math.round(results.carbs * 0.35)}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fat:</span>
                              <span className="font-medium">{Math.round(results.fat * 0.35)}g</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Dinner (40%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Calories:</span>
                              <span className="font-medium">{Math.round(results.targetCalories * 0.4)} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Protein:</span>
                              <span className="font-medium">{Math.round(results.protein * 0.4)}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Carbs:</span>
                              <span className="font-medium">{Math.round(results.carbs * 0.4)}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fat:</span>
                              <span className="font-medium">{Math.round(results.fat * 0.4)}g</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={resetCalculator}>
                    New Calculation
                  </Button>
                  <Button>
                    Create Meal Plan
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Protein Sources</h4>
                    <p className="text-sm text-muted-foreground">
                      Lean meats (chicken, turkey), fish, eggs, dairy (Greek yogurt, cottage cheese), 
                      plant-based proteins (tofu, tempeh, legumes), protein powders
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Carbohydrate Sources</h4>
                    <p className="text-sm text-muted-foreground">
                      Whole grains (brown rice, quinoa, oats), starchy vegetables (sweet potatoes, potatoes), 
                      fruits, legumes, whole-grain bread and pasta
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Fat Sources</h4>
                    <p className="text-sm text-muted-foreground">
                      Avocados, nuts and seeds, olive oil, fatty fish (salmon, mackerel), nut butters,
                      eggs, full-fat dairy in moderation
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">General Tips</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Distribute protein intake evenly throughout the day</li>
                      <li>Place higher carbohydrate meals around workout times</li>
                      <li>Include vegetables with most meals for micronutrients and fiber</li>
                      <li>Stay hydrated (2-3 liters of water daily)</li>
                      <li>Consider nutrient timing: protein before/after workouts, carbs around workouts</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}