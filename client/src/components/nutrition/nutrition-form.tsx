import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X, Plus, Loader2, ChefHat } from "lucide-react";

// Create schema for nutrition plan form
const nutritionPlanSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  trainerId: z.number(),
  clientId: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  dailyCalories: z.number().min(0).optional(),
  proteinPercentage: z.number().min(0).max(100).optional(),
  carbsPercentage: z.number().min(0).max(100).optional(),
  fatPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  isTemplate: z.boolean().default(false),
  meals: z.array(
    z.object({
      name: z.string().min(1, "Meal name is required"),
      day: z.number().min(1, "Day is required"),
      time: z.string().min(1, "Time is required"),
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
      description: z.string().optional(),
      recipes: z.any().optional()
    })
  ).default([])
});

type NutritionPlanFormValues = z.infer<typeof nutritionPlanSchema>;

interface NutritionFormProps {
  isAIAssisted?: boolean;
  initialData?: NutritionPlanFormValues;
  mode?: 'create' | 'edit';
}

export default function NutritionForm({ isAIAssisted = false, initialData, mode = 'create' }: NutritionFormProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ['/api/trainer/clients'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0], {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    }
  });

  // Define form with validation
  const form = useForm<NutritionPlanFormValues>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      trainerId: 0, // Will be set from auth on submission
      dailyCalories: 2000,
      proteinPercentage: 30,
      carbsPercentage: 40,
      fatPercentage: 30,
      isTemplate: false,
      meals: [
        {
          name: 'Breakfast',
          day: 1,
          time: 'breakfast',
          calories: 500,
          protein: 30,
          carbs: 50,
          fat: 15,
          description: ''
        },
        {
          name: 'Lunch',
          day: 1,
          time: 'lunch',
          calories: 700,
          protein: 40,
          carbs: 70,
          fat: 20,
          description: ''
        },
        {
          name: 'Dinner',
          day: 1,
          time: 'dinner',
          calories: 600,
          protein: 35,
          carbs: 60,
          fat: 20,
          description: ''
        },
        {
          name: 'Snack',
          day: 1,
          time: 'snack',
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          description: ''
        }
      ]
    }
  });

  // Set trainerId when user data is available
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      form.setValue('trainerId', user.id);
    }
  }, [form]);

  // Create nutrition plan mutation
  const createNutritionPlanMutation = useMutation({
    mutationFn: async (data: NutritionPlanFormValues) => {
      return await apiRequest('POST', '/api/nutrition', data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Create individual meals
      if (form.getValues().meals?.length > 0) {
        const meals = form.getValues().meals;
        
        for (const meal of meals) {
          await apiRequest('POST', `/api/nutrition/${data.id}/meals`, {
            ...meal,
            planId: data.id
          });
        }
      }
      
      toast({
        title: "Nutrition plan created",
        description: "The nutrition plan has been created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition'] });
      setLocation('/nutrition');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating nutrition plan",
        description: error.message || "Failed to create nutrition plan",
        variant: "destructive",
      });
    }
  });

  // Update nutrition plan mutation
  const updateNutritionPlanMutation = useMutation({
    mutationFn: async (data: NutritionPlanFormValues & { id: number }) => {
      return await apiRequest('PUT', `/api/nutrition/${data.id}`, data);
    },
    onSuccess: async () => {
      toast({
        title: "Nutrition plan updated",
        description: "The nutrition plan has been updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition'] });
      setLocation('/nutrition');
    },
    onError: (error: any) => {
      toast({
        title: "Error updating nutrition plan",
        description: error.message || "Failed to update nutrition plan",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: NutritionPlanFormValues) => {
    if (mode === 'create') {
      createNutritionPlanMutation.mutate(data);
    } else if (mode === 'edit' && initialData && 'id' in initialData) {
      updateNutritionPlanMutation.mutate({ ...data, id: (initialData as any).id });
    }
  };

  // Add new day
  const addDay = () => {
    const meals = form.getValues().meals || [];
    const days = [...new Set(meals.map(meal => meal.day))];
    const newDay = Math.max(...days, 0) + 1;
    
    form.setValue('meals', [
      ...meals, 
      {
        name: 'Breakfast',
        day: newDay,
        time: 'breakfast',
        calories: 500,
        protein: 30,
        carbs: 50,
        fat: 15,
        description: ''
      },
      {
        name: 'Lunch',
        day: newDay,
        time: 'lunch',
        calories: 700,
        protein: 40,
        carbs: 70,
        fat: 20,
        description: ''
      },
      {
        name: 'Dinner',
        day: newDay,
        time: 'dinner',
        calories: 600,
        protein: 35,
        carbs: 60,
        fat: 20,
        description: ''
      },
      {
        name: 'Snack',
        day: newDay,
        time: 'snack',
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 5,
        description: ''
      }
    ]);
    setActiveDayIndex(days.length);
  };

  // Add meal to day
  const addMeal = (day: number) => {
    const meals = [...form.getValues().meals];
    const dayMeals = meals.filter(meal => meal.day === day);
    
    meals.push({
      name: 'New Meal',
      day: day,
      time: 'snack',
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 5,
      description: ''
    });
    
    form.setValue('meals', meals);
  };

  // Remove meal
  const removeMeal = (mealIndex: number) => {
    const meals = [...form.getValues().meals];
    meals.splice(mealIndex, 1);
    form.setValue('meals', meals);
  };

  // Get days from meals
  const getDaysFromMeals = () => {
    const meals = form.getValues().meals || [];
    const days = [...new Set(meals.map(meal => meal.day))].sort((a, b) => a - b);
    return days;
  };

  // Get meals for a day
  const getMealsForDay = (day: number) => {
    const meals = form.getValues().meals || [];
    return meals.filter(meal => meal.day === day);
  };

  // Mock AI generation function
  const generateWithAI = async () => {
    if (!form.getValues().clientId) {
      toast({
        title: "Client required",
        description: "Please select a client to generate a personalized nutrition plan",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedClient = clients?.find((c: any) => c.id === form.getValues().clientId);
      
      if (!selectedClient) {
        throw new Error("Client not found");
      }
      
      // Mock AI generated nutrition plan
      const aiNutritionPlan = {
        name: `${selectedClient.user.fullName.split(' ')[0]}'s Custom Nutrition Plan`,
        description: "AI-generated nutrition plan focused on balanced macronutrients and sustainable eating habits.",
        dailyCalories: 2200,
        proteinPercentage: 35,
        carbsPercentage: 40,
        fatPercentage: 25,
        meals: [
          // Day 1
          {
            name: "Protein-Packed Breakfast",
            day: 1,
            time: "breakfast",
            calories: 550,
            protein: 35,
            carbs: 45,
            fat: 20,
            description: "Greek yogurt with berries and granola, 2 boiled eggs"
          },
          {
            name: "Balanced Lunch",
            day: 1,
            time: "lunch",
            calories: 650,
            protein: 40,
            carbs: 60,
            fat: 25,
            description: "Grilled chicken salad with quinoa and olive oil dressing"
          },
          {
            name: "Afternoon Snack",
            day: 1,
            time: "snack",
            calories: 250,
            protein: 15,
            carbs: 25,
            fat: 10,
            description: "Apple slices with almond butter"
          },
          {
            name: "Protein-Rich Dinner",
            day: 1,
            time: "dinner",
            calories: 750,
            protein: 45,
            carbs: 70,
            fat: 25,
            description: "Baked salmon with sweet potatoes and steamed broccoli"
          },
          // Day 2
          {
            name: "Energy Breakfast",
            day: 2,
            time: "breakfast",
            calories: 520,
            protein: 30,
            carbs: 60,
            fat: 15,
            description: "Oatmeal with banana, flaxseeds and protein powder"
          },
          {
            name: "Protein Bowl Lunch",
            day: 2,
            time: "lunch",
            calories: 680,
            protein: 45,
            carbs: 65,
            fat: 20,
            description: "Turkey and black bean bowl with brown rice and avocado"
          },
          {
            name: "Protein Snack",
            day: 2,
            time: "snack",
            calories: 200,
            protein: 20,
            carbs: 15,
            fat: 5,
            description: "Protein shake with berries"
          },
          {
            name: "Balanced Dinner",
            day: 2,
            time: "dinner",
            calories: 720,
            protein: 40,
            carbs: 60,
            fat: 30,
            description: "Stir-fried tofu with vegetables and brown rice"
          }
        ]
      };
      
      form.setValue('name', aiNutritionPlan.name);
      form.setValue('description', aiNutritionPlan.description);
      form.setValue('dailyCalories', aiNutritionPlan.dailyCalories);
      form.setValue('proteinPercentage', aiNutritionPlan.proteinPercentage);
      form.setValue('carbsPercentage', aiNutritionPlan.carbsPercentage);
      form.setValue('fatPercentage', aiNutritionPlan.fatPercentage);
      form.setValue('meals', aiNutritionPlan.meals);
      
      toast({
        title: "Nutrition plan generated",
        description: "The AI has created a custom nutrition plan. You can now review and edit it.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating the nutrition plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Get days tabs
  const days = getDaysFromMeals();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isAIAssisted ? "AI-Assisted Nutrition Plan" : "Create Nutrition Plan"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrition Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fat Loss Nutrition Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the nutrition plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isTemplate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save as template</FormLabel>
                        <FormDescription>
                          This will save the nutrition plan as a template that can be reused for other clients
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Client</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const startDate = form.getValues().startDate;
                                return date < (startDate || new Date());
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="dailyCalories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Calories</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="proteinPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protein %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              max={100} 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="carbsPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbs %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              max={100} 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fatPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fat %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              max={100} 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {isAIAssisted && (
                  <div className="pt-4">
                    <Button
                      type="button"
                      className="w-full"
                      disabled={isGenerating || !form.getValues().clientId}
                      onClick={generateWithAI}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>Generate with AI</>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      AI will create a personalized nutrition plan based on the client's profile and goals
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Meal Plan</h3>
              
              <Tabs 
                value={activeDayIndex.toString()} 
                onValueChange={(value) => setActiveDayIndex(parseInt(value))}
              >
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="h-auto">
                    {days.map((day, index) => (
                      <TabsTrigger 
                        key={index} 
                        value={index.toString()}
                        className="px-3 py-1.5"
                      >
                        Day {day}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addDay}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Day
                  </Button>
                </div>
                
                {days.map((day, dayIndex) => (
                  <TabsContent key={dayIndex} value={dayIndex.toString()}>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-medium">Day {day} Meals</h4>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addMeal(day)}
                          >
                            <Plus size={16} className="mr-1" />
                            Add Meal
                          </Button>
                        </div>
                        
                        {getMealsForDay(day).length === 0 ? (
                          <div className="text-center py-8 border rounded-lg border-dashed">
                            <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500 dark:text-gray-400">No meals added for this day</p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="mt-4" 
                              onClick={() => addMeal(day)}
                            >
                              <Plus size={16} className="mr-1" />
                              Add Meal
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {getMealsForDay(day).map((meal, index) => {
                              const mealIndex = form.getValues().meals.findIndex(
                                m => m.day === day && m.name === meal.name && m.time === meal.time
                              );
                              
                              return (
                                <div 
                                  key={index} 
                                  className="border rounded-lg p-4 relative"
                                >
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 absolute top-2 right-2"
                                    onClick={() => removeMeal(mealIndex)}
                                  >
                                    <X size={16} />
                                  </Button>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <FormField
                                      control={form.control}
                                      name={`meals.${mealIndex}.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Meal Name</FormLabel>
                                          <FormControl>
                                            <Input placeholder="e.g., Breakfast" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`meals.${mealIndex}.time`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Meal Time</FormLabel>
                                          <Select 
                                            onValueChange={field.onChange}
                                            value={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select a time" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="breakfast">Breakfast</SelectItem>
                                              <SelectItem value="morning_snack">Morning Snack</SelectItem>
                                              <SelectItem value="lunch">Lunch</SelectItem>
                                              <SelectItem value="afternoon_snack">Afternoon Snack</SelectItem>
                                              <SelectItem value="dinner">Dinner</SelectItem>
                                              <SelectItem value="evening_snack">Evening Snack</SelectItem>
                                              <SelectItem value="snack">Snack</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-4 mb-4">
                                    <FormField
                                      control={form.control}
                                      name={`meals.${mealIndex}.calories`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Calories</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min={0} 
                                              {...field} 
                                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`meals.${mealIndex}.protein`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Protein (g)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min={0} 
                                              {...field} 
                                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`meals.${mealIndex}.carbs`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Carbs (g)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min={0} 
                                              {...field} 
                                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`meals.${mealIndex}.fat`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Fat (g)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min={0} 
                                              {...field} 
                                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  
                                  <FormField
                                    control={form.control}
                                    name={`meals.${mealIndex}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Description & Ingredients</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="List the ingredients and preparation instructions" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setLocation('/nutrition')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createNutritionPlanMutation.isPending || updateNutritionPlanMutation.isPending}
            >
              {(createNutritionPlanMutation.isPending || updateNutritionPlanMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Nutrition Plan' : 'Update Nutrition Plan'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
