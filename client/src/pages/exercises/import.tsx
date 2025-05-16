import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Download, AlertCircle, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sample API response structure
interface ExerciseAPIResponse {
  name: string;
  category: string;
  description: string;
  muscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string;
}

// Final exercise format that matches our schema
interface Exercise {
  id: number;
  name: string;
  description: string;
  instructions: string;
  muscleGroup: string;
  secondaryMuscleGroups: string[];
  equipment: string;
  difficulty: string;
  category: string;
  videoUrl: string | null;
  imageUrl: string | null;
  source: string;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Sample exercise API data
const SAMPLE_API_EXERCISES: ExerciseAPIResponse[] = [
  {
    name: "Dumbbell Lateral Raise",
    category: "strength",
    description: "An isolation exercise that targets the lateral deltoid.",
    muscles: ["Shoulders", "Traps"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    instructions: "Stand with dumbbells at your sides. Keep a slight bend in your elbows and raise your arms to the sides until they reach shoulder level. Lower back down with control.",
  },
  {
    name: "Leg Press",
    category: "strength",
    description: "A compound lower body exercise performed on a machine.",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: "Sit in the leg press machine with your feet shoulder-width apart on the platform. Lower the weight until your knees form a 90-degree angle, then press back up without locking your knees.",
  },
  {
    name: "Mountain Climber",
    category: "cardio",
    description: "A bodyweight exercise that engages multiple muscle groups and elevates heart rate.",
    muscles: ["Core", "Shoulders", "Chest", "Legs"],
    equipment: "None",
    difficulty: "Intermediate",
    instructions: "Start in a pushup position with arms and legs straight. Bring one knee toward your chest, then return to starting position while simultaneously bringing the other knee in. Continue alternating rapidly.",
  },
  {
    name: "Tricep Dips",
    category: "strength",
    description: "A bodyweight exercise that targets the triceps muscles.",
    muscles: ["Triceps", "Shoulders", "Chest"],
    equipment: "Bench or Dip Station",
    difficulty: "Intermediate",
    instructions: "Position hands on the edge of a bench or dip bars with fingers pointing forward. Lower your body by bending your elbows until they reach a 90-degree angle, then push back up.",
  },
  {
    name: "Russian Twist",
    category: "strength",
    description: "A core exercise that targets the obliques and abdominal muscles.",
    muscles: ["Obliques", "Abs", "Lower Back"],
    equipment: "Medicine Ball (optional)",
    difficulty: "Intermediate",
    instructions: "Sit on the floor with knees bent and feet lifted slightly. Lean back to create a 45-degree angle with your torso. Clasp your hands together or hold a medicine ball and rotate your torso from side to side.",
  },
];

export default function ExerciseImportPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("api");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importedExercises, setImportedExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Record<number, boolean>>({});
  const [showReviewStep, setShowReviewStep] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileData(selectedFile);
    }
  };

  // Process and parse the file data
  const processFile = async () => {
    if (!fileData) return;

    setIsLoading(true);
    
    try {
      // Read file as text
      const fileContent = await fileData.text();
      
      // Attempt to parse as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error("Invalid JSON format. Please check your file and try again.");
      }
      
      if (!Array.isArray(parsedData)) {
        throw new Error("The file must contain an array of exercises.");
      }
      
      // Convert to our exercise format
      const convertedExercises = parseImportedExercises(parsedData);
      setImportedExercises(convertedExercises);
      
      // Pre-select all exercises
      const initialSelection = convertedExercises.reduce((acc, exercise) => {
        acc[exercise.id] = true;
        return acc;
      }, {} as Record<number, boolean>);
      
      setSelectedExercises(initialSelection);
      setShowReviewStep(true);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import exercises",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process and parse API or JSON data
  const processApiData = () => {
    setIsLoading(true);
    
    try {
      // Simulating API call with our sample data
      setTimeout(() => {
        // Convert to our exercise format
        const convertedExercises = parseImportedExercises(SAMPLE_API_EXERCISES);
        setImportedExercises(convertedExercises);
        
        // Pre-select all exercises
        const initialSelection = convertedExercises.reduce((acc, exercise) => {
          acc[exercise.id] = true;
          return acc;
        }, {} as Record<number, boolean>);
        
        setSelectedExercises(initialSelection);
        setShowReviewStep(true);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching API data:", error);
      toast({
        title: "Import Error",
        description: "Failed to fetch exercises from API",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Process JSON input
  const processJsonInput = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter JSON data",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse JSON input
      let parsedData;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (error) {
        throw new Error("Invalid JSON format. Please check your input and try again.");
      }
      
      if (!Array.isArray(parsedData)) {
        throw new Error("The JSON must contain an array of exercises.");
      }
      
      // Convert to our exercise format
      const convertedExercises = parseImportedExercises(parsedData);
      setImportedExercises(convertedExercises);
      
      // Pre-select all exercises
      const initialSelection = convertedExercises.reduce((acc, exercise) => {
        acc[exercise.id] = true;
        return acc;
      }, {} as Record<number, boolean>);
      
      setSelectedExercises(initialSelection);
      setShowReviewStep(true);
    } catch (error) {
      console.error("Error processing JSON:", error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import exercises",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert imported exercises to our schema format
  const parseImportedExercises = (data: any[]): Exercise[] => {
    // Generate a random ID to avoid collisions with existing exercises
    const randomIdStart = Math.floor(Math.random() * 1000) + 1000;
    
    return data.map((item, index) => {
      // Try to map the imported data to our exercise schema
      let muscleGroup = "Other";
      let secondaryMuscleGroups: string[] = [];
      
      if (Array.isArray(item.muscles) && item.muscles.length > 0) {
        muscleGroup = item.muscles[0];
        secondaryMuscleGroups = item.muscles.slice(1);
      } else if (item.muscleGroup) {
        muscleGroup = item.muscleGroup;
        
        if (Array.isArray(item.secondaryMuscleGroups)) {
          secondaryMuscleGroups = item.secondaryMuscleGroups;
        }
      }
      
      // Map categories to our predefined list
      let category = item.category || "strength";
      if (!["strength", "cardio", "flexibility", "balance", "plyometric", "functional", "sport_specific", "rehabilitation", "other"].includes(category)) {
        category = "other";
      }
      
      // Construct the exercise object
      return {
        id: randomIdStart + index,
        name: item.name || `Exercise ${index + 1}`,
        description: item.description || "",
        instructions: item.instructions || "",
        muscleGroup: muscleGroup,
        secondaryMuscleGroups: secondaryMuscleGroups,
        equipment: item.equipment || "None",
        difficulty: item.difficulty || "Intermediate",
        category: category,
        videoUrl: item.videoUrl || null,
        imageUrl: item.imageUrl || null,
        source: item.source || "Imported",
        isPublic: false,
        isTemplate: true,
        tags: Array.isArray(item.tags) ? item.tags : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  };
  
  // Toggle exercise selection
  const toggleExerciseSelection = (id: number) => {
    setSelectedExercises(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Select or deselect all exercises
  const toggleSelectAll = () => {
    const anySelected = Object.values(selectedExercises).some(value => value);
    
    if (anySelected) {
      // Deselect all
      setSelectedExercises({});
    } else {
      // Select all
      const allSelected = importedExercises.reduce((acc, exercise) => {
        acc[exercise.id] = true;
        return acc;
      }, {} as Record<number, boolean>);
      
      setSelectedExercises(allSelected);
    }
  };
  
  // Import selected exercises
  const importSelectedExercises = () => {
    const selectedExercisesList = importedExercises.filter(ex => selectedExercises[ex.id]);
    
    if (selectedExercisesList.length === 0) {
      toast({
        title: "No Exercises Selected",
        description: "Please select at least one exercise to import",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate progress
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        
        // Update the exercise library
        queryClient.setQueryData(["exercises"], (oldData: any) => {
          return oldData ? [...oldData, ...selectedExercisesList] : selectedExercisesList;
        });
        
        setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Import Successful",
            description: `Imported ${selectedExercisesList.length} exercises to your library`,
          });
          
          // Navigate back to the exercise library
          setLocation("/exercises");
        }, 500);
      }
    }, 300);
  };
  
  // Format the muscle groups for display
  const formatMuscleGroups = (primary: string, secondary: string[]) => {
    return (
      <>
        <Badge variant="outline" className="mr-1">
          {primary}
        </Badge>
        {secondary.map(muscle => (
          <Badge key={muscle} variant="outline" className="mr-1 bg-muted/40">
            {muscle}
          </Badge>
        ))}
      </>
    );
  };
  
  // Initiate import based on active tab
  const handleImport = () => {
    if (activeTab === "file") {
      processFile();
    } else if (activeTab === "api") {
      processApiData();
    } else if (activeTab === "json") {
      processJsonInput();
    }
  };
  
  // Back to the import selection view
  const handleBack = () => {
    setShowReviewStep(false);
    setImportedExercises([]);
    setSelectedExercises({});
    setProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileData(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Import Exercises</h1>
          <p className="text-muted-foreground">
            Add exercises to your library from external sources
          </p>
        </div>
      </div>
      
      {!showReviewStep ? (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Import Source</CardTitle>
            <CardDescription>
              Choose how you want to import exercises to your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="file">File Upload</TabsTrigger>
                <TabsTrigger value="json">JSON Input</TabsTrigger>
              </TabsList>
              
              <TabsContent value="api" className="space-y-4">
                <div>
                  <Label htmlFor="api-url">API URL</Label>
                  <Input 
                    id="api-url"
                    placeholder="https://api.example.com/exercises" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For demo purposes, we'll use sample data instead of making a real API call
                  </p>
                </div>
                <div>
                  <Label htmlFor="api-key">API Key (if required)</Label>
                  <Input 
                    id="api-key"
                    type="password"
                    placeholder="Your API key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>API Import</AlertTitle>
                  <AlertDescription>
                    For this demo, we'll import sample exercises instead of connecting to a real API.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input 
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Import exercises from a JSON file (.json)
                  </p>
                </div>
                
                {fileData && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>File Selected</AlertTitle>
                    <AlertDescription>
                      {fileData.name} ({(fileData.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="json" className="space-y-4">
                <div>
                  <Label htmlFor="json-input">Paste JSON Data</Label>
                  <Textarea 
                    id="json-input"
                    placeholder='[{"name": "Exercise Name", "description": "Description", "muscles": ["Primary Muscle", "Secondary Muscle"], "equipment": "Equipment", "difficulty": "Difficulty", "instructions": "Instructions"}]'
                    className="min-h-[200px] font-mono text-sm"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a valid JSON array of exercises
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLocation("/exercises")}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isLoading || (activeTab === "file" && !fileData)}
            >
              {isLoading ? "Processing..." : "Import Exercises"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Review Exercises</CardTitle>
              <CardDescription>
                Select the exercises you want to import to your library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {Object.values(selectedExercises).some(value => value)
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  <span className="ml-4 text-sm text-muted-foreground">
                    {Object.values(selectedExercises).filter(Boolean).length} of {importedExercises.length} selected
                  </span>
                </div>
              </div>
              
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {importedExercises.map(exercise => (
                    <Card key={exercise.id} className={`border ${selectedExercises[exercise.id] ? 'border-primary' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{exercise.name}</CardTitle>
                            <CardDescription>
                              {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)} • {exercise.difficulty}
                            </CardDescription>
                          </div>
                          <Button
                            variant={selectedExercises[exercise.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleExerciseSelection(exercise.id)}
                          >
                            {selectedExercises[exercise.id] ? (
                              <>
                                <Check className="mr-1 h-4 w-4" />
                                Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">{exercise.description}</p>
                        <div className="mb-2">
                          <span className="text-sm font-medium">Muscles: </span>
                          {formatMuscleGroups(exercise.muscleGroup, exercise.secondaryMuscleGroups)}
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium">Equipment: </span>
                          <span className="text-sm">{exercise.equipment}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Instructions: </span>
                          <p className="text-sm">{exercise.instructions}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
              <div className="flex items-center gap-4">
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-[200px]" />
                    <span className="text-sm">{progress}%</span>
                  </div>
                )}
                <Button 
                  onClick={importSelectedExercises}
                  disabled={isLoading || Object.values(selectedExercises).filter(Boolean).length === 0}
                >
                  {isLoading ? "Importing..." : "Import Selected Exercises"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}