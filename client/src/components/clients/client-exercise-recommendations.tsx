import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dumbbell, 
  ArrowRight, 
  Calendar, 
  BarChart, 
  Users, 
  Package, 
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Star,
  Info,
  PlayCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

import { ClientProfileData, ExerciseRecommendation, generateExerciseRecommendations, generateDailyWorkout, generateWeeklyWorkoutPlan } from "@/lib/recommendationEngine";
import { getClientsFromStorage } from "@/lib/localStorageHelpers";

// Days of week array
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Exercise Card Component
const ExerciseCard = ({ 
  recommendation, 
  onLike, 
  onDislike, 
  showReasons = false 
}: { 
  recommendation: ExerciseRecommendation; 
  onLike?: () => void; 
  onDislike?: () => void;
  showReasons?: boolean;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const { exercise, score, matchReason, tags } = recommendation;
  const scorePercentage = Math.min(Math.round((score / 40) * 100), 100);
  
  return (
    <Card className={`relative overflow-hidden transition-all ${showDetails ? 'h-auto' : 'h-[320px]'}`}>
      {scorePercentage >= 80 && (
        <div className="absolute top-0 right-0">
          <Badge variant="default" className="m-2 bg-yellow-500">
            <Star className="h-3 w-3 mr-1 fill-current" /> Top Match
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Dumbbell className="h-5 w-5 mr-2" />
          {exercise.name}
        </CardTitle>
        <CardDescription>
          {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)} • {exercise.difficulty}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Match Score</span>
            <span className="font-medium">{scorePercentage}%</span>
          </div>
          <Progress value={scorePercentage} className="h-2" />
        </div>
        
        <div className="mb-3">
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-primary/10">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="bg-secondary/20">
              {exercise.muscleGroup}
            </Badge>
            {exercise.secondaryMuscleGroups.slice(0, 2).map((muscle, i) => (
              <Badge key={i} variant="outline" className="bg-muted/40">
                {muscle}
              </Badge>
            ))}
          </div>
          
          <div className="text-sm mb-3">
            <p className="line-clamp-2">{exercise.description}</p>
          </div>
          
          {showDetails && (
            <>
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">Equipment</h4>
                <p className="text-sm">{exercise.equipment}</p>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">Instructions</h4>
                <p className="text-sm">{exercise.instructions}</p>
              </div>
              
              {showReasons && matchReason.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Why we recommended this</h4>
                  <ul className="text-sm list-disc pl-5">
                    {matchReason.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Show Less" : "Show More"}
        </Button>
        
        {(onLike || onDislike) && (
          <div className="flex gap-2">
            {onDislike && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onDislike}
                className="h-8 w-8"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            )}
            
            {onLike && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onLike}
                className="h-8 w-8"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

// Daily Workout Component
const DailyWorkout = ({ 
  workout, 
  date, 
  onSave 
}: { 
  workout: { 
    warmup: ExerciseRecommendation[]; 
    main: ExerciseRecommendation[]; 
    finisher: ExerciseRecommendation[]; 
    cooldown: ExerciseRecommendation[];
  }; 
  date: Date; 
  onSave?: () => void;
}) => {
  const dayName = DAYS_OF_WEEK[date.getDay()];
  const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{dayName}</h3>
          <p className="text-muted-foreground">{dateString}</p>
        </div>
        
        {onSave && (
          <Button onClick={onSave} size="sm">
            Save Workout
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {workout.warmup.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Warm-up</Badge>
              <Separator className="ml-3 flex-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workout.warmup.map((recommendation, i) => (
                <ExerciseCard 
                  key={i} 
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>
        )}
        
        {workout.main.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500">Main Workout</Badge>
              <Separator className="ml-3 flex-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workout.main.map((recommendation, i) => (
                <ExerciseCard 
                  key={i} 
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>
        )}
        
        {workout.finisher.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Finisher</Badge>
              <Separator className="ml-3 flex-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workout.finisher.map((recommendation, i) => (
                <ExerciseCard 
                  key={i} 
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>
        )}
        
        {workout.cooldown.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Cooldown</Badge>
              <Separator className="ml-3 flex-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workout.cooldown.map((recommendation, i) => (
                <ExerciseCard 
                  key={i} 
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Weekly Plan Component
const WeeklyPlan = ({ 
  plan 
}: { 
  plan: Record<number, any>;
}) => {
  const currentDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(
    // Default to current day if it's a training day, otherwise first training day
    Object.keys(plan).includes(currentDay.toString()) 
      ? currentDay 
      : parseInt(Object.keys(plan)[0])
  );
  
  // Get date for the selected day
  const getDateForDay = (day: number) => {
    const today = new Date();
    const diff = day - today.getDay();
    const date = new Date(today);
    date.setDate(date.getDate() + diff);
    return date;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex overflow-x-auto pb-2 mb-2">
        {Object.keys(plan).map((day) => {
          const dayNum = parseInt(day);
          const date = getDateForDay(dayNum);
          const isToday = dayNum === currentDay;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(dayNum)}
              className={`flex flex-col items-center min-w-[4rem] p-2 rounded-md mr-2 border ${
                selectedDay === dayNum 
                  ? 'border-primary bg-primary/5' 
                  : 'border-transparent hover:bg-muted/30'
              } ${
                isToday ? 'ring-1 ring-primary' : ''
              }`}
            >
              <span className="text-xs font-medium">{DAYS_OF_WEEK[dayNum].slice(0, 3)}</span>
              <span className="text-lg font-bold">{date.getDate()}</span>
              {isToday && <Badge variant="outline" className="mt-1 text-xs">Today</Badge>}
            </button>
          );
        })}
      </div>
      
      {plan[selectedDay] && (
        <DailyWorkout 
          workout={plan[selectedDay]} 
          date={getDateForDay(selectedDay)}
          onSave={() => {
            // Save functionality would go here
            console.log("Saving workout for day", selectedDay);
          }}
        />
      )}
    </div>
  );
};

// Main Client Exercise Recommendations Component
export function ClientExerciseRecommendations({ 
  clientId 
}: { 
  clientId: number;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recommendations");
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [dailyWorkout, setDailyWorkout] = useState<any>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<Record<number, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: [`client-${clientId}`],
    queryFn: async () => {
      const clients = getClientsFromStorage();
      return clients.find(c => c.id === clientId);
    }
  });
  
  // Generate recommendations on component mount or when client changes
  useEffect(() => {
    if (client) {
      generateRecommendations();
    }
  }, [client]);
  
  // Generate exercise recommendations
  const generateRecommendations = () => {
    if (!client) return;
    
    setIsGenerating(true);
    
    // Convert client data to format expected by recommendation engine
    const clientProfileData: ClientProfileData = {
      id: client.id,
      userId: client.id, // Using same ID for demo purposes
      age: client.age,
      height: client.height,
      weight: client.weight,
      fitnessLevel: client.fitnessLevel || 'beginner',
      goals: client.goals || ['general_fitness'],
      healthConditions: client.healthConditions || [],
      preferredTrainingDays: client.preferredTrainingDays || ['monday', 'wednesday', 'friday'],
      preferredExerciseTypes: client.preferredExerciseTypes || ['strength', 'cardio'],
      equipmentAccess: client.equipmentAccess || ['dumbbells', 'resistance bands'],
      trainerId: client.trainerId,
      trainingLocation: client.trainingLocation || 'home',
      trainingFrequency: client.trainingFrequency || 3
    };
    
    // Generate recommendations with a delay to simulate processing
    setTimeout(() => {
      // Generate top exercise recommendations
      const newRecommendations = generateExerciseRecommendations(clientProfileData, 12);
      setRecommendations(newRecommendations);
      
      // Generate daily workout for today
      const today = new Date().getDay();
      const workout = generateDailyWorkout(clientProfileData, today);
      setDailyWorkout(workout);
      
      // Generate weekly plan
      const plan = generateWeeklyWorkoutPlan(clientProfileData);
      setWeeklyPlan(plan);
      
      setIsGenerating(false);
      
      toast({
        title: "Recommendations Generated",
        description: `Generated ${newRecommendations.length} personalized exercise recommendations for ${client.firstName}.`,
      });
    }, 1500);
  };
  
  // Handle like/dislike functionality
  const handleLike = (recommendationId: number) => {
    toast({
      title: "Exercise Liked",
      description: "We'll show more exercises like this in the future.",
    });
    
    // In a real app, would send this feedback to the server to improve recommendations
  };
  
  const handleDislike = (recommendationId: number) => {
    toast({
      title: "Exercise Removed",
      description: "We'll show fewer exercises like this in the future.",
    });
    
    // Remove from recommendations
    setRecommendations(recommendations.filter((_, i) => i !== recommendationId));
    
    // In a real app, would send this feedback to the server to improve recommendations
  };
  
  // If client is loading or not found
  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading client data...</p>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Client not found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exercise Recommendations</h2>
          <p className="text-muted-foreground">
            Personalized exercise recommendations for {client.firstName} {client.lastName}
          </p>
        </div>
        
        <Button 
          onClick={generateRecommendations} 
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? "Generating..." : "Refresh Recommendations"}
        </Button>
      </div>
      
      <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Fitness Level</div>
              <div className="text-sm">{client.fitnessLevel || "Beginner"}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Training Days</div>
              <div className="text-sm">{client.preferredTrainingDays?.length || 3} days/week</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Equipment Access</div>
              <div className="text-sm">
                {client.equipmentAccess?.join(", ") || "Limited equipment"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Goals</div>
              <div className="text-sm">
                {client.goals ? (Array.isArray(client.goals) ? client.goals.map((g: string) => g.replace('_', ' ')).join(", ") : client.goals) : "General fitness"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Top Recommendations</TabsTrigger>
          <TabsTrigger value="today">Today's Workout</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, i) => (
                <ExerciseCard 
                  key={i} 
                  recommendation={recommendation}
                  onLike={() => handleLike(i)}
                  onDislike={() => handleDislike(i)}
                  showReasons={true}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <RefreshCw className={`h-10 w-10 mb-4 text-muted-foreground ${isGenerating ? 'animate-spin' : ''}`} />
                <h3 className="text-lg font-medium mb-1">
                  {isGenerating ? "Generating recommendations..." : "No recommendations found"}
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {isGenerating 
                    ? "Our AI is analyzing client profile and preferences to create personalized exercise recommendations."
                    : "Click the Refresh Recommendations button to generate personalized exercises."}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="today" className="space-y-4">
          {dailyWorkout ? (
            <DailyWorkout 
              workout={dailyWorkout} 
              date={new Date()} 
              onSave={() => {
                toast({
                  title: "Workout Saved",
                  description: "Today's workout has been saved to your client's calendar.",
                });
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className={`h-10 w-10 mb-4 text-muted-foreground ${isGenerating ? 'animate-spin' : ''}`} />
              <h3 className="text-lg font-medium mb-1">
                {isGenerating ? "Generating today's workout..." : "No workout available"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {isGenerating 
                  ? "We're crafting a balanced workout for today based on client's goals and preferences."
                  : "Click the Refresh Recommendations button to generate a workout for today."}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          {Object.keys(weeklyPlan).length > 0 ? (
            <WeeklyPlan plan={weeklyPlan} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className={`h-10 w-10 mb-4 text-muted-foreground ${isGenerating ? 'animate-spin' : ''}`} />
              <h3 className="text-lg font-medium mb-1">
                {isGenerating ? "Generating weekly plan..." : "No weekly plan available"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {isGenerating 
                  ? "Our AI is creating a balanced weekly training plan based on client's schedule and goals."
                  : "Click the Refresh Recommendations button to generate a weekly workout plan."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 p-4 bg-muted/30 border rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="text-sm font-medium mb-1">About Exercise Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              These exercise recommendations are generated based on {client.firstName}'s profile, fitness level, goals, and preferences.
              The AI recommendation engine analyzes their needs and matches them with suitable exercises from your library.
              Recommendations adapt as the client progresses and provides feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}