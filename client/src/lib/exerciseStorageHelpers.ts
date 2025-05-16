// Local storage keys
export const EXERCISE_STORAGE_KEYS = {
  EXERCISES: 'fitTrainPro_exercises',
};

// Exercise data type
export interface ExerciseData {
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

// Get exercises from local storage
export function getExercisesFromStorage(): ExerciseData[] {
  const storedExercises = localStorage.getItem(EXERCISE_STORAGE_KEYS.EXERCISES);
  return storedExercises ? JSON.parse(storedExercises) : [];
}

// Save exercises to local storage
export function saveExercisesToStorage(exercises: ExerciseData[]): void {
  localStorage.setItem(EXERCISE_STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
}

// Add a new exercise to storage
export function addExerciseToStorage(exercise: Omit<ExerciseData, 'id'>): ExerciseData {
  const exercises = getExercisesFromStorage();
  // Generate a new ID (max id + 1)
  const newId = exercises.length > 0 
    ? Math.max(...exercises.map(e => e.id)) + 1 
    : 1;
  
  const newExercise = {
    ...exercise,
    id: newId,
  } as ExerciseData;
  
  exercises.push(newExercise);
  saveExercisesToStorage(exercises);
  
  return newExercise;
}

// Update an exercise in storage
export function updateExerciseInStorage(id: number, updates: Partial<ExerciseData>): ExerciseData | null {
  const exercises = getExercisesFromStorage();
  const exerciseIndex = exercises.findIndex(e => e.id === id);
  
  if (exerciseIndex === -1) return null;
  
  const updatedExercise = {
    ...exercises[exerciseIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  exercises[exerciseIndex] = updatedExercise;
  saveExercisesToStorage(exercises);
  
  return updatedExercise;
}

// Delete an exercise from storage
export function deleteExerciseFromStorage(id: number): boolean {
  const exercises = getExercisesFromStorage();
  const filteredExercises = exercises.filter(e => e.id !== id);
  
  if (filteredExercises.length === exercises.length) return false;
  
  saveExercisesToStorage(filteredExercises);
  return true;
}

// Initialize exercises storage with sample data if empty
export function initializeExerciseStorage(sampleData: ExerciseData[]): void {
  const existingExercises = getExercisesFromStorage();
  
  if (existingExercises.length === 0) {
    saveExercisesToStorage(sampleData);
  }
}