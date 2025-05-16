import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Plus, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  ListChecks,
  Settings,
  CalendarCheck,
  Trophy,
  Check
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for type safety
interface Habit {
  id: number;
  name: string;
  target: number;
  value: number;
  unit: string;
  streak: number;
  completed: boolean;
  icon: string;
  active: boolean;
  lastUpdated: string;
}

interface HabitType {
  id: number;
  name: string;
  defaultTarget: number;
  unit: string;
  icon: string;
  category: string;
}

// The habit card component for the main habit list
function HabitCard({ 
  habit, 
  onUpdate, 
  onDelete 
}: { 
  habit: Habit, 
  onUpdate: (id: number, value: number) => void,
  onDelete: (id: number) => void
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newValue, setNewValue] = useState(habit.value.toString());
  const { toast } = useToast();

  const handleUpdate = () => {
    const parsedValue = parseInt(newValue);
    if (isNaN(parsedValue) || parsedValue < 0) {
      toast({
        title: 'Invalid value',
        description: 'Please enter a valid positive number',
        variant: 'destructive'
      });
      return;
    }

    onUpdate(habit.id, parsedValue);
    setIsUpdating(false);
  };

  return (
    <Card key={habit.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            {habit.icon === 'water' && <Droplets className="h-5 w-5 text-blue-500 mr-2" />}
            {habit.icon === 'steps' && <Footprints className="h-5 w-5 text-green-500 mr-2" />}
            {habit.icon === 'workout' && <Dumbbell className="h-5 w-5 text-purple-500 mr-2" />}
            {habit.icon === 'check' && <Check className="h-5 w-5 text-amber-500 mr-2" />}
            {!['water', 'steps', 'workout', 'check'].includes(habit.icon) && 
              <ListChecks className="h-5 w-5 text-primary mr-2" />}
            {habit.name}
          </CardTitle>
          <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
            {habit.streak} day streak
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="mt-1 mb-1">
            <Progress value={(habit.value / habit.target) * 100} className="h-2" />
          </div>
          <div className="flex justify-between text-sm">
            <span>
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-20 h-8"
                    min="0"
                  />
                  <span className="text-xs text-muted-foreground">/ {habit.target} {habit.unit}</span>
                </div>
              ) : (
                <span>{habit.value} / {habit.target} {habit.unit}</span>
              )}
            </span>
            {habit.completed ? (
              <span className="text-green-500 text-sm flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Completed
              </span>
            ) : (
              <span>{Math.round((habit.value / habit.target) * 100)}%</span>
            )}
          </div>
          
          <div className="flex justify-between gap-2 pt-1">
            {isUpdating ? (
              <>
                <Button size="sm" className="flex-1" onClick={handleUpdate}>Save</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsUpdating(false);
                    setNewValue(habit.value.toString());
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsUpdating(true)}>
                  Update
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Habit Settings</DialogTitle>
                      <DialogDescription>Manage this daily habit</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between items-center">
                        <span>Target</span>
                        <span className="font-medium">{habit.target} {habit.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Current streak</span>
                        <span className="font-medium">{habit.streak} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Last updated</span>
                        <span className="text-sm text-muted-foreground">{habit.lastUpdated}</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => onDelete(habit.id)} className="w-full">
                        Remove Habit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// The add habit dialog component
function AddHabitDialog({ 
  habitTypes, 
  onAdd 
}: { 
  habitTypes: HabitType[], 
  onAdd: (typeId: number, target: number) => void 
}) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [target, setTarget] = useState("");
  
  const selectedHabitType = habitTypes.find(ht => ht.id === selectedType);
  
  const handleAdd = () => {
    if (!selectedType) {
      return;
    }
    
    const parsedTarget = parseInt(target);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return;
    }
    
    onAdd(selectedType, parsedTarget);
    setOpen(false);
    setSelectedType(null);
    setTarget("");
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>Choose a habit to track daily</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-2 py-4">
          {habitTypes.map(type => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-24 p-2"
              onClick={() => {
                setSelectedType(type.id);
                setTarget(type.defaultTarget.toString());
              }}
            >
              {type.icon === 'water' && <Droplets className="h-6 w-6 mb-2" />}
              {type.icon === 'steps' && <Footprints className="h-6 w-6 mb-2" />}
              {type.icon === 'workout' && <Dumbbell className="h-6 w-6 mb-2" />}
              {type.icon === 'check' && <Check className="h-6 w-6 mb-2" />}
              {!['water', 'steps', 'workout', 'check'].includes(type.icon) && <ListChecks className="h-6 w-6 mb-2" />}
              <span className="text-sm">{type.name}</span>
            </Button>
          ))}
        </div>
        
        {selectedHabitType && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Target</label>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="flex-1"
                  min="1"
                />
                <span className="ml-2">{selectedHabitType.unit}</span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={handleAdd} disabled={!selectedType || !target}>
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// The main habits page component
export default function HabitsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch habits data
  const { data: habitsData, isLoading } = useQuery({
    queryKey: ['/api/client/habits'],
    staleTime: 1000 * 60, // 1 minute
  });

  // Update habit value mutation
  const updateHabitMutation = useMutation({
    mutationFn: (data: { id: number, value: number }) => {
      return apiRequest('PATCH', `/api/client/habits/${data.id}`, { value: data.value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/habits'] });
      toast({
        title: "Updated",
        description: "Habit progress has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update",
        description: error.message || "There was an error updating your habit",
        variant: "destructive",
      });
    }
  });

  // Add new habit mutation
  const addHabitMutation = useMutation({
    mutationFn: (data: { typeId: number, target: number }) => {
      return apiRequest('POST', '/api/client/habits', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/habits'] });
      toast({
        title: "Added",
        description: "New habit has been added to your tracking",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add",
        description: error.message || "There was an error adding your habit",
        variant: "destructive",
      });
    }
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/client/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/habits'] });
      toast({
        title: "Removed",
        description: "Habit has been removed from your tracking",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove",
        description: error.message || "There was an error removing your habit",
        variant: "destructive",
      });
    }
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

  // Extract and prepare habit data
  const habits: Habit[] = habitsData?.habits || [];
  const habitTypes: HabitType[] = habitsData?.habitTypes || [];
  const streakInfo = habitsData?.streakInfo || { currentStreak: 0, longestStreak: 0 };
  
  const activeHabits = habits.filter(h => h.active);
  const inactiveHabits = habits.filter(h => !h.active);
  
  // Update a habit's progress
  const handleUpdateHabit = (id: number, value: number) => {
    updateHabitMutation.mutate({ id, value });
  };
  
  // Add a new habit
  const handleAddHabit = (typeId: number, target: number) => {
    addHabitMutation.mutate({ typeId, target });
  };
  
  // Delete a habit
  const handleDeleteHabit = (id: number) => {
    deleteHabitMutation.mutate(id);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg pb-16">
      <div className="flex items-center mb-6">
        <Link href="/progress">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Daily Habits</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold">{streakInfo.currentStreak}</h3>
                <p className="text-sm text-muted-foreground">day streak</p>
              </div>
              <p className="text-sm">Longest streak: {streakInfo.longestStreak} days</p>
            </div>
            <div className="ml-auto">
              <Link href="/progress/stats">
                <Button variant="outline" size="sm">View Stats</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="active">Active Habits</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {activeHabits.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <ListChecks className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Active Habits</h3>
              <p className="text-muted-foreground mb-4">
                Add your first habit to start tracking
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeHabits.map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onUpdate={handleUpdateHabit} 
                  onDelete={handleDeleteHabit} 
                />
              ))}
            </div>
          )}
          
          <AddHabitDialog habitTypes={habitTypes} onAdd={handleAddHabit} />
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          {inactiveHabits.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Completed Habits</h3>
              <p className="text-muted-foreground mb-4">
                Your completed habits will show here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inactiveHabits.map((habit) => (
                <Card key={habit.id} className="bg-muted">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      {habit.icon === 'water' && <Droplets className="h-5 w-5 text-blue-500 mr-2" />}
                      {habit.icon === 'steps' && <Footprints className="h-5 w-5 text-green-500 mr-2" />}
                      {habit.icon === 'workout' && <Dumbbell className="h-5 w-5 text-purple-500 mr-2" />}
                      {!['water', 'steps', 'workout'].includes(habit.icon) && <ListChecks className="h-5 w-5 text-primary mr-2" />}
                      <CardTitle className="text-base">{habit.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>Goal: {habit.target} {habit.unit} daily</span>
                      <span className="text-sm text-muted-foreground">
                        Best streak: {habit.streak} days
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}