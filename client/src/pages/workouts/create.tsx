import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

// Define the form schema
const workoutPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().optional(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isTemplate: z.boolean().default(false),
  workouts: z.array(z.object({
    name: z.string().min(1, 'Workout name is required'),
    description: z.string().optional(),
    day: z.number().min(1, 'Day is required'),
    exercises: z.array(z.object({
      exerciseId: z.string().min(1, 'Exercise is required'),
      sets: z.number().min(1, 'At least 1 set required'),
      reps: z.number().min(1, 'At least 1 rep required'),
      weight: z.number().optional(),
      notes: z.string().optional(),
      order: z.number(),
    })).optional(),
  })).optional(),
});

type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>;

export default function CreateWorkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['/api/exercises'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const form = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      isTemplate: false,
      workouts: [
        {
          name: 'Day 1',
          description: '',
          day: 1,
          exercises: [],
        },
      ],
    },
  });

  const { fields: workoutFields, append: appendWorkout, remove: removeWorkout } = useFieldArray({
    control: form.control,
    name: 'workouts',
  });

  // Exercise field array for the currently active workout
  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control: form.control,
    name: `workouts.${activeWorkoutIndex}.exercises`,
  });

  const createMutation = useMutation({
    mutationFn: async (values: WorkoutPlanFormValues) => {
      return apiRequest('POST', '/api/workout-plans', values);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workout plan created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workout-plans'] });
      navigate('/workouts');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workout plan',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: WorkoutPlanFormValues) => {
    createMutation.mutate(values);
  };

  const addWorkout = () => {
    const newDayNumber = workoutFields.length + 1;
    appendWorkout({
      name: `Day ${newDayNumber}`,
      description: '',
      day: newDayNumber,
      exercises: [],
    });
    // Set active workout to the newly added one
    setActiveWorkoutIndex(workoutFields.length);
  };

  const addExercise = () => {
    appendExercise({
      exerciseId: '',
      sets: 3,
      reps: 10,
      weight: 0,
      notes: '',
      order: exerciseFields.length,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Workout Plan</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>
                Create a new workout plan for your client or as a template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Strength Training Program" {...field} />
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
                        placeholder="Brief description of the workout plan" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!form.watch('isTemplate') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                form.watch("endDate") ? date > form.watch("endDate")! : false
                              }
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
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                form.watch("startDate") ? date < form.watch("startDate")! : false
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="isTemplate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Template</FormLabel>
                      <FormDescription>
                        Save as a reusable template for future clients
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Workouts</h2>
              <Button type="button" onClick={addWorkout} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </div>

            {workoutFields.length > 0 && (
              <Tabs 
                defaultValue="0" 
                value={activeWorkoutIndex.toString()}
                onValueChange={(value) => setActiveWorkoutIndex(parseInt(value))}
                className="w-full"
              >
                <TabsList className="mb-4 flex-wrap h-auto">
                  {workoutFields.map((workout, index) => (
                    <div key={workout.id} className="flex items-center">
                      <TabsTrigger value={index.toString()} className="relative">
                        {form.watch(`workouts.${index}.name`) || `Day ${index + 1}`}
                      </TabsTrigger>
                      {workoutFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 ml-1"
                          onClick={() => {
                            removeWorkout(index);
                            if (activeWorkoutIndex >= index && activeWorkoutIndex > 0) {
                              setActiveWorkoutIndex(activeWorkoutIndex - 1);
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </TabsList>

                {workoutFields.map((workout, workoutIndex) => (
                  <TabsContent key={workout.id} value={workoutIndex.toString()} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Workout Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`workouts.${workoutIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Workout Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Upper Body"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`workouts.${workoutIndex}.day`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Day Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min={1}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`workouts.${workoutIndex}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Details about this workout"
                                  {...field}
                                  value={field.value || ''} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4 mt-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Exercises</h3>
                            <Button 
                              type="button" 
                              onClick={addExercise} 
                              size="sm"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Exercise
                            </Button>
                          </div>

                          {exerciseFields.length === 0 ? (
                            <div className="text-center p-6 bg-muted rounded-md">
                              <p className="text-muted-foreground">No exercises added yet. Click "Add Exercise" to get started.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {exerciseFields.map((exercise, exerciseIndex) => (
                                <Card key={exercise.id}>
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                      <CardTitle className="text-base">Exercise {exerciseIndex + 1}</CardTitle>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeExercise(exerciseIndex)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <FormField
                                        control={form.control}
                                        name={`workouts.${workoutIndex}.exercises.${exerciseIndex}.exerciseId`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Exercise</FormLabel>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              disabled={isLoadingExercises}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select an exercise" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {exercises?.map((ex: any) => (
                                                  <SelectItem key={ex.id} value={ex.id.toString()}>
                                                    {ex.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`workouts.${workoutIndex}.exercises.${exerciseIndex}.sets`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Sets</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`workouts.${workoutIndex}.exercises.${exerciseIndex}.reps`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Reps</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`workouts.${workoutIndex}.exercises.${exerciseIndex}.weight`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number"
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                value={field.value || 0}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`workouts.${workoutIndex}.exercises.${exerciseIndex}.order`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Order</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number"
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <div className="mt-4">
                                      <FormField
                                        control={form.control}
                                        name={`workouts.${workoutIndex}.exercises.${exerciseIndex}.notes`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                              <Textarea 
                                                placeholder="Additional instructions"
                                                {...field}
                                                value={field.value || ''} 
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/workouts')}
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
    </div>
  );
}