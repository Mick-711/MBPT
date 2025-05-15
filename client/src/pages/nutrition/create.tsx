import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

// Define the form schema
const nutritionPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().optional(),
  description: z.string().optional(),
  dailyCalories: z.number().min(1000, 'Minimum 1000 calories').max(10000, 'Maximum 10000 calories'),
  proteinPercentage: z.number().min(0, 'Minimum 0%').max(100, 'Maximum 100%'),
  carbsPercentage: z.number().min(0, 'Minimum 0%').max(100, 'Maximum 100%'),
  fatPercentage: z.number().min(0, 'Minimum 0%').max(100, 'Maximum 100%'),
  isTemplate: z.boolean().default(false),
  notes: z.string().optional(),
});

export default function CreateNutrition() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const form = useForm<z.infer<typeof nutritionPlanSchema>>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      dailyCalories: 2000,
      proteinPercentage: 30,
      carbsPercentage: 40,
      fatPercentage: 30,
      isTemplate: false,
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof nutritionPlanSchema>) => {
      return apiRequest('POST', '/api/nutrition-plans', values);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Nutrition plan created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition-plans'] });
      navigate('/nutrition');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create nutrition plan',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: z.infer<typeof nutritionPlanSchema>) => {
    // Ensure percentages add up to 100%
    const total = values.proteinPercentage + values.carbsPercentage + values.fatPercentage;
    if (Math.abs(total - 100) > 1) { // Allow 1% margin of error
      toast({
        title: 'Validation Error',
        description: `Macronutrient percentages must add up to 100%. Current total: ${total}%`,
        variant: 'destructive',
      });
      return;
    }
    
    createMutation.mutate(values);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Nutrition Plan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition Plan Details</CardTitle>
          <CardDescription>
            Create a new nutrition plan for your client or as a template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weight Loss Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch('isTemplate') && (
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingClients}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client: any) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the nutrition plan" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyCalories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Calories: {field.value} kcal</FormLabel>
                    <FormControl>
                      <Slider
                        min={1000}
                        max={5000}
                        step={50}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Macronutrient Distribution</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  Total: {form.watch('proteinPercentage') + form.watch('carbsPercentage') + form.watch('fatPercentage')}% 
                  (should equal 100%)
                </div>

                <FormField
                  control={form.control}
                  name="proteinPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
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
                      <FormLabel>Carbohydrates: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
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
                      <FormLabel>Fats: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the plan"
                        {...field} 
                      />
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Save as Template</FormLabel>
                      <FormDescription>
                        If checked, this plan will be saved as a template that can be used for multiple clients.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/nutrition')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}