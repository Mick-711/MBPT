import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Copy,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Sample data for the workouts list
const SAMPLE_WORKOUTS = [
  {
    id: 1,
    name: "Strength Foundation",
    type: "strength",
    difficulty: "intermediate",
    duration: 45,
    exercises: 8,
    targetMuscles: ["chest", "shoulders", "triceps"],
    createdAt: "2025-03-15",
    isTemplate: true,
    assignedClients: 4
  },
  {
    id: 2,
    name: "HIIT Cardio Blast",
    type: "cardio",
    difficulty: "advanced",
    duration: 30,
    exercises: 12,
    targetMuscles: ["full body", "core"],
    createdAt: "2025-03-28",
    isTemplate: true,
    assignedClients: 7
  },
  {
    id: 3,
    name: "Recovery Day Mobility",
    type: "mobility",
    difficulty: "beginner",
    duration: 25,
    exercises: 6,
    targetMuscles: ["hips", "shoulders", "spine"],
    createdAt: "2025-04-05",
    isTemplate: true,
    assignedClients: 9
  },
  {
    id: 4,
    name: "Lower Body Focus",
    type: "strength",
    difficulty: "intermediate",
    duration: 50,
    exercises: 7,
    targetMuscles: ["quads", "hamstrings", "glutes"],
    createdAt: "2025-04-12",
    isTemplate: true,
    assignedClients: 5
  },
  {
    id: 5,
    name: "Mick's Custom Plan",
    type: "strength",
    difficulty: "intermediate",
    duration: 40,
    exercises: 6,
    targetMuscles: ["chest", "back", "core"],
    createdAt: "2025-05-01",
    isTemplate: false,
    assignedClients: 1,
    clientId: 1
  },
];

// Save sample workouts to localStorage if not exists
const initializeWorkoutsStorage = () => {
  const storedWorkouts = localStorage.getItem("fitTrainPro_workouts");
  if (!storedWorkouts) {
    localStorage.setItem("fitTrainPro_workouts", JSON.stringify(SAMPLE_WORKOUTS));
  }
};

// Workout type badge component
const WorkoutTypeBadge = ({ type }: { type: string }) => {
  const typeStyles = {
    strength: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    cardio: "bg-red-100 text-red-800 hover:bg-red-200",
    mobility: "bg-green-100 text-green-800 hover:bg-green-200",
    flexibility: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    balance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    custom: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return (
    <Badge
      className={
        typeStyles[type as keyof typeof typeStyles] ||
        "bg-gray-100 text-gray-800"
      }
      variant="outline"
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

// Difficulty badge component
const DifficultyBadge = ({ level }: { level: string }) => {
  const difficultyStyles = {
    beginner: "bg-green-100 text-green-800 border-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    advanced: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge
      className={
        difficultyStyles[level as keyof typeof difficultyStyles] ||
        "bg-gray-100 text-gray-800"
      }
      variant="outline"
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

// Workouts overview metrics component
const WorkoutsOverview = ({ workoutsData }: { workoutsData: typeof SAMPLE_WORKOUTS }) => {
  const totalTemplates = workoutsData.filter(w => w.isTemplate).length;
  const totalClientWorkouts = workoutsData.filter(w => !w.isTemplate).length;
  const uniqueExercises = new Set(
    workoutsData.flatMap(w => w.targetMuscles)
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{workoutsData.length}</div>
          <p className="text-xs text-muted-foreground">
            {totalTemplates} templates, {totalClientWorkouts} custom
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(workoutsData.filter(w => !w.isTemplate).map(w => w.clientId)).size}
          </div>
          <p className="text-xs text-muted-foreground">
            With assigned workouts
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Muscle Groups</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueExercises}</div>
          <p className="text-xs text-muted-foreground">
            Targeted across all workouts
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Workout card component for grid view
const WorkoutCard = ({ workout }: { workout: typeof SAMPLE_WORKOUTS[0] }) => {
  const [, setLocation] = useLocation();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{workout.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocation(`/workouts/${workout.id}`)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation(`/workouts/edit/${workout.id}`)}>
                <Edit className="mr-2 h-4 w-4" />Edit Workout
              </DropdownMenuItem>
              {workout.isTemplate && (
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(workout.createdAt), "MMM d, yyyy")}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <WorkoutTypeBadge type={workout.type} />
          <DifficultyBadge level={workout.difficulty} />
          {!workout.isTemplate && <Badge variant="outline">Custom</Badge>}
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{workout.duration} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exercises:</span>
            <span>{workout.exercises}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target:</span>
            <span className="text-right">{workout.targetMuscles.join(", ")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {workout.isTemplate ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setLocation(`/workouts/assign/${workout.id}`)}
          >
            Assign to Client
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => setLocation(`/workouts/${workout.id}`)}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function WorkoutsListPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [templateFilter, setTemplateFilter] = useState<"all" | "templates" | "custom">("all");

  // Initialize workouts storage with sample data if empty
  initializeWorkoutsStorage();

  // Get workouts from local storage
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Get workouts from local storage
      const storedWorkouts = localStorage.getItem("fitTrainPro_workouts");
      return storedWorkouts ? JSON.parse(storedWorkouts) : [];
    },
  });

  // Filter workouts
  const filteredWorkouts = workouts
    ? workouts
        .filter((workout) => {
          // Apply search filter
          const matchesSearch =
            workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workout.targetMuscles.some((muscle: string) =>
              muscle.toLowerCase().includes(searchQuery.toLowerCase())
            );

          // Apply type filter
          const matchesType =
            typeFilter === "all" || workout.type === typeFilter;
            
          // Apply template/custom filter
          const matchesTemplate = 
            templateFilter === "all" ||
            (templateFilter === "templates" && workout.isTemplate) ||
            (templateFilter === "custom" && !workout.isTemplate);

          return matchesSearch && matchesType && matchesTemplate;
        })
    : [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
        <Button onClick={() => setLocation("/workouts/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workout
        </Button>
      </div>

      {/* Overview cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <WorkoutsOverview workoutsData={workouts || []} />
      )}

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex w-full md:w-auto flex-wrap items-center gap-2">
          <Input
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[250px]"
          />
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="mobility">Mobility</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={templateFilter}
            onValueChange={(value) => setTemplateFilter(value as "all" | "templates" | "custom")}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workouts</SelectItem>
              <SelectItem value="templates">Templates</SelectItem>
              <SelectItem value="custom">Custom Plans</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-9"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-9"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && filteredWorkouts.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No workouts found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create a new workout
          </p>
          <Button onClick={() => setLocation("/workouts/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workout
          </Button>
        </div>
      )}

      {/* Grid view */}
      {!isLoading && filteredWorkouts.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}

      {/* List view */}
      {!isLoading && filteredWorkouts.length > 0 && viewMode === "list" && (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Exercises</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {workout.name}
                      {!workout.isTemplate && <Badge variant="outline" className="ml-2">Custom</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <WorkoutTypeBadge type={workout.type} />
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge level={workout.difficulty} />
                  </TableCell>
                  <TableCell>{workout.duration} min</TableCell>
                  <TableCell>{workout.exercises}</TableCell>
                  <TableCell>{format(new Date(workout.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/workouts/${workout.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/workouts/edit/${workout.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />Edit Workout
                        </DropdownMenuItem>
                        {workout.isTemplate && (
                          <>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/workouts/assign/${workout.id}`)}>
                              <Users className="mr-2 h-4 w-4" />Assign to Client
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />Delete
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