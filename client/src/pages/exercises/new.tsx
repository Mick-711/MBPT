import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { addExerciseToStorage } from "@/lib/exerciseStorageHelpers";
import { Dumbbell, ArrowLeft } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";

// Define muscle groups and categories
const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Full Body",
  "Other"
];

const EXERCISE_CATEGORIES = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" },
  { value: "plyometric", label: "Plyometric" },
  { value: "functional", label: "Functional" },
  { value: "sport_specific", label: "Sport Specific" },
  { value: "rehabilitation", label: "Rehabilitation" },
  { value: "other", label: "Other" }
];

const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate", 
  "Advanced",
  "All Levels"
];

const SECONDARY_MUSCLES = [
  { value: "Chest", label: "Chest" },
  { value: "Upper Back", label: "Upper Back" },
  { value: "Lats", label: "Lats" },
  { value: "Lower Back", label: "Lower Back" },
  { value: "Shoulders", label: "Shoulders" },
  { value: "Biceps", label: "Biceps" },
  { value: "Triceps", label: "Triceps" },
  { value: "Forearms", label: "Forearms" },
  { value: "Quadriceps", label: "Quadriceps" },
  { value: "Hamstrings", label: "Hamstrings" },
  { value: "Glutes", label: "Glutes" },
  { value: "Calves", label: "Calves" },
  { value: "Abs", label: "Abs" },
  { value: "Obliques", label: "Obliques" },
  { value: "Cardiovascular System", label: "Cardiovascular System" }
];

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Cable Machine",
  "Resistance Band",
  "Machine",
  "Bodyweight",
  "Smith Machine",
  "TRX/Suspension",
  "Medicine Ball",
  "Stability Ball",
  "Foam Roller",
  "Bench",
  "Pull-up Bar",
  "Yoga Mat",
  "Treadmill",
  "Stationary Bike",
  "Elliptical",
  "Rowing Machine",
  "None",
  "Other"
];

// Create form schema
const exerciseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  instructions: z.string().min(10, { message: "Instructions should be detailed" }),
  muscleGroup: z.string({ required_error: "Please select the primary muscle group" }),
  secondaryMuscleGroups: z.array(z.string()).optional(),
  equipment: z.string().optional(),
  difficulty: z.string({ required_error: "Please select a difficulty level" }),
  category: z.string({ required_error: "Please select a category" }),
  videoUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  source: z.string().optional(),
  isPublic: z.boolean().default(false),
  isTemplate: z.boolean().default(true),
  tags: z.string().optional(),
});

// Tag input component
const TagInput = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  
  const tags = value ? value.split(",").map(tag => tag.trim()).filter(Boolean) : [];
  
  const addTag = () => {
    if (inputValue.trim()) {
      const newTags = [...tags, inputValue.trim()];
      onChange(newTags.join(", "));
      setInputValue("");
    }
  };
  
  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags.join(", "));
  };
  
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a tag and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addTag}>Add</Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <div key={index} className="bg-muted px-2 py-1 rounded-md flex items-center gap-1">
            <span className="text-sm">{tag}</span>
            <button 
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => removeTag(tag)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function NewExercisePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      instructions: "",
      muscleGroup: undefined,
      secondaryMuscleGroups: [],
      equipment: "",
      difficulty: undefined,
      category: "strength",
      videoUrl: "",
      imageUrl: "",
      source: "Custom",
      isPublic: false,
      isTemplate: true,
      tags: "",
    },
  });
  
  // Submit handler
  const onSubmit = async (data: z.infer<typeof exerciseSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert tags string to array
      const tagsArray = data.tags 
        ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) 
        : [];
      
      // Create exercise object
      const exerciseData = {
        ...data,
        tags: tagsArray,
        secondaryMuscleGroups: data.secondaryMuscleGroups || [],
        videoUrl: data.videoUrl || null,
        imageUrl: data.imageUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save to local storage using our helper function
      const newExercise = addExerciseToStorage(exerciseData);
      
      // Update React Query cache to include the new exercise
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      
      // Show success toast
      toast({
        title: "Exercise created",
        description: `${data.name} has been added to your exercise library.`,
      });
      
      // Navigate back to exercise library
      setLocation("/exercises");
    } catch (error) {
      console.error("Error creating exercise:", error);
      toast({
        title: "Error",
        description: "There was an error creating the exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => setLocation("/exercises")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Exercise</h1>
          <p className="text-muted-foreground">
            Add a custom exercise to your library
          </p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the fundamental details of the exercise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Barbell Bench Press" {...field} />
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
                        <Textarea 
                          placeholder="Brief description of the exercise"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {EXERCISE_CATEGORIES.map((category) => (
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
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIFFICULTY_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="muscleGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Muscle Group*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select muscle group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MUSCLE_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
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
                    name="secondaryMuscleGroups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Muscle Groups</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={SECONDARY_MUSCLES}
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder="Select secondary muscles"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EQUIPMENT_OPTIONS.map((equipment) => (
                            <SelectItem key={equipment} value={equipment}>
                              {equipment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Exercise Details</CardTitle>
                <CardDescription>
                  Provide detailed instructions and media for the exercise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Step-by-step instructions to perform the exercise correctly"
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include detailed steps, form cues, and breathing instructions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.youtube.com/watch?v=example" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Link to a demonstration video (YouTube, Vimeo, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/exercise-image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Link to an image showing the exercise
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Add relevant tags to help with searching and categorization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>
                  Configure additional settings for this exercise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Where did this exercise come from? (e.g., Custom, Book, Website)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FormLabel>Use as Template</FormLabel>
                            <FormDescription>
                              Make this exercise available as a template for workouts
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Make Public</FormLabel>
                            <FormDescription>
                              Share this exercise with other trainers in your organization
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setLocation("/exercises")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Exercise"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}