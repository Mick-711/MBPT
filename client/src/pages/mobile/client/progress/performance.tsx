import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  BarChart3, 
  LineChart, 
  Trophy, 
  Dumbbell,
  ArrowUpRight
} from 'lucide-react';

// Define interfaces for type safety
interface RepMax {
  exerciseId: number;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface ExercisePerformance {
  exerciseId: number;
  exerciseName: string;
  category: string;
  muscleGroup: string;
  weightData: DataPoint[];
  volumeData: DataPoint[];
}

interface DataPoint {
  date: string;
  value: number;
}

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  category: string;
}

// The chart component would be a representation of performance data
function PerformanceChart({ 
  data, 
  title, 
  color = "primary" 
}: { 
  data: DataPoint[], 
  title: string, 
  color?: string 
}) {
  // This is a placeholder for a real chart component
  // In a real implementation, you'd use a library like Recharts
  
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-md">
        <div className="text-center text-muted-foreground">
          <LineChart className="h-12 w-12 mx-auto mb-2" />
          <p>No data available</p>
        </div>
      </div>
    );
  }
  
  // Find the max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const colorClass = color === "primary" ? "bg-primary" : 
                    color === "blue" ? "bg-blue-500" : 
                    color === "green" ? "bg-green-500" : 
                    color === "amber" ? "bg-amber-500" : "bg-primary";
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="h-64 relative rounded-md bg-muted/50 p-4 flex items-end space-x-2">
        {data.map((point, i) => (
          <div 
            key={i} 
            className="flex flex-col items-center justify-end flex-1"
          >
            <div 
              className={`${colorClass} rounded-t-sm w-full`} 
              style={{ 
                height: `${(point.value / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs mt-1 text-muted-foreground">
              {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm">
        <span>Start: {data[0].value}kg</span>
        <span>Current: {data[data.length - 1].value}kg</span>
        <span className="flex items-center text-green-500">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          {Math.round(((data[data.length - 1].value - data[0].value) / data[0].value) * 100)}%
        </span>
      </div>
    </div>
  );
}

// Component to display personal records by rep range
function PersonalRecords({ repMaxes }: { repMaxes: RepMax[] }) {
  // Group by exercise and find best for each rep range
  const exerciseRecords: Record<string, Record<number, RepMax>> = {};
  
  repMaxes.forEach(record => {
    if (!exerciseRecords[record.exerciseName]) {
      exerciseRecords[record.exerciseName] = {};
    }
    
    // Only keep the highest weight for each rep range
    if (!exerciseRecords[record.exerciseName][record.reps] || 
        exerciseRecords[record.exerciseName][record.reps].weight < record.weight) {
      exerciseRecords[record.exerciseName][record.reps] = record;
    }
  });
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Trophy className="h-5 w-5 text-amber-500 mr-2" />
        Personal Records
      </h3>
      
      {Object.entries(exerciseRecords).map(([exercise, records]) => (
        <Card key={exercise} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{exercise}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {[1, 3, 5, 8, 10].map(reps => (
                <div 
                  key={reps} 
                  className={`p-2 text-center rounded-md ${
                    records[reps] ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted'
                  }`}
                >
                  <p className="text-xs text-muted-foreground">{reps}RM</p>
                  <p className="font-medium">{records[reps] ? `${records[reps].weight}kg` : '-'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main Exercise Performance Component
function ExercisePerformanceView({ performances }: { performances: ExercisePerformance[] }) {
  const [selectedExercise, setSelectedExercise] = useState<string>(
    performances.length > 0 ? String(performances[0].exerciseId) : ''
  );
  
  const exercise = performances.find(p => String(p.exerciseId) === selectedExercise);
  
  // Group by muscle group for the select dropdown
  const muscleGroups: Record<string, Exercise[]> = {};
  performances.forEach(p => {
    if (!muscleGroups[p.muscleGroup]) {
      muscleGroups[p.muscleGroup] = [];
    }
    muscleGroups[p.muscleGroup].push({
      id: p.exerciseId,
      name: p.exerciseName,
      muscleGroup: p.muscleGroup,
      category: p.category
    });
  });
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Exercise</label>
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger>
            <SelectValue placeholder="Select an exercise" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(muscleGroups).map(([group, exercises]) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {exercises.map(exercise => (
                  <SelectItem key={exercise.id} value={String(exercise.id)}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {exercise ? (
        <div className="space-y-8">
          <PerformanceChart 
            data={exercise.weightData} 
            title="Weight Progression (kg)" 
            color="blue"
          />
          
          <PerformanceChart 
            data={exercise.volumeData} 
            title="Volume Progression (kg)" 
            color="green"
          />
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Exercise Selected</h3>
          <p className="text-muted-foreground mb-4">
            Select an exercise to view performance data
          </p>
        </div>
      )}
    </div>
  );
}

// Volume Tracking by Muscle Group
function MuscleGroupVolume({ performances }: { performances: ExercisePerformance[] }) {
  const muscleGroups = [...new Set(performances.map(p => p.muscleGroup))];
  const [selectedGroup, setSelectedGroup] = useState<string>(
    muscleGroups.length > 0 ? muscleGroups[0] : ''
  );
  
  // Calculate total volume per week for selected muscle group
  // This would be more complex in a real application
  const weeklyVolume: DataPoint[] = [
    { date: '2025-05-01', value: 3200 },
    { date: '2025-05-08', value: 3600 },
    { date: '2025-05-15', value: 3400 },
    { date: '2025-05-22', value: 4100 },
    { date: '2025-05-29', value: 4500 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Muscle Group</label>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger>
            <SelectValue placeholder="Select a muscle group" />
          </SelectTrigger>
          <SelectContent>
            {muscleGroups.map(group => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <PerformanceChart 
        data={weeklyVolume} 
        title={`Weekly Volume: ${selectedGroup}`} 
        color="amber"
      />
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Volume Breakdown</CardTitle>
          <CardDescription>Exercises contributing to {selectedGroup} volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performances
              .filter(p => p.muscleGroup === selectedGroup)
              .map(exercise => (
                <div key={exercise.exerciseId} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span>{exercise.exerciseName}</span>
                  <span className="font-medium">
                    {exercise.volumeData.length > 0 ? 
                      exercise.volumeData[exercise.volumeData.length-1].value : 0}kg
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('records');
  
  // Fetch performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['/api/client/performance'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Extract with safe fallbacks
  const repMaxes: RepMax[] = performanceData?.repMaxes || [];
  const performances: ExercisePerformance[] = performanceData?.performances || [];
  
  return (
    <div className="container mx-auto p-4 max-w-lg pb-16">
      <div className="flex items-center mb-6">
        <Link href="/progress">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Lifting Performance</h1>
      </div>

      <Tabs defaultValue="records" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>
        
        {/* Personal Records Tab */}
        <TabsContent value="records" className="space-y-6">
          {repMaxes.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Personal Records</h3>
              <p className="text-muted-foreground mb-4">
                Complete workouts to establish your personal records
              </p>
            </div>
          ) : (
            <PersonalRecords repMaxes={repMaxes} />
          )}
        </TabsContent>
        
        {/* Exercise Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {performances.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <LineChart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Exercise Data</h3>
              <p className="text-muted-foreground mb-4">
                Log workouts to see your progress over time
              </p>
            </div>
          ) : (
            <ExercisePerformanceView performances={performances} />
          )}
        </TabsContent>
        
        {/* Volume Analysis Tab */}
        <TabsContent value="volume" className="space-y-6">
          {performances.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Volume Data</h3>
              <p className="text-muted-foreground mb-4">
                Log workouts to track your training volume
              </p>
            </div>
          ) : (
            <MuscleGroupVolume performances={performances} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}