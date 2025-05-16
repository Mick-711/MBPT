import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Tag
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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
  "strength",
  "cardio",
  "flexibility",
  "balance",
  "plyometric",
  "functional",
  "sport_specific",
  "rehabilitation",
  "other"
];

const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels"
];

// Sample exercise data
const SAMPLE_EXERCISES = [
  {
    id: 1,
    name: "Barbell Bench Press",
    description: "A compound upper-body exercise that targets the chest muscles.",
    instructions: "Lie on the bench, grip the bar with hands just wider than shoulder-width apart, lower the bar to your chest, and push it back up.",
    muscleGroup: "Chest",
    secondaryMuscleGroups: ["Shoulders", "Triceps"],
    equipment: "Barbell, Bench",
    difficulty: "Intermediate",
    category: "strength",
    videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    imageUrl: null,
    source: "Built-in",
    isPublic: true,
    isTemplate: true,
    tags: ["compound", "strength", "chest"],
    createdAt: "2025-02-15T10:30:00Z",
    updatedAt: "2025-02-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Pull-up",
    description: "A compound upper-body exercise that targets the back muscles.",
    instructions: "Hang from a pull-up bar with palms facing away, pull your body up until your chin is above the bar, then lower back down.",
    muscleGroup: "Back",
    secondaryMuscleGroups: ["Biceps", "Shoulders"],
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    category: "strength",
    videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    imageUrl: null,
    source: "Built-in",
    isPublic: true,
    isTemplate: true,
    tags: ["compound", "bodyweight", "back"],
    createdAt: "2025-02-15T11:00:00Z",
    updatedAt: "2025-02-15T11:00:00Z",
  },
  {
    id: 3,
    name: "Barbell Squat",
    description: "A compound lower-body exercise that primarily targets the quadriceps, hamstrings, and glutes.",
    instructions: "Stand with feet shoulder-width apart, bar resting on upper back, bend knees and hips to lower, then push back up.",
    muscleGroup: "Legs",
    secondaryMuscleGroups: ["Core", "Lower Back"],
    equipment: "Barbell, Squat Rack",
    difficulty: "Intermediate",
    category: "strength",
    videoUrl: "https://www.youtube.com/watch?v=1oed-UmAxFs",
    imageUrl: null,
    source: "Built-in",
    isPublic: true,
    isTemplate: true,
    tags: ["compound", "strength", "lower body"],
    createdAt: "2025-02-15T11:30:00Z",
    updatedAt: "2025-02-15T11:30:00Z",
  },
  {
    id: 4,
    name: "Jogging",
    description: "A moderate-intensity aerobic exercise.",
    instructions: "Move at a steady pace faster than walking but slower than running.",
    muscleGroup: "Legs",
    secondaryMuscleGroups: ["Core", "Cardiovascular System"],
    equipment: "None",
    difficulty: "Beginner",
    category: "cardio",
    videoUrl: null,
    imageUrl: null,
    source: "Built-in",
    isPublic: true,
    isTemplate: true,
    tags: ["cardio", "endurance", "outdoor"],
    createdAt: "2025-02-15T12:00:00Z",
    updatedAt: "2025-02-15T12:00:00Z",
  },
  {
    id: 5,
    name: "Downward Dog",
    description: "A yoga pose that stretches the hamstrings, calves, and shoulders while strengthening the arms and legs.",
    instructions: "Start in plank position, push hips up and back forming an inverted V, press heels toward floor, and relax head between arms.",
    muscleGroup: "Full Body",
    secondaryMuscleGroups: ["Shoulders", "Hamstrings", "Calves"],
    equipment: "Yoga Mat",
    difficulty: "Beginner",
    category: "flexibility",
    videoUrl: "https://www.youtube.com/watch?v=j97SSGsnCAQ",
    imageUrl: null,
    source: "Built-in",
    isPublic: true,
    isTemplate: true,
    tags: ["yoga", "flexibility", "stretch"],
    createdAt: "2025-02-15T12:30:00Z",
    updatedAt: "2025-02-15T12:30:00Z",
  },
];

// Exercise card component for grid view
const ExerciseCard = ({ exercise, onSelect }) => {
  return (
    <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onSelect(exercise)}>
      <div className="h-32 bg-muted flex items-center justify-center">
        {exercise.imageUrl ? (
          <img 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <Dumbbell className="h-16 w-16 text-muted-foreground/30" />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-md mb-1 line-clamp-1">{exercise.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Badge variant="outline" className="text-xs font-normal">
            {exercise.muscleGroup}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {exercise.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {exercise.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default function ExercisesPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  
  // Fetch exercises (simulated)
  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return SAMPLE_EXERCISES;
    }
  });
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };
  
  // Filter and sort exercises
  const filteredExercises = exercises
    ? exercises
        .filter((exercise) => {
          // Apply search filter
          const matchesSearch =
            searchQuery === "" ||
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exercise.description && exercise.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (exercise.tags && exercise.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            
          // Apply muscle group filter
          const matchesMuscleGroup =
            muscleGroupFilter === "all" || exercise.muscleGroup === muscleGroupFilter;
            
          // Apply category filter
          const matchesCategory =
            categoryFilter === "all" || exercise.category === categoryFilter;
            
          // Apply difficulty filter
          const matchesDifficulty =
            difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
            
          return matchesSearch && matchesMuscleGroup && matchesCategory && matchesDifficulty;
        })
        .sort((a, b) => {
          // Handle sorting
          if (sortField === "name") {
            return sortDirection === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
          if (sortField === "muscleGroup") {
            return sortDirection === "asc"
              ? a.muscleGroup.localeCompare(b.muscleGroup)
              : b.muscleGroup.localeCompare(a.muscleGroup);
          }
          if (sortField === "difficulty") {
            return sortDirection === "asc"
              ? a.difficulty.localeCompare(b.difficulty)
              : b.difficulty.localeCompare(a.difficulty);
          }
          if (sortField === "category") {
            return sortDirection === "asc"
              ? a.category.localeCompare(b.category)
              : b.category.localeCompare(a.category);
          }
          return 0;
        })
    : [];
    
  // Handle exercise selection
  const handleSelectExercise = (exercise) => {
    setLocation(`/exercises/${exercise.id}`);
  };
  
  // Format category name for display
  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-muted-foreground">
            Manage and browse your exercise collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLocation("/exercises/import")}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setLocation("/exercises/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Exercise
          </Button>
        </div>
      </div>
      
      {/* Exercise Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exercises?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                In your exercise library
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Strength Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exercises?.filter(e => e.category === 'strength').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Most used category
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Custom Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exercises?.filter(e => e.source !== 'Built-in').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Created by you
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Template Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exercises?.filter(e => e.isTemplate).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to use templates
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          
          <div className="flex flex-wrap gap-3">
            <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Muscle Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscle Groups</SelectItem>
                {MUSCLE_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXERCISE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Exercise List */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex gap-2 mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Muscle Group</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-md">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No exercises found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create a new exercise
          </p>
          <Button onClick={() => setLocation("/exercises/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Exercise
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onSelect={handleSelectExercise} 
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("muscleGroup")}
                  >
                    Muscle Group {getSortIcon("muscleGroup")}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    Category {getSortIcon("category")}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("difficulty")}
                  >
                    Difficulty {getSortIcon("difficulty")}
                  </div>
                </TableHead>
                <TableHead align="right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Dumbbell className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      {exercise.name}
                    </div>
                  </TableCell>
                  <TableCell>{exercise.muscleGroup}</TableCell>
                  <TableCell>{formatCategoryName(exercise.category)}</TableCell>
                  <TableCell>{exercise.difficulty}</TableCell>
                  <TableCell align="right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/exercises/${exercise.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/exercises/${exercise.id}/edit`)}>
                          Edit Exercise
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Add ${exercise.name} to workout`)}>
                          Add to Workout
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => confirm(`Are you sure you want to delete ${exercise.name}?`)}
                        >
                          Delete Exercise
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}